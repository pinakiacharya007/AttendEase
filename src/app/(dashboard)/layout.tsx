import {getServerSession} from 'next-auth'
import {redirect} from 'next/navigation'
import {authOptions} from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
export default async function DashLayout({children}:{children:React.ReactNode}){
  const s=await getServerSession(authOptions)
  if(!s)redirect('/login')
  if(s.user.role==='SUPER_ADMIN')redirect('/super/dashboard')
  return(
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar/>
      <main style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>{children}</main>
    </div>
  )
}
