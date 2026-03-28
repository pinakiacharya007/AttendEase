export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
import bcrypt from 'bcryptjs'
export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  const update:any={name:body.name,email:body.email||undefined,phone:body.phone||undefined,isActive:body.isActive}
  if(body.password)update.passwordHash=await bcrypt.hash(body.password,12)
  try{
    const u=await prisma.user.update({where:{id:Number(params.id)},data:update})
    return NextResponse.json({id:u.id,name:u.name})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
export async function DELETE(_:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s||!['SUPER_ADMIN','HOD'].includes(s.user.role))return NextResponse.json({error:'Forbidden'},{status:403})
  try{
    await prisma.user.update({where:{id:Number(params.id)},data:{isActive:false}})
    return NextResponse.json({ok:true})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
