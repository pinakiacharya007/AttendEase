import {redirect} from 'next/navigation'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
export default async function Root(){
  const s=await getServerSession(authOptions)
  if(!s)redirect('/login')
  if(s.user.role==='SUPER_ADMIN')redirect('/super/dashboard')
  redirect('/dashboard')
}
