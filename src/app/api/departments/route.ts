import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(){
  const depts=await prisma.department.findMany({include:{hod:{select:{id:true,name:true,username:true}}},orderBy:{name:'asc'}})
  return NextResponse.json(depts)
}
export async function POST(req:Request){
  const s=await getServerSession(authOptions)
  if(s?.user?.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  try{
    const d=await prisma.department.create({data:{name:body.name,code:body.code.toUpperCase(),programmeType:body.programmeType||'UG',totalYears:Number(body.totalYears)||3,rollPrefix:body.rollPrefix||body.code.substring(0,2).toUpperCase(),examRollPrefix:body.examRollPrefix||body.code.substring(0,2).toUpperCase()}})
    return NextResponse.json(d,{status:201})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
