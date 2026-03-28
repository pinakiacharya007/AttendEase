import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import bcrypt from 'bcryptjs'
export async function POST(req:Request){
  try{
    const body=await req.json()
    const {uniName,uniShort,adminName,adminUsername,adminPassword}=body
    if(!uniName||!adminUsername||!adminPassword)return NextResponse.json({error:'Missing fields'},{status:400})
    const exists=await prisma.university.findFirst()
    if(exists?.isSetup)return NextResponse.json({error:'Already set up'},{status:400})
    const hash=await bcrypt.hash(adminPassword,12)
    await prisma.$transaction(async tx=>{
      if(exists)await tx.university.update({where:{id:exists.id},data:{name:uniName,shortName:uniShort||uniName,isSetup:true}})
      else await tx.university.create({data:{name:uniName,shortName:uniShort||uniName,isSetup:true}})
      const existing=await tx.user.findUnique({where:{username:adminUsername}})
      if(!existing)await tx.user.create({data:{name:adminName||'Super Admin',username:adminUsername,passwordHash:hash,role:'SUPER_ADMIN'}})
    })
    return NextResponse.json({ok:true})
  }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
export async function GET(){
  const u=await prisma.university.findFirst()
  return NextResponse.json({isSetup:u?.isSetup??false,name:u?.name??''})
}
