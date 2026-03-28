'use client'
import {useEffect,useState} from 'react'
import {useSession} from 'next-auth/react'
import Topbar from '@/components/layout/Topbar'
import {fmtDate,todayStr} from '@/lib/utils'
export default function CalendarPage(){
  const {data:session}=useSession()
  const [holidays,setHolidays]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [showModal,setShowModal]=useState(false)
  const [form,setForm]=useState({date:todayStr(),reason:'',isGlobal:false})
  const [saving,setSaving]=useState(false)
  const [err,setErr]=useState('')
  const isSuper=session?.user?.role==='SUPER_ADMIN'
  const isTeacher=session?.user?.role==='TEACHER'
  const load=()=>fetch('/api/holidays').then(r=>r.json()).then(d=>setHolidays(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
  useEffect(()=>{load()},[])
  async function save(){
    setSaving(true);setErr('')
    const res=await fetch('/api/holidays',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const data=await res.json()
    setSaving(false)
    if(!res.ok){setErr(data.error||'Error');return}
    setShowModal(false);load()
  }
  async function del(id:number){
    if(!confirm('Remove holiday?'))return
    await fetch('/api/holidays',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
    load()
  }
  const upcoming=holidays.filter(h=>new Date(h.date)>=new Date())
  const past=holidays.filter(h=>new Date(h.date)<new Date())
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Holiday Calendar" subtitle="Academic calendar and holidays" actions={!isTeacher?<button className="btn btn-primary" onClick={()=>{setForm({date:todayStr(),reason:'',isGlobal:false});setErr('');setShowModal(true)}}>+ Add Holiday</button>:null}/>
      <div className="page-wrap" style={{maxWidth:'700px'}}>
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:(
          <>
            {upcoming.length>0&&(
              <div className="card" style={{padding:'18px 20px'}}>
                <div style={{fontWeight:'700',fontSize:'13.5px',marginBottom:'11px'}}>📅 Upcoming Holidays ({upcoming.length})</div>
                <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                  {upcoming.map(h=>(
                    <div key={h.id} style={{display:'flex',alignItems:'center',gap:'11px',padding:'10px 13px',borderRadius:'10px',background:h.isGlobal?'#ede9ff':'var(--surface-2)',border:`1px solid ${h.isGlobal?'var(--border-2)':'var(--border)'}`}}>
                      <div style={{width:'44px',height:'44px',borderRadius:'10px',background:h.isGlobal?'var(--primary)':'var(--success)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}>
                        <div style={{fontSize:'14px',fontWeight:'800',lineHeight:1}}>{new Date(h.date).getDate()}</div>
                        <div style={{fontSize:'9px',fontWeight:'600',opacity:.85}}>{new Date(h.date).toLocaleString('en-IN',{month:'short'}).toUpperCase()}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:'600',fontSize:'13.5px',color:'var(--text-1)'}}>{h.reason}</div>
                        <div style={{fontSize:'11.5px',color:'var(--text-4)',marginTop:'1px'}}>{h.isGlobal?'University-wide holiday':'Department holiday'}</div>
                      </div>
                      {!isTeacher&&<button className="btn btn-danger btn-sm" onClick={()=>del(h.id)}>Remove</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {past.length>0&&(
              <div className="card" style={{padding:'18px 20px'}}>
                <div style={{fontWeight:'700',fontSize:'13.5px',marginBottom:'11px',color:'var(--text-3)'}}>Past Holidays</div>
                <table className="table">
                  <thead><tr><th>Date</th><th>Reason</th><th>Scope</th>{!isTeacher&&<th>Action</th>}</tr></thead>
                  <tbody>
                    {past.map(h=>(
                      <tr key={h.id} style={{opacity:.7}}>
                        <td style={{fontSize:'12.5px'}}>{fmtDate(h.date)}</td>
                        <td>{h.reason}</td>
                        <td><span className={`badge ${h.isGlobal?'badge-primary':'badge-info'}`}>{h.isGlobal?'University':'Department'}</span></td>
                        {!isTeacher&&<td><button className="btn btn-danger btn-sm" onClick={()=>del(h.id)}>Remove</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {holidays.length===0&&<div className="empty card" style={{padding:'60px'}}><div className="empty-icon">📅</div><div className="empty-title">No holidays</div><div className="empty-sub">Add holidays to the calendar</div></div>}
          </>
        )}
      </div>
      {showModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowModal(false)}}>
          <div className="modal">
            <div className="modal-title">Add Holiday</div>
            {err&&<div className="alert alert-danger">{err}</div>}
            <div className="form-group"><label className="label">Date*</label><input className="input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} autoFocus/></div>
            <div className="form-group"><label className="label">Reason*</label><input className="input" value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} placeholder="e.g. Independence Day, Diwali…"/></div>
            {isSuper&&<div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px',padding:'10px 13px',background:'var(--surface-2)',borderRadius:'9px',border:'1px solid var(--border)',cursor:'pointer'}} onClick={()=>setForm(f=>({...f,isGlobal:!f.isGlobal}))}>
              <div style={{width:'18px',height:'18px',borderRadius:'5px',background:form.isGlobal?'var(--primary)':'var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'11px',transition:'background .15s'}}>{form.isGlobal?'✓':''}</div>
              <div><div style={{fontSize:'12.5px',fontWeight:'600',color:'var(--text-1)'}}>University-wide holiday</div><div style={{fontSize:'11px',color:'var(--text-4)'}}>Applies to all departments</div></div>
            </div>}
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<><span className="spinner"/>Saving…</>:'Add Holiday'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
