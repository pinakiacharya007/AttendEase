import {withAuth} from 'next-auth/middleware'
import {NextResponse} from 'next/server'
export default withAuth(function middleware(req){
  const p=req.nextUrl.pathname
  const role=req.nextauth.token?.role as string|undefined
  if(!role)return NextResponse.redirect(new URL('/login',req.url))
  if(p.startsWith('/super')&&role!=='SUPER_ADMIN')return NextResponse.redirect(new URL('/dashboard',req.url))
  const hodOnly=['/students','/teachers','/subjects','/schedule','/calendar','/reports','/setup']
  if(hodOnly.some(h=>p.startsWith(h))&&role==='TEACHER')return NextResponse.redirect(new URL('/dashboard',req.url))
  return NextResponse.next()
},{callbacks:{authorized:({token})=>!!token}})
export const config={matcher:['/dashboard/:path*','/students/:path*','/teachers/:path*','/subjects/:path*','/schedule/:path*','/attendance/:path*','/ai-assistant/:path*','/reports/:path*','/calendar/:path*','/notifications/:path*','/profile/:path*','/setup/:path*','/super/:path*']}
