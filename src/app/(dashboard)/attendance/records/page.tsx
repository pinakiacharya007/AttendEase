'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
import {fmtDate,todayStr} from '@/lib/utils'
export default function RecordsPage(){
  const [records,setRecords]=useState<any[]>([])
  const [subjects,setSubjects]=useState<any[]>([])
  const [loading,setLoading]=useState(false)
  const [subjectId,setSubjectId]=useState('')
  const [from,setFrom]=useState('')
  const [to,setTo]=useState(todayStr())
  const [editing,setEditing]=useState<number|null>(null)
  useEffect(()=>{fetch('/api/subjects').then(r=>r.json()).then(d=>setSubjects(Array.isArray(d)?d:[]))},[])
  useEffect(()=>{
    if(!subjectId)return
    setLoading(true)
    const p=new URLSearchParams({subjectId})
    if(from)p.set('from',from)
    if(to)p.set('to',to)
    fetch(`/api/attendance?${p}`).then(r=>r.json()).then(d=>setRecords(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
  },[subjectId,from,to])
  async function update(id:number,status:string){
    await fetch(`/api/attendance/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
    setRecords(r=>r.map(x=>x.id===id?{...x,status}:x))
    setEditing(null)
  }
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Attendance Records" subtitle="View and edit past records"/>
      <div className="page-wrap">
        <div className="card" style={{padding:'16px 18px'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'12px'}}>
            <div className="form-group" style={{margin:0}}><label className="label">Subject</label><select className="select" value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">— Select Subject —</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></div>
            <div className="form-group" style={{margin:0}}><label className="label">From</label><input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div>
            <div className="form-group" style={{margin:0}}><label className="label">To</label><input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)}/></div>
          </div>
        </div>
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:!subjectId?<div className="empty card" style={{padding:'44px'}}><div className="empty-icon">📋</div><div className="empty-title">Select a subject</div></div>:(
          <div className="card">
            {records.length===0?<div className="empty" style={{padding:'44px'}}><div className="empty-icon">📋</div><div className="empty-title">No records found</div></div>:(
              <>
                <div style={{padding:'10px 16px',borderBottom:'1px solid var(--surface-2)',fontSize:'12.5px',color:'var(--text-3)'}}>
                  {records.length} records · Present: {records.filter(r=>r.status==='PRESENT').length} · Absent: {records.filter(r=>r.status==='ABSENT').length}
                </div>
                <table className="table">
                  <thead><tr><th>Date</th><th>Roll No</th><th>Student</th><th>Status</th><th>Source</th><th>Edit</th></tr></thead>
                  <tbody>
                    {records.map(r=>(
                      <tr key={r.id}>
                        <td style={{fontSize:'12.5px'}}>{fmtDate(r.date)}</td>
                        <td style={{fontFamily:'monospace',fontSize:'12px'}}>{r.student?.rollNo}</td>
                        <td style={{fontWeight:'500'}}>{r.student?.name}</td>
                        <td>
                          {editing===r.id?(
                            <div style={{display:'flex',gap:'4px'}}>
                              {['PRESENT','ABSENT','LEAVE'].map(v=><button key={v} className="btn btn-ghost btn-sm" style={{fontSize:'10.5px',padding:'3px 7px'}} onClick={()=>update(r.id,v)}>{v[0]}</button>)}
                              <button className="btn btn-sm" style={{background:'transparent',border:'none',color:'var(--text-4)',cursor:'pointer',padding:'3px 5px'}} onClick={()=>setEditing(null)}>✕</button>
                            </div>
                          ):<span className={`badge ${r.status==='PRESENT'?'badge-success':r.status==='ABSENT'?'badge-danger':'badge-warning'}`}>{r.status}</span>}
                        </td>
                        <td><span className="badge badge-gray" style={{fontSize:'10px'}}>{r.source}</span></td>
                        <td><button className="btn btn-ghost btn-sm" onClick={()=>setEditing(r.id)}>✏️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
