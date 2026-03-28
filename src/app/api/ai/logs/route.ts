import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(req:Request){
  const s=await getServerSession(authOptions)
  if(s?.user?.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403})
  const page=Number(new URL(req.url).searchParams.get('page')||1)
  const take=30;const skip=(page-1)*take
  const [logs,total]=await Promise.all([
    prisma.aiLog.findMany({orderBy:{createdAt:'desc'},take,skip,include:{user:{select:{name:true,username:true}}}}),
    prisma.aiLog.count()
  ])
  return NextResponse.json({logs,total,pages:Math.ceil(total/take)})
}
