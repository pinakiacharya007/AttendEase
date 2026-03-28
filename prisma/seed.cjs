const {PrismaClient}=require('@prisma/client')
const bcrypt=require('bcryptjs')
const prisma=new PrismaClient()
async function main(){
  console.log('\n🌱  Seeding AttendEase...\n')
  if(!await prisma.user.findFirst({where:{role:'SUPER_ADMIN'}})){
    await prisma.user.create({data:{name:'Super Admin',username:'superadmin',passwordHash:await bcrypt.hash('Admin@2025',12),role:'SUPER_ADMIN'}})
    console.log('✅  Super Admin\n    username: superadmin  password: Admin@2025\n    ⚠️  Change after first login!\n')
  }else{console.log('ℹ️   Super Admin exists\n')}
  for(const [key,value] of[['shortage_threshold','75'],['attendance_lock_days','7'],['app_name','AttendEase']])
    await prisma.setting.upsert({where:{key_scope_deptId:{key,scope:'GLOBAL',deptId:null}},update:{},create:{key,value,scope:'GLOBAL'}})
  console.log('✅  Settings seeded\n')
  let dept=await prisma.department.findUnique({where:{code:'BCA'}})
  if(!dept)dept=await prisma.department.create({data:{name:'Bachelor of Computer Applications',code:'BCA',programmeType:'UG',totalYears:3,rollPrefix:'BC',examRollPrefix:'BS'}})
  if(!await prisma.user.findUnique({where:{username:'hod_bca'}})){
    const hod=await prisma.user.create({data:{name:'Dr. Ravi Sharma',username:'hod_bca',passwordHash:await bcrypt.hash('Hod@1234',12),role:'HOD',deptId:dept.id}})
    await prisma.department.update({where:{id:dept.id},data:{hodId:hod.id}})
    console.log('✅  HOD: hod_bca / Hod@1234\n')
  }
  if(!await prisma.user.findUnique({where:{username:'teacher_bca'}})){
    await prisma.user.create({data:{name:'Prof. Sunita Das',username:'teacher_bca',passwordHash:await bcrypt.hash('Teacher@1234',12),role:'TEACHER',deptId:dept.id}})
    console.log('✅  Teacher: teacher_bca / Teacher@1234\n')
  }
  console.log('🎉  Done! Run: npm run dev\n')
}
main().catch(e=>{console.error('❌',e);process.exit(1)}).finally(()=>prisma.$disconnect())
