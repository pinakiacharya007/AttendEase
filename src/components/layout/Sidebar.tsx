'use client'
import {useEffect,useState} from 'react'
import {useSession,signOut} from 'next-auth/react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
type Item={label:string;href:string;icon:string;badge?:string}
type Group={title?:string;items:Item[]}
const NAV:Record<string,Group[]>={
  SUPER_ADMIN:[
    {items:[{label:'Dashboard',href:'/super/dashboard',icon:'🏠'},{label:'Departments',href:'/super/departments',icon:'🏛️'},{label:'HODs',href:'/super/hods',icon:'👤'},{label:'Analytics',href:'/super/analytics',icon:'📊'}]},
    {title:'System',items:[{label:'AI Logs',href:'/super/ai-logs',icon:'🤖'},{label:'Settings',href:'/super/settings',icon:'⚙️'}]},
  ],
  HOD:[
    {items:[{label:'Dashboard',href:'/dashboard',icon:'🏠'},{label:'Attendance',href:'/attendance',icon:'✅'},{label:'AI Assistant',href:'/ai-assistant',icon:'🤖',badge:'AI'}]},
    {title:'Manage',items:[{label:'Students',href:'/students',icon:'👥'},{label:'Teachers',href:'/teachers',icon:'🎓'},{label:'Subjects',href:'/subjects',icon:'📚'},{label:'Schedule',href:'/schedule',icon:'🗓️'}]},
    {title:'More',items:[{label:'Reports',href:'/reports',icon:'📈'},{label:'Calendar',href:'/calendar',icon:'📅'},{label:'Notifications',href:'/notifications',icon:'🔔'},{label:'Profile',href:'/profile',icon:'👤'}]},
  ],
  TEACHER:[
    {items:[{label:'Dashboard',href:'/dashboard',icon:'🏠'},{label:'Attendance',href:'/attendance',icon:'✅'},{label:'AI Assistant',href:'/ai-assistant',icon:'🤖',badge:'AI'},{label:'Notifications',href:'/notifications',icon:'🔔'},{label:'Profile',href:'/profile',icon:'👤'}]},
  ],
}
export default function Sidebar(){
  const {data:s}=useSession()
  const pathname=usePathname()
  const [isMobile,setIsMobile]=useState(false)
  const [sidebarOpen,setSidebarOpen]=useState(false)

  useEffect(()=>{
    const check=()=>{
      const mobile=window.innerWidth<=1024
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }
    check()
    window.addEventListener('resize',check)
    return()=>window.removeEventListener('resize',check)
  },[])

  useEffect(()=>{
    if(isMobile) setSidebarOpen(false)
  },[pathname])

  const role=s?.user?.role??'TEACHER'
  const groups=NAV[role]??NAV.TEACHER
  const isActive=(href:string)=>href==='/dashboard'||href==='/super/dashboard'?pathname===href:pathname.startsWith(href)

  return(
    <>
      {isMobile&&(
        <button onClick={()=>setSidebarOpen(true)} aria-label="Open navigation" style={{position:'fixed',top:'9px',left:'10px',zIndex:120,width:'36px',height:'36px',border:'none',borderRadius:'10px',background:'var(--primary)',color:'#fff',fontSize:'17px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 3px 0 var(--primary-dark),0 4px 12px rgba(99,91,255,.3)'}}>
          ☰
        </button>
      )}

      {isMobile&&sidebarOpen&&(
        <div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,zIndex:110,background:'rgba(15,13,40,.55)',backdropFilter:'blur(2px)',animation:'fadeIn .18s ease'}}/>
      )}

      <aside className={`sidebar ${sidebarOpen?'open':'closed'}`} style={{zIndex:115}}>
        <div style={{padding:'14px 13px 12px',borderBottom:'1.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'linear-gradient(135deg,#635bff,#8b7fff)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 0 #4338ca,0 3px 10px rgba(99,91,255,.25)',fontSize:'15px'}}>📋</div>
            <div>
              <div style={{fontSize:'13.5px',fontWeight:'800',color:'var(--text-1)',lineHeight:1.1}}>AttendEase</div>
              <div style={{fontSize:'9.5px',color:'var(--text-4)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'.07em'}}>{role==='SUPER_ADMIN'?'Super Admin':role==='HOD'?'HOD':'Teacher'}</div>
            </div>
          </div>
          {isMobile&&(
            <button onClick={()=>setSidebarOpen(false)} aria-label="Close" style={{width:'28px',height:'28px',border:'none',borderRadius:'7px',background:'var(--surface-2)',color:'var(--text-3)',fontSize:'15px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          )}
        </div>

        <nav style={{flex:1,padding:'9px 7px',overflowY:'auto',display:'flex',flexDirection:'column'}}>
          {groups.map((g,gi)=>(
            <div key={gi} style={{marginBottom:'4px'}}>
              {g.title&&<div style={{fontSize:'9px',fontWeight:'700',color:'var(--text-4)',textTransform:'uppercase',letterSpacing:'.09em',padding:'7px 9px 3px'}}>{g.title}</div>}
              {g.items.map(item=>{
                const active=isActive(item.href)
                return(
                  <Link key={item.href} href={item.href} style={{textDecoration:'none',display:'block',marginBottom:'1px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px',padding:'9px 10px',borderRadius:'9px',background:active?'linear-gradient(135deg,#ede9ff,#e4e0ff)':'transparent',color:active?'#3730a3':'var(--text-3)',fontWeight:active?'600':'500',fontSize:'13px',transition:'background .12s',cursor:'pointer',minHeight:'40px'}}>
                      <span style={{fontSize:'15px',width:'20px',textAlign:'center',flexShrink:0}}>{item.icon}</span>
                      <span style={{flex:1}}>{item.label}</span>
                      {item.badge&&<span style={{fontSize:'8.5px',fontWeight:'700',background:'#635bff',color:'#fff',padding:'1px 5px',borderRadius:'99px'}}>{item.badge}</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{padding:'7px 7px 13px',borderTop:'1.5px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'7px',padding:'8px 9px',borderRadius:'9px',background:'var(--surface-2)',border:'1px solid var(--border)',marginBottom:'5px'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'7px',background:'linear-gradient(135deg,#635bff,#a8a4ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700',color:'#fff',flexShrink:0}}>{s?.user?.name?.charAt(0).toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:'12px',fontWeight:'600',color:'var(--text-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s?.user?.name}</div>
              <div style={{fontSize:'10px',color:'var(--text-4)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s?.user?.deptCode??s?.user?.role}</div>
            </div>
          </div>
          <button onClick={()=>signOut({callbackUrl:'/login'})} style={{width:'100%',padding:'8px',borderRadius:'8px',border:'1.5px solid var(--border)',background:'transparent',color:'var(--text-3)',fontSize:'12.5px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',fontFamily:'inherit'}}>
            ↩ Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}