import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(_:Request,{params}:{params:{id:string}}){
  const s=await prisma.student.findUnique({where:{id:Number(params.id)},include:{semester:true,department:true}})
  if(!s)return NextResponse.json({error:'Not found'},{status:404})
  return NextResponse.json(s)
}
export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  try{
    const st=await prisma.student.update({where:{id:Number(params.id)},data:{name:body.name,rollNo:body.rollNo,examRoll:body.examRoll,phone:body.phone||undefined,email:body.email||undefined,guardianName:body.guardianName||undefined,guardianPhone:body.guardianPhone||undefined,address:body.address||undefined,gender:body.gender||undefined,semId:body.semId?Number(body.semId):undefined,yearOfStudy:body.yearOfStudy?Number(body.yearOfStudy):undefined,isActive:body.isActive}})
    return NextResponse.json(st)
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
export async function DELETE(_:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  try{
    await prisma.student.update({where:{id:Number(params.id)},data:{isActive:false}})
    return NextResponse.json({ok:true})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
