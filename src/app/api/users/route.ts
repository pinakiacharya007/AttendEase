export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
import {UserRole} from '@prisma/client'
import bcrypt from 'bcryptjs'

const VALID_ROLES: UserRole[] = ['SUPER_ADMIN', 'HOD', 'TEACHER']

export async function GET(req: Request) {
  const url = new URL(req.url)
  const role = url.searchParams.get('role')?.toUpperCase() as UserRole | undefined
  const where = role && VALID_ROLES.includes(role) ? {role} : {}

  const users = await prisma.user.findMany({
    where,
    orderBy: {name: 'asc'},
    include: {department: {select: {id: true, name: true, code: true}}},
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SUPER_ADMIN')
    return NextResponse.json({error: 'Forbidden'}, {status: 403})

  const body = await req.json()
  if (!body.name || !body.username || !body.password || !body.role) {
    return NextResponse.json({error: 'Name, username, password and role are required'}, {status: 400})
  }

  const role = body.role.toUpperCase()
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({error: 'Invalid role'}, {status: 400})
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: body.name,
        username: body.username.toLowerCase(),
        passwordHash: await bcrypt.hash(body.password, 12),
        email: body.email || undefined,
        phone: body.phone || undefined,
        role,
        deptId: body.deptId ? Number(body.deptId) : undefined,
      },
    })
    return NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      deptId: user.deptId,
    }, {status: 201})
  } catch (error: any) {
    return NextResponse.json({error: error?.message || 'Unable to create user'}, {status: 400})
  }
}

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
