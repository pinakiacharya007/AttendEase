'use client'
import {useEffect,useState} from 'react'
import {useParams,useRouter} from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import {fmtDate,pct} from '@/lib/utils'
export default function StudentDetailPage(){
  const {id}=useParams()
  const router=useRouter()
  const [student,setStudent]=useState<any>(null)
  const [attendance,setAttendance]=useState<any[]>([])
  const [sems,setSems]=useState<any[]>([])
  const [editing,setEditing]=useState(false)
  const [form,setForm]=useState<any>({})
  const [saving,setSaving]=useState(false)
  const [err,setErr]=useState('')
  useEffect(()=>{
    Promise.all([
      fetch(`/api/students/${id}`).then(r=>r.json()),
      fetch(`/api/attendance?studentId=${id}`).then(r=>r.json()),
      fetch('/api/semesters').then(r=>r.json()),
    ]).then(([s,a,sems])=>{setStudent(s);setForm(s);setAttendance(Array.isArray(a)?a:[]);setSems(sems)})
  },[id])
  async function save(){
    setSaving(true);setErr('')
    const res=await fetch(`/api/students/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const data=await res.json()
    setSaving(false)
    if(!res.ok){setErr(data.error||'Error');return}
    setStudent(data);setEditing(false)
  }
  if(!student)return(<div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}><Topbar title="Student"/><div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div></div>)
  const total=attendance.length
  const present=attendance.filter(a=>a.status==='PRESENT').length
  const absent=attendance.filter(a=>a.status==='ABSENT').length
  const pctVal=pct(present,total)
  const sf=(k:string)=>(e:any)=>setForm((f:any)=>({...f,[k]:e.target.value}))
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title={student.name} subtitle={`${student.rollNo} · ${student.department?.name}`} actions={
        <div style={{display:'flex',gap:'7px'}}>
          {!editing&&<button className="btn btn-ghost btn-sm" onClick={()=>setEditing(true)}>✏️ Edit</button>}
          {editing&&<><button className="btn btn-ghost btn-sm" onClick={()=>setEditing(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button></>}
        </div>
      }/>
      <div className="page-wrap">
        {err&&<div className="alert alert-danger">{err}</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'11px',marginBottom:'2px'}}>
          {[{label:'Total Classes',value:total,color:'#ede9ff'},{label:'Present',value:present,color:'#d1fae5'},{label:'Absent',value:absent,color:'#fee2e2'},{label:'Attendance %',value:`${pctVal}%`,color:pctVal>=75?'#d1fae5':pctVal>=60?'#fef3c7':'#fee2e2'}].map((c,i)=>(
            <div key={i} className="card stat-card"><div style={{fontSize:'20px',marginBottom:'5px',background:c.color,width:'34px',height:'34px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center'}}>{['📅','✅','❌','📊'][i]}</div><div className="stat-value" style={{fontSize:'22px'}}>{c.value}</div><div className="stat-label">{c.label}</div></div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
          <div className="card" style={{padding:'20px 22px'}}>
            <div style={{fontWeight:'700',fontSize:'13.5px',marginBottom:'13px'}}>Student Info</div>
            {editing?(
              <>
                <div className="form-group"><label className="label">Name</label><input className="input" value={form.name||''} onChange={sf('name')}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  <div className="form-group"><label className="label">Roll No</label><input className="input" value={form.rollNo||''} onChange={sf('rollNo')}/></div>
                  <div className="form-group"><label className="label">Exam Roll</label><input className="input" value={form.examRoll||''} onChange={sf('examRoll')}/></div>
                </div>
                <div className="form-group"><label className="label">Semester</label><select className="select" value={form.semId||''} onChange={sf('semId')}>{sems.map(s=><option key={s.id} value={s.id}>Sem {s.semNumber}</option>)}</select></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone||''} onChange={sf('phone')}/></div>
                  <div className="form-group"><label className="label">Email</label><input className="input" value={form.email||''} onChange={sf('email')}/></div>
                </div>
                <div className="form-group"><label className="label">Guardian</label><input className="input" value={form.guardianName||''} onChange={sf('guardianName')}/></div>
                <div className="form-group"><label className="label">Guardian Phone</label><input className="input" value={form.guardianPhone||''} onChange={sf('guardianPhone')}/></div>
              </>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:'8px',fontSize:'13px'}}>
                {[['Roll No',student.rollNo],['Exam Roll',student.examRoll],['Semester',`Sem ${student.semester?.semNumber}`],['Phone',student.phone||'—'],['Email',student.email||'—'],['Gender',student.gender||'—'],['Guardian',student.guardianName||'—'],['Guardian Ph.',student.guardianPhone||'—']].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',borderBottom:'1px solid var(--surface-2)',paddingBottom:'6px'}}>
                    <span style={{color:'var(--text-3)',fontWeight:'500'}}>{k}</span>
                    <span style={{fontWeight:'500',color:'var(--text-1)'}}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card" style={{padding:'20px 22px'}}>
            <div style={{fontWeight:'700',fontSize:'13.5px',marginBottom:'11px'}}>Recent Attendance</div>
            {attendance.length===0?<div className="empty" style={{padding:'20px'}}><div className="empty-icon">📋</div><div className="empty-title">No records</div></div>:(
              <div style={{display:'flex',flexDirection:'column',gap:'5px',maxHeight:'340px',overflowY:'auto'}}>
                {attendance.slice(0,30).map(a=>(
                  <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',borderRadius:'8px',background:'var(--surface-2)',fontSize:'12.5px'}}>
                    <span style={{color:'var(--text-2)'}}>{fmtDate(a.date)}</span>
                    <span style={{color:'var(--text-3)',flex:1,marginLeft:'10px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.subject?.name}</span>
                    <span className={`badge ${a.status==='PRESENT'?'badge-success':a.status==='ABSENT'?'badge-danger':'badge-warning'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
