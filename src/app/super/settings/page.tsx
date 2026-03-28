'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
export default function SettingsPage(){
  const [settings,setSettings]=useState<Record<string,string>>({})
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState('')
  useEffect(()=>{fetch('/api/settings').then(r=>r.json()).then(setSettings).finally(()=>setLoading(false))},[])
  async function save(){
    setSaving(true);setMsg('')
    await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)})
    setSaving(false);setMsg('Settings saved successfully!')
    setTimeout(()=>setMsg(''),3000)
  }
  const f=(k:string)=>settings[k]||''
  const s=(k:string,v:string)=>setSettings(p=>({...p,[k]:v}))
  if(loading)return(<div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}><Topbar title="Settings"/><div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div></div>)
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Global Settings" subtitle="System-wide configuration" actions={<button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<><span className="spinner"/>Saving…</>:'Save Changes'}</button>}/>
      <div className="page-wrap" style={{maxWidth:'700px'}}>
        {msg&&<div className="alert alert-success">{msg}</div>}
        <div className="card" style={{padding:'22px 24px'}}>
          <div style={{fontSize:'13px',fontWeight:'700',color:'var(--text-2)',marginBottom:'16px',textTransform:'uppercase',letterSpacing:'.05em'}}>Attendance Rules</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <div className="form-group"><label className="label">Shortage Threshold (%)</label><input className="input" type="number" min="0" max="100" value={f('shortage_threshold')} onChange={e=>s('shortage_threshold',e.target.value)}/><p style={{fontSize:'11px',color:'var(--text-4)',margin:'3px 0 0'}}>Alert when attendance drops below this %</p></div>
            <div className="form-group"><label className="label">Attendance Lock (days)</label><input className="input" type="number" min="1" max="30" value={f('attendance_lock_days')} onChange={e=>s('attendance_lock_days',e.target.value)}/><p style={{fontSize:'11px',color:'var(--text-4)',margin:'3px 0 0'}}>Past records are read-only after N days</p></div>
          </div>
        </div>
        <div className="card" style={{padding:'22px 24px'}}>
          <div style={{fontSize:'13px',fontWeight:'700',color:'var(--text-2)',marginBottom:'16px',textTransform:'uppercase',letterSpacing:'.05em'}}>Branding</div>
          <div className="form-group"><label className="label">App Name</label><input className="input" value={f('app_name')} onChange={e=>s('app_name',e.target.value)} placeholder="AttendEase"/></div>
        </div>
      </div>
    </div>
  )
}
