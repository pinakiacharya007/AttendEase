export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

export async function GET() {
  const departments = await prisma.department.findMany({
    orderBy: {name: 'asc'},
    include: {hod: {select: {id: true, name: true, username: true}}},
  })
  return NextResponse.json(departments)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'SUPER_ADMIN')
    return NextResponse.json({error: 'Forbidden'}, {status: 403})

  const body = await req.json()
  if (!body.name || !body.code) {
    return NextResponse.json({error: 'Name and code are required'}, {status: 400})
  }

  try {
    const department = await prisma.department.create({
      data: {
        name: body.name,
        code: body.code?.toUpperCase(),
        programmeType: body.programmeType || 'UG',
        totalYears: body.totalYears ? Number(body.totalYears) : 3,
        rollPrefix: body.rollPrefix,
        examRollPrefix: body.examRollPrefix,
      },
    })
    return NextResponse.json(department, {status: 201})
  } catch (error: any) {
    return NextResponse.json({error: error?.message || 'Unable to create department'}, {status: 400})
  }
}
