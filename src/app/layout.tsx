import type {Metadata} from 'next'
import './globals.css'
import {Providers} from './providers'
export const metadata:Metadata={title:{template:'%s | AttendEase',default:'AttendEase'},description:'University Attendance Management System'}
export default function RootLayout({children}:{children:React.ReactNode}){return(<html lang="en"><body><Providers>{children}</Providers></body></html>)}
