export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'

export async function GET(req: Request) {
  const s = await getServerSession(authOptions)
  if (!s) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const params = new URL(req.url).searchParams
  const q = params.get('q')?.trim()
  const semId = params.get('semId')
  const where: any = {}

  if (s.user.role !== 'SUPER_ADMIN') {
    if (!s.user.deptId) return NextResponse.json([], {status: 200})
    where.deptId = Number(s.user.deptId)
  }
  if (semId) where.semId = Number(semId)
  if (q) {
    where.OR = [
      {name: {contains: q, mode: 'insensitive'}},
      {rollNo: {contains: q, mode: 'insensitive'}},
      {examRoll: {contains: q, mode: 'insensitive'}},
    ]
  }

  const students = await prisma.student.findMany({
    where,
    orderBy: {rollNo: 'asc'},
    include: {semester: true, department: true},
  })
  return NextResponse.json(students)
}

export async function POST(req:Request){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  const {students,semId}=body
  if(!Array.isArray(students)||!semId)return NextResponse.json({error:'Invalid data'},{status:400})
  const deptId=Number(s.user.deptId)
  let created=0;let skipped=0;const errors:string[]=[]
  for(const st of students){
    try{
      await prisma.student.upsert({where:{deptId_rollNo:{deptId,rollNo:st.rollNo}},update:{name:st.name,examRoll:st.examRoll,phone:st.phone||undefined,email:st.email||undefined,semId:Number(semId),yearOfStudy:Number(st.yearOfStudy)||1},create:{deptId,semId:Number(semId),rollNo:st.rollNo,examRoll:st.examRoll||st.rollNo,name:st.name,phone:st.phone||undefined,email:st.email||undefined,yearOfStudy:Number(st.yearOfStudy)||1}})
      created++
    }catch(e:any){skipped++;errors.push(`${st.rollNo}: ${e.message}`)}
  }
  return NextResponse.json({created,skipped,errors})
}
