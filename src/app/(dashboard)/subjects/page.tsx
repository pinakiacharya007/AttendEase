'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
export default function SubjectsPage(){
  const [subjects,setSubjects]=useState<any[]>([])
  const [teachers,setTeachers]=useState<any[]>([])
  const [sems,setSems]=useState<any[]>([])
  const [semId,setSemId]=useState('')
  const [loading,setLoading]=useState(true)
  const [showModal,setShowModal]=useState(false)
  const [editing,setEditing]=useState<any>(null)
  const [form,setForm]=useState({name:'',code:'',semId:'',credits:'4',teacherId:''})
  const [saving,setSaving]=useState(false)
  const [err,setErr]=useState('')
  const loadSubs=()=>{
    setLoading(true)
    const p=semId?`?semId=${semId}`:''
    fetch(`/api/subjects${p}`).then(r=>r.json()).then(d=>setSubjects(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
  }
  useEffect(()=>{
    fetch('/api/semesters').then(r=>r.json()).then(setSems)
    fetch('/api/users?role=TEACHER').then(r=>r.json()).then(d=>setTeachers(Array.isArray(d)?d:[]))
  },[])
  useEffect(()=>{loadSubs()},[semId])
  function openAdd(){setEditing(null);setForm({name:'',code:'',semId:semId||'',credits:'4',teacherId:''});setErr('');setShowModal(true)}
  function openEdit(s:any){setEditing(s);setForm({name:s.name,code:s.code,semId:String(s.semId),credits:String(s.credits),teacherId:s.teacherId?String(s.teacherId):''});setErr('');setShowModal(true)}
  async function save(){
    if(!form.name||!form.code||!form.semId){setErr('Name, code, and semester are required');return}
    setSaving(true);setErr('')
    const url=editing?`/api/subjects/${editing.id}`:'/api/subjects'
    const method=editing?'PATCH':'POST'
    const res=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,teacherId:form.teacherId?Number(form.teacherId):null})})
    const data=await res.json()
    setSaving(false)
    if(!res.ok){setErr(data.error||'Error');return}
    setShowModal(false);loadSubs()
  }
  async function del(id:number){
    if(!confirm('Remove subject?'))return
    await fetch(`/api/subjects/${id}`,{method:'DELETE'});loadSubs()
  }
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Subjects" subtitle="Manage course subjects" actions={<button className="btn btn-primary" onClick={openAdd}>+ Add Subject</button>}/>
      <div className="page-wrap">
        <div style={{display:'flex',gap:'9px',alignItems:'center'}}>
          <select className="select" style={{width:'200px'}} value={semId} onChange={e=>setSemId(e.target.value)}>
            <option value="">All Semesters</option>
            {sems.map(s=><option key={s.id} value={s.id}>Sem {s.semNumber} (Year {s.yearOfStudy})</option>)}
          </select>
          <span style={{fontSize:'12.5px',color:'var(--text-4)'}}>{subjects.length} subjects</span>
        </div>
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:(
          <div className="card">
            {subjects.length===0?<div className="empty" style={{padding:'44px'}}><div className="empty-icon">📚</div><div className="empty-title">No subjects</div><div className="empty-sub">Add subjects for your department</div></div>:(
              <table className="table">
                <thead><tr><th>Code</th><th>Name</th><th>Semester</th><th>Credits</th><th>Teacher</th><th>Actions</th></tr></thead>
                <tbody>
                  {subjects.map(s=>(
                    <tr key={s.id}>
                      <td><span className="badge badge-primary">{s.code}</span></td>
                      <td style={{fontWeight:'500'}}>{s.name}</td>
                      <td><span className="badge badge-info">Sem {s.semester?.semNumber}</span></td>
                      <td style={{color:'var(--text-3)'}}>{s.credits}</td>
                      <td style={{color:s.teacher?'var(--text-1)':'var(--text-4)'}}>{s.teacher?.name||'Unassigned'}</td>
                      <td>
                        <div style={{display:'flex',gap:'5px'}}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(s)}>Edit</button>
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
      {showModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowModal(false)}}>
          <div className="modal">
            <div className="modal-title">{editing?'Edit Subject':'Add Subject'}</div>
            {err&&<div className="alert alert-danger">{err}</div>}
            <div className="form-group"><label className="label">Subject Name*</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Data Structures" autoFocus/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div className="form-group"><label className="label">Code*</label><input className="input" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="e.g. CS301"/></div>
              <div className="form-group"><label className="label">Credits</label><input className="input" type="number" min="1" max="8" value={form.credits} onChange={e=>setForm(f=>({...f,credits:e.target.value}))}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div className="form-group"><label className="label">Semester*</label><select className="select" value={form.semId} onChange={e=>setForm(f=>({...f,semId:e.target.value}))}><option value="">— Select —</option>{sems.map(s=><option key={s.id} value={s.id}>Sem {s.semNumber} (Yr {s.yearOfStudy})</option>)}</select></div>
              <div className="form-group"><label className="label">Assign Teacher</label><select className="select" value={form.teacherId} onChange={e=>setForm(f=>({...f,teacherId:e.target.value}))}><option value="">— Unassigned —</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'4px'}}>
              <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<><span className="spinner"/>Saving…</>:'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
