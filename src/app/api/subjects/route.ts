export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(req:Request){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {searchParams}=new URL(req.url)
  const semId=searchParams.get('semId')
  const deptId=s.user.role==='SUPER_ADMIN'?searchParams.get('deptId')?Number(searchParams.get('deptId')):undefined:Number(s.user.deptId)
  const teacherId=searchParams.get('teacherId')
  const where:any={isActive:true}
  if(deptId)where.deptId=deptId
  if(semId)where.semId=Number(semId)
  if(teacherId)where.teacherId=Number(teacherId)
  const subs=await prisma.subject.findMany({where,include:{teacher:{select:{id:true,name:true}},semester:{select:{semNumber:true,yearOfStudy:true}}},orderBy:{name:'asc'}})
  return NextResponse.json(subs)
}
export async function POST(req:Request){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  try{
    const deptId=s.user.role==='HOD'?Number(s.user.deptId):Number(body.deptId)
    const sub=await prisma.subject.create({data:{deptId,semId:Number(body.semId),code:body.code.toUpperCase(),name:body.name,credits:Number(body.credits)||4,teacherId:body.teacherId?Number(body.teacherId):undefined}})
    return NextResponse.json(sub,{status:201})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
