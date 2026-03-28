import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

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