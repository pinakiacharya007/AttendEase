export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(req:Request){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const deptId=s.user.deptId?Number(s.user.deptId):undefined
  const holidays=await prisma.holiday.findMany({where:{OR:[{isGlobal:true},{deptId}]},orderBy:{date:'asc'}})
  return NextResponse.json(holidays)
}
export async function POST(req:Request){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  try{
    const deptId=body.isGlobal?null:s.user.deptId?Number(s.user.deptId):null
    const h=await prisma.holiday.create({data:{date:new Date(body.date),reason:body.reason,isGlobal:s.user.role==='SUPER_ADMIN'?body.isGlobal??false:false,deptId}})
    return NextResponse.json(h,{status:201})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
export async function DELETE(req:Request){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  const {id}=await req.json()
  try{
    await prisma.holiday.delete({where:{id:Number(id)}})
    return NextResponse.json({ok:true})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
