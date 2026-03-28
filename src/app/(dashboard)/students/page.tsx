'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import {fmtDate} from '@/lib/utils'
export default function StudentsPage(){
  const [students,setStudents]=useState<any[]>([])
  const [sems,setSems]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [q,setQ]=useState('')
  const [semId,setSemId]=useState('')
  useEffect(()=>{
    fetch('/api/semesters').then(r=>r.json()).then(setSems)
  },[])
  useEffect(()=>{
    setLoading(true)
    const p=new URLSearchParams()
    if(q)p.set('q',q)
    if(semId)p.set('semId',semId)
    fetch(`/api/students?${p}`).then(r=>r.json()).then(d=>setStudents(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
  },[q,semId])
  async function del(id:number){
    if(!confirm('Remove student?'))return
    await fetch(`/api/students/${id}`,{method:'DELETE'})
    setStudents(s=>s.filter(x=>x.id!==id))
  }
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Students" subtitle={`${students.length} students`} actions={
        <div style={{display:'flex',gap:'7px'}}>
          <Link href="/students/import" className="btn btn-ghost btn-sm">📥 Import</Link>
          <Link href="/students/add" className="btn btn-primary btn-sm">+ Add Student</Link>
        </div>
      }/>
      <div className="page-wrap">
        <div style={{display:'flex',gap:'9px',flexWrap:'wrap'}}>
          <input className="input" style={{flex:1,minWidth:'200px'}} placeholder="Search name, roll no…" value={q} onChange={e=>setQ(e.target.value)}/>
          <select className="select" style={{width:'180px'}} value={semId} onChange={e=>setSemId(e.target.value)}>
            <option value="">All Semesters</option>
            {sems.map(s=><option key={s.id} value={s.id}>Sem {s.semNumber} (Yr {s.yearOfStudy})</option>)}
          </select>
        </div>
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:(
          <div className="card">
            {students.length===0?<div className="empty" style={{padding:'44px'}}><div className="empty-icon">👥</div><div className="empty-title">No students found</div><div className="empty-sub">Add students or adjust filters</div></div>:(
              <table className="table">
                <thead><tr><th>Roll No</th><th>Name</th><th>Exam Roll</th><th>Semester</th><th>Phone</th><th>Actions</th></tr></thead>
                <tbody>
                  {students.map(s=>(
                    <tr key={s.id}>
                      <td style={{fontWeight:'600',fontFamily:'monospace',fontSize:'12.5px'}}>{s.rollNo}</td>
                      <td style={{fontWeight:'500'}}>{s.name}</td>
                      <td style={{fontFamily:'monospace',fontSize:'12px',color:'var(--text-3)'}}>{s.examRoll}</td>
                      <td><span className="badge badge-primary">Sem {s.semester?.semNumber}</span></td>
                      <td style={{color:'var(--text-3)'}}>{s.phone||'—'}</td>
                      <td>
                        <div style={{display:'flex',gap:'5px'}}>
                          <Link href={`/students/${s.id}`} className="btn btn-ghost btn-sm">View</Link>
                          <button className="btn btn-danger btn-sm" onClick={()=>del(s.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
