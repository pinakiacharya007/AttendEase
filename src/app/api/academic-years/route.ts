export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

export async function GET(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s) return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  const params = new URL(req.url).searchParams
  const deptId = s.user.role === 'SUPER_ADMIN'
    ? params.get('deptId') ? Number(params.get('deptId')) : undefined
    : Number(s.user.deptId)
  const where: any = {}
  if (deptId) where.deptId = deptId
  const ays = await prisma.academicYear.findMany({where, orderBy: {startDate: 'desc'}})
  return NextResponse.json(ays)
}

export async function POST(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role === 'TEACHER') return NextResponse.json({error: 'Forbidden'}, {status: 403})
  const body = await req.json()
  if (!body.label || !body.startDate || !body.endDate)
    return NextResponse.json({error: 'Label, start date and end date are required'}, {status: 400})
  try {
    const deptId = s.user.role === 'HOD' ? Number(s.user.deptId) : Number(body.deptId)
    if (!deptId) return NextResponse.json({error: 'Department is required'}, {status: 400})
    if (body.isCurrent) await prisma.academicYear.updateMany({where: {deptId}, data: {isCurrent: false}})
    const ay = await prisma.academicYear.create({
      data: {deptId, label: body.label, startDate: new Date(body.startDate), endDate: new Date(body.endDate), isCurrent: body.isCurrent ?? false}
    })
    return NextResponse.json(ay, {status: 201})
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({error: 'An academic year with this label already exists'}, {status: 400})
    return NextResponse.json({error: e.message}, {status: 400})
  }
}

export async function PATCH(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role === 'TEACHER') return NextResponse.json({error: 'Forbidden'}, {status: 403})
  const body = await req.json()
  const {id, ...data} = body
  if (!id) return NextResponse.json({error: 'ID required'}, {status: 400})
  try {
    const existing = await prisma.academicYear.findUnique({where: {id: Number(id)}})
    if (!existing) return NextResponse.json({error: 'Not found'}, {status: 404})
    if (s.user.role === 'HOD' && existing.deptId !== Number(s.user.deptId))
      return NextResponse.json({error: 'Forbidden'}, {status: 403})
    if (data.isCurrent) await prisma.academicYear.updateMany({where: {deptId: existing.deptId}, data: {isCurrent: false}})
    const updated = await prisma.academicYear.update({
      where: {id: Number(id)},
      data: {
        label: data.label,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isCurrent: data.isCurrent ?? undefined
      }
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({error: 'An academic year with this label already exists'}, {status: 400})
    return NextResponse.json({error: e.message}, {status: 400})
  }
}

export async function DELETE(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role === 'TEACHER') return NextResponse.json({error: 'Forbidden'}, {status: 403})
  const {id} = await req.json()
  if (!id) return NextResponse.json({error: 'ID required'}, {status: 400})
  try {
    const existing = await prisma.academicYear.findUnique({where: {id: Number(id)}})
    if (!existing) return NextResponse.json({error: 'Not found'}, {status: 404})
    if (s.user.role === 'HOD' && existing.deptId !== Number(s.user.deptId))
      return NextResponse.json({error: 'Forbidden'}, {status: 403})
    await prisma.academicYear.delete({where: {id: Number(id)}})
    return NextResponse.json({success: true})
  } catch (e: any) {
    if (e.code === 'P2003') return NextResponse.json({error: 'Cannot delete — semesters exist under this academic year. Delete them first.'}, {status: 400})
    return NextResponse.json({error: e.message}, {status: 400})
  }
}