'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
export default function NotificationsPage(){
  const [notifs,setNotifs]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{fetch('/api/notifications').then(r=>r.json()).then(d=>setNotifs(Array.isArray(d)?d:[])).finally(()=>setLoading(false))},[])
  async function markRead(id:number){
    await fetch(`/api/notifications/${id}`,{method:'PATCH'})
    setNotifs(n=>n.map(x=>x.id===id?{...x,isRead:true}:x))
  }
  async function markAllRead(){
    const unread=notifs.filter(n=>!n.isRead)
    await Promise.all(unread.map(n=>fetch(`/api/notifications/${n.id}`,{method:'PATCH'})))
    setNotifs(n=>n.map(x=>({...x,isRead:true})))
  }
  const unread=notifs.filter(n=>!n.isRead).length
  const iconMap:Record<string,string>={SHORTAGE_ALERT:'⚠️',ATTENDANCE_LOCKED:'🔒',SYSTEM:'⚙️',HOLIDAY:'🏖️',ANNOUNCEMENT:'📢'}
  const colorMap:Record<string,string>={SHORTAGE_ALERT:'#fef3c7',ATTENDANCE_LOCKED:'#fee2e2',SYSTEM:'#ede9ff',HOLIDAY:'#d1fae5',ANNOUNCEMENT:'#dbeafe'}
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Notifications" subtitle={unread>0?`${unread} unread`:'All caught up'} actions={unread>0?<button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>:null}/>
      <div className="page-wrap" style={{maxWidth:'680px'}}>
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:notifs.length===0?<div className="empty card" style={{padding:'60px'}}><div className="empty-icon">🔔</div><div className="empty-title">No notifications</div><div className="empty-sub">You're all caught up!</div></div>:(
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {notifs.map(n=>(
              <div key={n.id} className="card" style={{padding:'13px 16px',background:n.isRead?'var(--surface)':colorMap[n.type]||'var(--surface-2)',border:`1.5px solid ${n.isRead?'var(--border)':'transparent'}`,opacity:n.isRead?.75:1,cursor:'pointer',transition:'all .15s'}}
                onClick={()=>{if(!n.isRead)markRead(n.id)}}>
                <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                  <span style={{fontSize:'18px',flexShrink:0,marginTop:'1px'}}>{iconMap[n.type]||'📢'}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'8px'}}>
                      <span style={{fontWeight:'600',fontSize:'13.5px',color:'var(--text-1)'}}>{n.title}</span>
                      {!n.isRead&&<span style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--primary)',flexShrink:0}}/>}
                    </div>
                    <p style={{fontSize:'12.5px',color:'var(--text-2)',margin:'3px 0 0',lineHeight:1.5}}>{n.message.replace(/studentId:\d+/,'').trim()}</p>
                    {n.link&&<Link href={n.link} style={{fontSize:'11.5px',color:'var(--primary)',fontWeight:'600',textDecoration:'none',marginTop:'4px',display:'inline-block'}} onClick={e=>e.stopPropagation()}>View →</Link>}
                    <div style={{fontSize:'11px',color:'var(--text-4)',marginTop:'4px'}}>{new Date(n.createdAt).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
