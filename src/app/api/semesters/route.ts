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
  if (params.get('academicYearId')) where.academicYearId = Number(params.get('academicYearId'))

  const semesters = await prisma.semester.findMany({
    where,
    include: {academicYear: {select: {id: true, label: true}}},
    orderBy: [{academicYearId: 'desc'}, {semNumber: 'asc'}],
  })
  return NextResponse.json(semesters)
}

export async function POST(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role === 'TEACHER') return NextResponse.json({error: 'Forbidden'}, {status: 403})

  const body = await req.json()
  if (!body.semNumber || !body.startDate || !body.endDate || !body.academicYearId)
    return NextResponse.json({error: 'Semester number, start date, end date and academic year are required'}, {status: 400})

  const deptId = s.user.role === 'HOD' ? Number(s.user.deptId) : Number(body.deptId)
  if (!deptId) return NextResponse.json({error: 'Department is required'}, {status: 400})

  const semNumber = Number(body.semNumber)
  const data: any = {
    deptId,
    academicYearId: Number(body.academicYearId),
    semNumber,
    yearOfStudy: Math.ceil(semNumber / 2),
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    isActive: body.isActive ?? false,
  }

  try {
    if (data.isActive) {
      await prisma.semester.updateMany({where: {deptId}, data: {isActive: false}})
    }
    const semester = await prisma.semester.create({data})
    return NextResponse.json(semester, {status: 201})
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 400})
  }
}

export async function PATCH(req: Request, {params}: {params: {id: string}}) {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role === 'TEACHER') return NextResponse.json({error: 'Forbidden'}, {status: 403})

  const body = await req.json()
  const id = Number(params.id)
  const deptId = s.user.role === 'HOD' ? Number(s.user.deptId) : undefined

  const existing = await prisma.semester.findFirst({where: {id, ...(deptId ? {deptId} : {})}})
  if (!existing) return NextResponse.json({error: 'Not found'}, {status: 404})

  try {
    if (body.isActive) {
      await prisma.semester.updateMany({where: {deptId: existing.deptId, id: {not: id}}, data: {isActive: false}})
    }
    const semNum = body.semNumber ? Number(body.semNumber) : existing.semNumber
    const sem = await prisma.semester.update({
      where: {id},
      data: {
        semNumber: semNum,
        yearOfStudy: Math.ceil(semNum / 2),
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        isActive: body.isActive ?? undefined
      }
    })
    return NextResponse.json(sem)
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 400})
  }
}

export async function DELETE(req: Request, {params}: {params: {id: string}}) {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role === 'TEACHER') return NextResponse.json({error: 'Forbidden'}, {status: 403})

  const id = Number(params.id)
  const deptId = s.user.role === 'HOD' ? Number(s.user.deptId) : undefined

  const existing = await prisma.semester.findFirst({where: {id, ...(deptId ? {deptId} : {})}})
  if (!existing) return NextResponse.json({error: 'Not found'}, {status: 404})

  const studentCount = await prisma.student.count({where: {semId: id}})
  if (studentCount > 0) return NextResponse.json({error: `Cannot delete — ${studentCount} student(s) are assigned to this semester`}, {status: 400})

  await prisma.semester.delete({where: {id}})
  return NextResponse.json({success: true})
}
