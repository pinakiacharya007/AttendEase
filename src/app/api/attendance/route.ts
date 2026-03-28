export const dynamic = 'force-dynamic'

import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(req:Request){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {searchParams}=new URL(req.url)
  const subjectId=searchParams.get('subjectId')
  const date=searchParams.get('date')
  const studentId=searchParams.get('studentId')
  const semId=searchParams.get('semId')
  const from=searchParams.get('from');const to=searchParams.get('to')
  const where:any={}
  if(subjectId)where.subjectId=Number(subjectId)
  if(date)where.date=new Date(date)
  if(studentId)where.studentId=Number(studentId)
  if(semId)where.subject={semId:Number(semId)}
  if(from||to){where.date={};if(from)where.date.gte=new Date(from);if(to)where.date.lte=new Date(to)}
  const att=await prisma.attendance.findMany({where,include:{student:{select:{id:true,name:true,rollNo:true}},subject:{select:{id:true,name:true,code:true}}},orderBy:{date:'desc'}})
  return NextResponse.json(att)
}
export async function POST(req:Request){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  const {records}=body
  if(!Array.isArray(records))return NextResponse.json({error:'records must be array'},{status:400})
  const setting=await prisma.setting.findFirst({where:{key:'attendance_lock_days',scope:'GLOBAL'}})
  const lockDays=Number(setting?.value??7)
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-lockDays)
  const results=[]
  for(const r of records){
    const d=new Date(r.date)
    if(d<cutoff&&s.user.role!=='SUPER_ADMIN'){results.push({...r,error:'Locked'});continue}
    try{
      const att=await prisma.attendance.upsert({where:{studentId_subjectId_date:{studentId:Number(r.studentId),subjectId:Number(r.subjectId),date:d}},update:{status:r.status,markedById:Number(s.user.id),source:r.source||'MANUAL',remarks:r.remarks||undefined},create:{studentId:Number(r.studentId),subjectId:Number(r.subjectId),date:d,status:r.status,markedById:Number(s.user.id),source:r.source||'MANUAL',remarks:r.remarks||undefined}})
      results.push(att)
    }catch(e:any){results.push({...r,error:e.message})}
  }
  const threshold=Number((await prisma.setting.findFirst({where:{key:'shortage_threshold',scope:'GLOBAL'}}))?.value??75)
  const studentIds=[...new Set(records.map((r:any)=>Number(r.studentId)))]
  for(const sid of studentIds){
    const all=await prisma.attendance.count({where:{studentId:sid}})
    const present=await prisma.attendance.count({where:{studentId:sid,status:'PRESENT'}})
    const pct=all===0?100:Math.round((present/all)*100)
    if(pct<threshold){
      const st=await prisma.student.findUnique({where:{id:sid},include:{department:{select:{hodId:true}}}})
      if(st?.department?.hodId){
        const existing=await prisma.notification.findFirst({where:{userId:st.department.hodId,type:'SHORTAGE_ALERT',message:{contains:String(sid)},createdAt:{gte:new Date(Date.now()-86400000)}}})
        if(!existing)await prisma.notification.create({data:{userId:st.department.hodId,type:'SHORTAGE_ALERT',title:'Attendance Shortage',message:`${st.name} (${st.rollNo}) has ${pct}% attendance — below ${threshold}% threshold. studentId:${sid}`,link:`/students/${sid}`}})
      }
    }
  }
  return NextResponse.json(results)
}
