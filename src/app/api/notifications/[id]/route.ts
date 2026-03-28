export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function PATCH(_:Request,{params}:{params:{id:string}}){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  await prisma.notification.update({where:{id:Number(params.id)},data:{isRead:true}})
  return NextResponse.json({ok:true})
}
