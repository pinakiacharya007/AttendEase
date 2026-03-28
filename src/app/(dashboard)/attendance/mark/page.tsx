'use client'
import {useEffect,useState} from 'react'
import {useSession} from 'next-auth/react'
import Topbar from '@/components/layout/Topbar'
import {todayStr} from '@/lib/utils'
type Status='PRESENT'|'ABSENT'|'LEAVE'
export default function MarkAttendancePage(){
  const {data:session}=useSession()
  const [subjects,setSubjects]=useState<any[]>([])
  const [sems,setSems]=useState<any[]>([])
  const [students,setStudents]=useState<any[]>([])
  const [selSubject,setSelSubject]=useState('')
  const [selSem,setSelSem]=useState('')
  const [date,setDate]=useState(todayStr())
  const [attendance,setAttendance]=useState<Record<number,Status>>({})
  const [existing,setExisting]=useState<any[]>([])
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(false)
  const [loading,setLoading]=useState(false)
  useEffect(()=>{
    fetch('/api/semesters').then(r=>r.json()).then(d=>setSems(Array.isArray(d)?d:[]))
    fetch('/api/subjects').then(r=>r.json()).then(d=>setSubjects(Array.isArray(d)?d:[]))
  },[])
  useEffect(()=>{
    if(!selSem)return
    fetch(`/api/students?semId=${selSem}`).then(r=>r.json()).then(d=>{
      const list=Array.isArray(d)?d:[]
      setStudents(list)
      const init:Record<number,Status>={}
      list.forEach((s:any)=>init[s.id]='PRESENT')
      setAttendance(init)
    })
  },[selSem])
  useEffect(()=>{
    if(!selSubject||!date)return
    setLoading(true)
    fetch(`/api/attendance?subjectId=${selSubject}&date=${date}`).then(r=>r.json()).then(d=>{
      const list=Array.isArray(d)?d:[]
      setExisting(list)
      if(list.length>0){
        const map:Record<number,Status>={}
        list.forEach((a:any)=>map[a.studentId]=a.status as Status)
        setAttendance(map)
      }
    }).finally(()=>setLoading(false))
  },[selSubject,date])
  function setAll(s:Status){setAttendance(p=>{const n={...p};Object.keys(n).forEach(k=>{n[Number(k)]=s});return n})}
  async function submit(){
    if(!selSubject||students.length===0)return
    setSaving(true);setSaved(false)
    const records=students.map(s=>({studentId:s.id,subjectId:Number(selSubject),date,status:attendance[s.id]||'ABSENT',source:'MANUAL'}))
    await fetch('/api/attendance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({records})})
    setSaving(false);setSaved(true)
    setTimeout(()=>setSaved(false),3000)
  }
  const presentCount=Object.values(attendance).filter(v=>v==='PRESENT').length
  const absentCount=Object.values(attendance).filter(v=>v==='ABSENT').length
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Mark Attendance" subtitle="Record daily attendance" actions={
        students.length>0&&selSubject?(
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving?<><span className="spinner"/>Saving…</>:saved?'✅ Saved!':'Save Attendance'}</button>
        ):null
      }/>
      <div className="page-wrap">
        <div className="card" style={{padding:'16px 18px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',flexWrap:'wrap'}}>
            <div className="form-group" style={{margin:0}}><label className="label">Semester</label><select className="select" value={selSem} onChange={e=>setSelSem(e.target.value)}><option value="">— Select —</option>{sems.map(s=><option key={s.id} value={s.id}>Sem {s.semNumber} (Year {s.yearOfStudy})</option>)}</select></div>
            <div className="form-group" style={{margin:0}}><label className="label">Subject</label><select className="select" value={selSubject} onChange={e=>setSelSubject(e.target.value)} disabled={!selSem}><option value="">— Select —</option>{subjects.filter(s=>!selSem||String(s.semId)===selSem).map(s=><option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></div>
            <div className="form-group" style={{margin:0}}><label className="label">Date</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} max={todayStr()}/></div>
          </div>
        </div>
        {students.length>0&&selSubject&&(
          <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'9px'}}>
              <div style={{display:'flex',gap:'13px',fontSize:'13px'}}>
                <span style={{color:'var(--success)',fontWeight:'600'}}>✅ Present: {presentCount}</span>
                <span style={{color:'var(--danger)',fontWeight:'600'}}>❌ Absent: {absentCount}</span>
                <span style={{color:'var(--text-3)'}}>Total: {students.length}</span>
              </div>
              <div style={{display:'flex',gap:'6px'}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setAll('PRESENT')}>All Present</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setAll('ABSENT')}>All Absent</button>
              </div>
            </div>
            {loading?<div style={{textAlign:'center',padding:'20px',color:'var(--text-4)'}}>Loading existing…</div>:(
              <div className="card">
                <table className="table">
                  <thead><tr><th style={{width:'40px'}}>#</th><th>Roll No</th><th>Name</th><th>Status</th></tr></thead>
                  <tbody>
                    {students.map((s,i)=>{
                      const st=attendance[s.id]||'PRESENT'
                      return(
                        <tr key={s.id} style={{background:st==='PRESENT'?'rgba(16,185,129,.03)':st==='ABSENT'?'rgba(239,68,68,.03)':'rgba(245,158,11,.03)'}}>
                          <td style={{color:'var(--text-4)',fontSize:'12px'}}>{i+1}</td>
                          <td style={{fontFamily:'monospace',fontSize:'12.5px',fontWeight:'600'}}>{s.rollNo}</td>
                          <td style={{fontWeight:'500'}}>{s.name}</td>
                          <td>
                            <div style={{display:'flex',gap:'5px'}}>
                              {(['PRESENT','ABSENT','LEAVE'] as Status[]).map(v=>(
                                <button key={v} onClick={()=>setAttendance(p=>({...p,[s.id]:v}))} style={{padding:'4px 10px',borderRadius:'7px',border:'1.5px solid',fontSize:'11.5px',fontWeight:'600',cursor:'pointer',transition:'all .1s',
                                  background:st===v?(v==='PRESENT'?'#d1fae5':v==='ABSENT'?'#fee2e2':'#fef3c7'):'transparent',
                                  color:st===v?(v==='PRESENT'?'#065f46':v==='ABSENT'?'#991b1b':'#92400e'):'var(--text-4)',
                                  borderColor:st===v?(v==='PRESENT'?'#6ee7b7':v==='ABSENT'?'#fca5a5':'#fcd34d'):'var(--border)'}}>
                                  {v==='PRESENT'?'P':v==='ABSENT'?'A':'L'}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {(!selSem||!selSubject)&&(
          <div className="empty card" style={{padding:'44px'}}><div className="empty-icon">✅</div><div className="empty-title">Select semester and subject</div><div className="empty-sub">Then choose a date to mark attendance</div></div>
        )}
      </div>
    </div>
  )
}
