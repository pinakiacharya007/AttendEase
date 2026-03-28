export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

export async function POST(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const body = await req.json()
  const {message, history} = body
  if (!message) return NextResponse.json({error: 'Message required'}, {status: 400})

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({error: 'AI not configured'}, {status: 503})

  function rateLimitResponse() {
    return NextResponse.json({
      action: 'error',
      message: 'AI is temporarily rate-limited. Please wait a moment and try again.'
    })
  }

  const deptId = s.user.deptId ? Number(s.user.deptId) : null
  let ctxStr = ''

  if (deptId) {
    const sems = await prisma.semester.findMany({
      where: {deptId, isActive: true},
      select: {id: true, semNumber: true, yearOfStudy: true}
    })
    const subjects = await prisma.subject.findMany({
      where: {deptId, isActive: true},
      select: {id: true, name: true, code: true, semId: true}
    })
    const students = await prisma.student.findMany({
      where: {deptId, isActive: true},
      select: {id: true, name: true, rollNo: true, semId: true},
      take: 150
    })

    ctxStr = `Dept: ${s.user.deptName} (${s.user.deptCode}) | User: ${s.user.name} | Date: ${new Date().toISOString().split('T')[0]}
Semesters: ${JSON.stringify(sems)}
Subjects: ${JSON.stringify(subjects)}
Students: ${JSON.stringify(students)}`
  }

  const systemPrompt = `You are AttendEase AI, an attendance assistant. Always reply with a single valid JSON object only — no markdown, no explanation outside JSON.

${ctxStr}

JSON formats:
- Marking attendance: {"action":"mark_attendance","message":"confirmation","data":{"records":[{"studentId":N,"subjectId":N,"date":"YYYY-MM-DD","status":"PRESENT|ABSENT|LEAVE"}]}}
- Query/insight: {"action":"query","message":"your answer"}
- Conversation/help: {"action":"chat","message":"your answer"}
- Unclear input: {"action":"error","message":"what you need clarified"}

Rules:
- Only use IDs from the context above
- "All present" = every student in that sem marked PRESENT
- Be concise in message fields
- Today: ${new Date().toISOString().split('T')[0]}`

  const turns: any[] = []
  if (Array.isArray(history)) {
    for (const h of history.slice(-6)) {
      turns.push({role: h.role === 'user' ? 'user' : 'model', parts: [{text: h.text}]})
    }
  }
  turns.push({role: 'user', parts: [{text: message}]})

  try {
    const res = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          max_tokens: 1024,
          response_format: {type: 'json_object'},
          messages: [
            {role: 'system', content: systemPrompt},
            ...turns.map((t: any) => ({
              role: t.role === 'model' ? 'assistant' : t.role,
              content: t.parts[0].text
            }))
          ]
        })
      }
    )

    const json = await res.json()
console.log('[GROQ STATUS]', res.status)
console.log('[GROQ RESPONSE]', JSON.stringify(json, null, 2))

    if (json.error) {
      if (json.error.code === 429 || json.error.type === 'rate_limit_exceeded') return rateLimitResponse()
      return NextResponse.json({action: 'error', message: `API error: ${json.error.message}`})
    }

    const raw = json.choices?.[0]?.message?.content ?? ''
    let parsed: any = {action: 'chat', message: raw}
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch {}

    await prisma.aiLog.create({
      data: {
        userId: Number(s.user.id),
        inputText: message,
        parsedOutput: JSON.stringify(parsed),
        actionTaken: parsed.action,
        success: true
      }
    })

    return NextResponse.json(parsed)
  } catch (e: any) {
    await prisma.aiLog.create({
      data: {userId: Number(s.user.id), inputText: message, success: false, actionTaken: 'error'}
    })
    return NextResponse.json({error: e.message}, {status: 500})
  }
}
