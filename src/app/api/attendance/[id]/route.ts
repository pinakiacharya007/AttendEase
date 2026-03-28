import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  try{
    const att=await prisma.attendance.update({where:{id:Number(params.id)},data:{status:body.status,remarks:body.remarks||undefined}})
    return NextResponse.json(att)
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
