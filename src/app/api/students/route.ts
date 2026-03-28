import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(req:Request){
  const s=await getServerSession(authOptions)
  if(!s)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {searchParams}=new URL(req.url)
  const semId=searchParams.get('semId')
  const search=searchParams.get('q')
  const deptId=s.user.role==='SUPER_ADMIN'?searchParams.get('deptId')?Number(searchParams.get('deptId')):undefined:Number(s.user.deptId)
  const where:any={isActive:true}
  if(deptId)where.deptId=deptId
  if(semId)where.semId=Number(semId)
  if(search)where.OR=[{name:{contains:search}},{rollNo:{contains:search}},{examRoll:{contains:search}}]
  const students=await prisma.student.findMany({where,include:{semester:{select:{semNumber:true,yearOfStudy:true}}},orderBy:{rollNo:'asc'}})
  return NextResponse.json(students)
}
export async function POST(req:Request){
  const s=await getServerSession(authOptions)
  if(!s||s.user.role==='TEACHER')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  try{
    const deptId=s.user.role==='HOD'?Number(s.user.deptId):Number(body.deptId)
    const st=await prisma.student.create({data:{deptId,semId:Number(body.semId),rollNo:body.rollNo,examRoll:body.examRoll,name:body.name,phone:body.phone||undefined,email:body.email||undefined,guardianName:body.guardianName||undefined,guardianPhone:body.guardianPhone||undefined,address:body.address||undefined,gender:body.gender||undefined,yearOfStudy:Number(body.yearOfStudy)||1,dateOfBirth:body.dateOfBirth?new Date(body.dateOfBirth):undefined}})
    return NextResponse.json(st,{status:201})
  }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}
