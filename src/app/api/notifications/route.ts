import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const n=await prisma.notification.findMany({where:{userId:Number(s.user.id)},orderBy:{createdAt:'desc'},take:50})
  return NextResponse.json(n)
}
