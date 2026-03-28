export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
import bcrypt from 'bcryptjs'
export async function GET(){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const u=await prisma.user.findUnique({where:{id:Number(s.user.id)},select:{id:true,name:true,email:true,username:true,phone:true,role:true,lastLoginAt:true,department:{select:{name:true,code:true}}}})
  return NextResponse.json(u)
}
export async function PATCH(req:Request){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  const update:any={name:body.name,email:body.email||undefined,phone:body.phone||undefined}
  if(body.newPassword){
    const u=await prisma.user.findUnique({where:{id:Number(s.user.id)}})
    if(!u||!await bcrypt.compare(body.currentPassword,u.passwordHash))return NextResponse.json({error:'Current password incorrect'},{status:400})
    update.passwordHash=await bcrypt.hash(body.newPassword,12)
  }
  try{
    await prisma.user.update({where:{id:Number(s.user.id)},data:update})
    return NextResponse.json({ok:true})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
