import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
import bcrypt from 'bcryptjs'
export async function GET(req:Request){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {searchParams}=new URL(req.url)
  const role=searchParams.get('role')
  const deptId=searchParams.get('deptId')
  const where:any={}
  if(role)where.role=role
  if(deptId)where.deptId=Number(deptId)
  else if(s.user.role!=='SUPER_ADMIN')where.deptId=Number(s.user.deptId)
  const users=await prisma.user.findMany({where,select:{id:true,name:true,email:true,username:true,role:true,deptId:true,phone:true,isActive:true,lastLoginAt:true,department:{select:{name:true,code:true}}},orderBy:{name:'asc'}})
  return NextResponse.json(users)
}
export async function POST(req:Request){
  const s=await getServerSession(authOptions)
  if(!s||!['SUPER_ADMIN','HOD'].includes(s.user.role))return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  try{
    const hash=await bcrypt.hash(body.password,12)
    const deptId=s.user.role==='HOD'?Number(s.user.deptId):body.deptId?Number(body.deptId):undefined
    const u=await prisma.user.create({data:{name:body.name,email:body.email||undefined,username:body.username.trim().toLowerCase(),passwordHash:hash,role:body.role||'TEACHER',deptId,phone:body.phone||undefined}})
    return NextResponse.json({id:u.id,name:u.name,username:u.username,role:u.role},{status:201})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
