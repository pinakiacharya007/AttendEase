export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

export async function GET(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const {searchParams} = new URL(req.url)
  const deptId = s.user.role === 'SUPER_ADMIN'
    ? searchParams.get('deptId') ? Number(searchParams.get('deptId')) : undefined
    : Number(s.user.deptId)

  const ayId = searchParams.get('academicYearId')
  const where: any = {}
  if (deptId) where.deptId = deptId
  if (ayId) where.academicYearId = Number(ayId)

  const sems = await prisma.semester.findMany({
    where,
    include: {academicYear: {select: {label: true, isCurrent: true}}},
    orderBy: [{academicYearId: 'desc'}, {semNumber: 'asc'}]
  })
  return NextResponse.json(sems)
}

export async function POST(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role === 'TEACHER') return NextResponse.json({error: 'Forbidden'}, {status: 403})

  const body = await req.json()
  const deptId = s.user.role === 'HOD' ? Number(s.user.deptId) : Number(body.deptId)

  if (!deptId) return NextResponse.json({error: 'Department required'}, {status: 400})
  if (!body.academicYearId) return NextResponse.json({error: 'Academic year required'}, {status: 400})
  if (!body.semNumber) return NextResponse.json({error: 'Semester number required'}, {status: 400})
  if (!body.startDate || !body.endDate) return NextResponse.json({error: 'Dates required'}, {status: 400})

  const ay = await prisma.academicYear.findFirst({where: {id: Number(body.academicYearId), deptId}})
  if (!ay) return NextResponse.json({error: 'Invalid academic year'}, {status: 400})

  const semNum = Number(body.semNumber)
  const yearOfStudy = Math.ceil(semNum / 2)

  try {
    if (body.isActive) {
      await prisma.semester.updateMany({where: {deptId}, data: {isActive: false}})
    }
    const sem = await prisma.semester.create({
      data: {
        deptId,
        academicYearId: Number(body.academicYearId),
        semNumber: semNum,
        yearOfStudy,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isActive: body.isActive ?? false
      }
    })
    return NextResponse.json(sem, {status: 201})
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({error: `Semester ${semNum} already exists for this academic year`}, {status: 400})
    return NextResponse.json({error: e.message}, {status: 400})
  }
}
