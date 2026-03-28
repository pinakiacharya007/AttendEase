export const dynamic = 'force-dynamic'

import {getServerSession} from 'next-auth'
import {redirect} from 'next/navigation'
import {authOptions} from '@/lib/auth'
export default async function Home(){
  const s=await getServerSession(authOptions)
  if(!s)redirect('/login')
  if(s.user.role==='SUPER_ADMIN')redirect('/super/dashboard')
  redirect('/dashboard')
}