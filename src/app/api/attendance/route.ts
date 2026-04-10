export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

export async function GET(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const params = new URL(req.url).searchParams
  const where: any = {}
  if (params.get('studentId')) where.studentId = Number(params.get('studentId'))
  if (params.get('subjectId')) where.subjectId = Number(params.get('subjectId'))
  if (params.get('date')) where.date = new Date(params.get('date')!)
  if (params.get('from') || params.get('to')) {
    where.date = {}
    if (params.get('from')) where.date.gte = new Date(params.get('from')!)
    if (params.get('to')) where.date.lte = new Date(params.get('to')!)
  }
  if (s.user.role !== 'SUPER_ADMIN') {
    const deptId = Number(s.user.deptId)
    if (deptId) where.student = {deptId}
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      student: {select: {id: true, name: true, rollNo: true}},
      subject: {select: {id: true, name: true, code: true}},
    },
    orderBy: {date: 'desc'},
  })
  return NextResponse.json(records)
}

export async function POST(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const body = await req.json()
  const records = Array.isArray(body.records) ? body.records : []
  if (records.length === 0) return NextResponse.json({error: 'No attendance records provided'}, {status: 400})

  const markedById = Number(s.user.id)
  const result = {created: 0, updated: 0, skipped: 0}

  for (const rec of records) {
    try {
      const attendance = await prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: Number(rec.studentId),
            subjectId: Number(rec.subjectId),
            date: new Date(rec.date),
          },
        },
        update: {
          status: rec.status,
          remarks: rec.remarks || undefined,
          markedById,
          source: rec.source || 'MANUAL',
        },
        create: {
          studentId: Number(rec.studentId),
          subjectId: Number(rec.subjectId),
          date: new Date(rec.date),
          status: rec.status,
          markedById,
          source: rec.source || 'MANUAL',
          remarks: rec.remarks || undefined,
        },
      })
      if (attendance) {
        // upsert returns the record; we can treat existing records as updates
        result.updated += 1
      } else {
        result.created += 1
      }
    } catch (e) {
      result.skipped += 1
    }
  }

  return NextResponse.json(result)
}

export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  try{
    const att=await prisma.attendance.update({where:{id:Number(params.id)},data:{status:body.status,remarks:body.remarks||undefined}})
    return NextResponse.json(att)
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
