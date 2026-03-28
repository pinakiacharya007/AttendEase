import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {prisma} from '@/lib/prisma'
export async function GET(){
  const rows=await prisma.setting.findMany({where:{scope:'GLOBAL'}})
  const obj:Record<string,string>={}
  for(const r of rows)obj[r.key]=r.value
  return NextResponse.json(obj)
}
export async function POST(req:Request){
  const s=await getServerSession(authOptions)
  if(s?.user?.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403})
  const body=await req.json()
  for(const [key,value] of Object.entries(body)){
    await prisma.setting.upsert({where:{key_scope_deptId:{key,scope:'GLOBAL',deptId:undefined}},update:{value:String(value)},create:{key,value:String(value),scope:'GLOBAL'}})
  }
  return NextResponse.json({ok:true})
}
