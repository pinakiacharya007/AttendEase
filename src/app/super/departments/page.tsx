'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
export default function DepartmentsPage(){
  const [depts,setDepts]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [showModal,setShowModal]=useState(false)
  const [editing,setEditing]=useState<any>(null)
  const [form,setForm]=useState({name:'',code:'',programmeType:'UG',totalYears:'3',rollPrefix:'',examRollPrefix:''})
  const [saving,setSaving]=useState(false)
  const [err,setErr]=useState('')
  const load=()=>fetch('/api/departments').then(r=>r.json()).then(setDepts).finally(()=>setLoading(false))
  useEffect(()=>{load()},[])
  function openAdd(){setEditing(null);setForm({name:'',code:'',programmeType:'UG',totalYears:'3',rollPrefix:'',examRollPrefix:''});setErr('');setShowModal(true)}
  function openEdit(d:any){setEditing(d);setForm({name:d.name,code:d.code,programmeType:d.programmeType,totalYears:String(d.totalYears),rollPrefix:d.rollPrefix,examRollPrefix:d.examRollPrefix});setErr('');setShowModal(true)}
  async function save(){
    setSaving(true);setErr('')
    const url=editing?`/api/departments/${editing.id}`:'/api/departments'
    const method=editing?'PATCH':'POST'
    const res=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const data=await res.json()
    setSaving(false)
    if(!res.ok){setErr(data.error||'Error');return}
    setShowModal(false);load()
  }
  async function del(id:number){
    if(!confirm('Delete department? This will remove all related data.'))return
    await fetch(`/api/departments/${id}`,{method:'DELETE'});load()
  }
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Departments" subtitle="Manage all university departments" actions={<button className="btn btn-primary" onClick={openAdd}>+ Add Department</button>}/>
      <div className="page-wrap">
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:(
          <div className="card">
            {depts.length===0?<div className="empty"><div className="empty-icon">🏛️</div><div className="empty-title">No departments yet</div><div className="empty-sub">Add your first department above</div></div>:(
              <table className="table">
                <thead><tr><th>Name</th><th>Code</th><th>Type</th><th>Years</th><th>HOD</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {depts.map(d=>(
                    <tr key={d.id}>
                      <td style={{fontWeight:'500'}}>{d.name}</td>
                      <td><span className="badge badge-primary">{d.code}</span></td>
                      <td><span className={`badge ${d.programmeType==='UG'?'badge-info':'badge-warning'}`}>{d.programmeType}</span></td>
                      <td>{d.totalYears}</td>
                      <td style={{color:d.hod?'var(--text-1)':'var(--text-4)'}}>{d.hod?.name||'Not assigned'}</td>
                      <td><span className={`badge ${d.isActive?'badge-success':'badge-gray'}`}>{d.isActive?'Active':'Inactive'}</span></td>
                      <td>
                        <div style={{display:'flex',gap:'5px'}}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(d)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>del(d.id)}>Delete</button>
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
            <div className="modal-title">{editing?'Edit Department':'Add Department'}</div>
            {err&&<div className="alert alert-danger">{err}</div>}
            <div className="form-group"><label className="label">Department Name*</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Bachelor of Computer Applications"/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div className="form-group"><label className="label">Code*</label><input className="input" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="e.g. BCA"/></div>
              <div className="form-group"><label className="label">Type</label><select className="select" value={form.programmeType} onChange={e=>setForm(f=>({...f,programmeType:e.target.value}))}><option value="UG">UG (3 years)</option><option value="PG">PG (2 years)</option></select></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
              <div className="form-group"><label className="label">Total Years</label><input className="input" type="number" min="1" max="5" value={form.totalYears} onChange={e=>setForm(f=>({...f,totalYears:e.target.value}))}/></div>
              <div className="form-group"><label className="label">Roll Prefix</label><input className="input" value={form.rollPrefix} onChange={e=>setForm(f=>({...f,rollPrefix:e.target.value.toUpperCase()}))} placeholder="BC"/></div>
              <div className="form-group"><label className="label">Exam Prefix</label><input className="input" value={form.examRollPrefix} onChange={e=>setForm(f=>({...f,examRollPrefix:e.target.value.toUpperCase()}))} placeholder="BS"/></div>
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
