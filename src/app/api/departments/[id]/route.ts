import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(_:Request,{params}:{params:{id:string}}){
  const d=await prisma.department.findUnique({where:{id:Number(params.id)},include:{hod:{select:{id:true,name:true,username:true}}}})
  if(!d)return NextResponse.json({error:'Not found'},{status:404})
  return NextResponse.json(d)
}
export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(s?.user?.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  try{
    const d=await prisma.department.update({where:{id:Number(params.id)},data:{name:body.name,code:body.code?.toUpperCase(),programmeType:body.programmeType,totalYears:body.totalYears?Number(body.totalYears):undefined,rollPrefix:body.rollPrefix,examRollPrefix:body.examRollPrefix,isActive:body.isActive}})
    return NextResponse.json(d)
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
export async function DELETE(_:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(s?.user?.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403})
  try{
    await prisma.department.delete({where:{id:Number(params.id)}})
    return NextResponse.json({ok:true})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
