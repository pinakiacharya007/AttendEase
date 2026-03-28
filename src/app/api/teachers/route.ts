export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(){
  const session=await getServerSession(authOptions)
  if(!session||session.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  const deptId=session.user.role==='SUPER_ADMIN'?undefined:Number(session.user.deptId)
  const where:any={role:'TEACHER',isActive:true}
  if(deptId)where.deptId=deptId
  return NextResponse.json(await prisma.user.findMany({where,select:{id:true,name:true,username:true,email:true,phone:true,isActive:true,lastLoginAt:true,createdAt:true,subjectsTaught:{select:{id:true,name:true,code:true}}},orderBy:{name:'asc'}}))
}
