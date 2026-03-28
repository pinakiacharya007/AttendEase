import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
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
