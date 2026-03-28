import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

export async function GET() {
  const rows = await prisma.setting.findMany({where: {scope: 'GLOBAL', deptId: null}})
  const obj: Record<string, string> = {}
  for (const r of rows) obj[r.key] = r.value
  return NextResponse.json(obj)
}

export async function POST(req: Request) {
  const s = await getServerSession(authOptions)
  if (s?.user?.role !== 'SUPER_ADMIN') return NextResponse.json({error: 'Forbidden'}, {status: 403})
  const body = await req.json()
  for (const [key, value] of Object.entries(body)) {
    const existing = await prisma.setting.findFirst({where: {key, scope: 'GLOBAL', deptId: null}})
    if (existing) {
      await prisma.setting.update({where: {id: existing.id}, data: {value: String(value)}})
    } else {
      await prisma.setting.create({data: {key, value: String(value), scope: 'GLOBAL', deptId: null}})
    }
  }
  return NextResponse.json({ok: true})
}