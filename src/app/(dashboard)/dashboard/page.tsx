'use client'
import {useEffect,useState} from 'react'
import {useSession} from 'next-auth/react'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
export default function DashboardPage(){
  const {data:session}=useSession()
  const [students,setStudents]=useState(0)
  const [subjects,setSubjects]=useState(0)
  const [notifications,setNotifications]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    Promise.all([
      fetch('/api/students').then(r=>r.json()),
      fetch('/api/subjects').then(r=>r.json()),
      fetch('/api/notifications').then(r=>r.json()),
    ]).then(([s,sub,n])=>{
      setStudents(Array.isArray(s)?s.length:0)
      setSubjects(Array.isArray(sub)?sub.length:0)
      setNotifications(Array.isArray(n)?n.filter((x:any)=>!x.isRead).slice(0,5):[])
    }).finally(()=>setLoading(false))
  },[])
  const role=session?.user?.role
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title={`Welcome, ${session?.user?.name?.split(' ')[0] || ''}!`} subtitle={session?.user?.deptName||role}/>
      <div className="page-wrap">
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:(
          <>
            <div className="stats-grid stagger">
              {role!=='TEACHER'&&<Link href="/students" style={{textDecoration:'none'}}><div className="card stat-card anim-fade-up" style={{cursor:'pointer'}}><div className="stat-icon" style={{background:'#ede9ff'}}>👥</div><div className="stat-value">{students}</div><div className="stat-label">Students</div></div></Link>}
              <Link href="/subjects" style={{textDecoration:'none'}}><div className="card stat-card anim-fade-up" style={{cursor:'pointer'}}><div className="stat-icon" style={{background:'#dbeafe'}}>📚</div><div className="stat-value">{subjects}</div><div className="stat-label">Subjects</div></div></Link>
              <Link href="/notifications" style={{textDecoration:'none'}}><div className="card stat-card anim-fade-up" style={{cursor:'pointer'}}><div className="stat-icon" style={{background:'#fef3c7'}}>🔔</div><div className="stat-value">{notifications.length}</div><div className="stat-label">Unread Alerts</div></div></Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'11px'}}>
              {[
                {href:'/attendance/mark',icon:'✅',label:'Mark Attendance',color:'#d1fae5'},
                {href:'/ai-assistant',icon:'🤖',label:'AI Assistant',color:'#ede9ff'},
                ...(role!=='TEACHER'?[{href:'/students',icon:'👥',label:'Students',color:'#e0f2fe'},{href:'/reports',icon:'📈',label:'Reports',color:'#fef9c3'}]:[]),
                {href:'/attendance/records',icon:'📋',label:'View Records',color:'#fce7f3'},
              ].map(l=>(
                <Link key={l.href} href={l.href} style={{textDecoration:'none'}}>
                  <div className="card" style={{padding:'16px 18px',display:'flex',alignItems:'center',gap:'11px',cursor:'pointer',transition:'transform .13s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='translateY(0)'}>
                    <div style={{width:'38px',height:'38px',borderRadius:'10px',background:l.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>{l.icon}</div>
                    <span style={{fontWeight:'600',fontSize:'13px',color:'var(--text-1)'}}>{l.label}</span>
                  </div>
                </Link>
              ))}
            </div>
            {notifications.length>0&&(
              <div className="card" style={{padding:'18px 20px'}}>
                <div style={{fontWeight:'700',fontSize:'14px',marginBottom:'11px',color:'var(--text-1)'}}>🔔 Recent Alerts</div>
                {notifications.map((n:any)=>(
                  <Link key={n.id} href={n.link||'/notifications'} style={{textDecoration:'none'}}>
                    <div style={{padding:'9px 12px',borderRadius:'9px',background:'#fef3c7',border:'1px solid #fcd34d',marginBottom:'6px',display:'flex',gap:'9px',alignItems:'flex-start'}}>
                      <span>⚠️</span>
                      <div>
                        <div style={{fontSize:'12.5px',fontWeight:'600',color:'#92400e'}}>{n.title}</div>
                        <div style={{fontSize:'11.5px',color:'#b45309',marginTop:'2px'}}>{n.message.replace(/studentId:\d+/,'').trim()}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
