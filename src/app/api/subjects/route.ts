export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const params = new URL(req.url).searchParams
  const semId = params.get('semId')
  const where: any = {}
  if (session.user.role !== 'SUPER_ADMIN') {
    where.deptId = Number(session.user.deptId)
  }
  if (semId) where.semId = Number(semId)

  const subjects = await prisma.subject.findMany({
    where,
    include: {
      teacher: {select: {id: true, name: true}},
      semester: {select: {id: true, semNumber: true, yearOfStudy: true}},
    },
    orderBy: {code: 'asc'},
  })
  return NextResponse.json(subjects)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'TEACHER')
    return NextResponse.json({error: 'Forbidden'}, {status: 403})

  const body = await req.json()
  if (!body.name || !body.code || !body.semId)
    return NextResponse.json({error: 'Name, code and semester are required'}, {status: 400})

  const deptId = session.user.role === 'SUPER_ADMIN'
    ? body.deptId ? Number(body.deptId) : undefined
    : Number(session.user.deptId)
  if (!deptId) return NextResponse.json({error: 'Department is required'}, {status: 400})

  try {
    const subject = await prisma.subject.create({
      data: {
        deptId,
        semId: Number(body.semId),
        code: body.code.toUpperCase(),
        name: body.name,
        credits: body.credits ? Number(body.credits) : 4,
        teacherId: body.teacherId ? Number(body.teacherId) : null,
        isActive: true,
      },
    })
    return NextResponse.json(subject, {status: 201})
  } catch (error: any) {
    return NextResponse.json({error: error?.message || 'Unable to create subject'}, {status: 400})
  }
}

export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  try{
    const sub=await prisma.subject.update({where:{id:Number(params.id)},data:{name:body.name,code:body.code?.toUpperCase(),credits:body.credits?Number(body.credits):undefined,teacherId:body.teacherId?Number(body.teacherId):null,isActive:body.isActive}})
    return NextResponse.json(sub)
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
export async function DELETE(_:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  try{
    await prisma.subject.update({where:{id:Number(params.id)},data:{isActive:false}})
    return NextResponse.json({ok:true})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
