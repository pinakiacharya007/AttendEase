'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
export default function TeachersPage(){
  const [teachers,setTeachers]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [showModal,setShowModal]=useState(false)
  const [form,setForm]=useState({name:'',username:'',password:'',email:'',phone:''})
  const [saving,setSaving]=useState(false)
  const [err,setErr]=useState('')
  const load=()=>fetch('/api/users?role=TEACHER').then(r=>r.json()).then(d=>setTeachers(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
  useEffect(()=>{load()},[])
  async function save(){
    setSaving(true);setErr('')
    const res=await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,role:'TEACHER'})})
    const data=await res.json()
    setSaving(false)
    if(!res.ok){setErr(data.error||'Error');return}
    setShowModal(false);setForm({name:'',username:'',password:'',email:'',phone:''});load()
  }
  async function toggle(t:any){
    await fetch(`/api/users/${t.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({isActive:!t.isActive})})
    load()
  }
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Teachers" subtitle="Manage department teachers" actions={<button className="btn btn-primary" onClick={()=>{setErr('');setShowModal(true)}}>+ Add Teacher</button>}/>
      <div className="page-wrap">
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:(
          <div className="card">
            {teachers.length===0?<div className="empty" style={{padding:'44px'}}><div className="empty-icon">🎓</div><div className="empty-title">No teachers yet</div></div>:(
              <table className="table">
                <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {teachers.map(t=>(
                    <tr key={t.id}>
                      <td style={{fontWeight:'500'}}>{t.name}</td>
                      <td style={{fontFamily:'monospace',fontSize:'12px'}}>{t.username}</td>
                      <td style={{color:'var(--text-3)'}}>{t.email||'—'}</td>
                      <td style={{color:'var(--text-3)'}}>{t.phone||'—'}</td>
                      <td style={{fontSize:'12px',color:'var(--text-4)'}}>{t.lastLoginAt?new Date(t.lastLoginAt).toLocaleDateString('en-IN'):'Never'}</td>
                      <td><span className={`badge ${t.isActive?'badge-success':'badge-gray'}`}>{t.isActive?'Active':'Inactive'}</span></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={()=>toggle(t)}>{t.isActive?'Deactivate':'Activate'}</button></td>
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
            <div className="modal-title">Add Teacher</div>
            {err&&<div className="alert alert-danger">{err}</div>}
            <div className="form-group"><label className="label">Full Name*</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} autoFocus/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div className="form-group"><label className="label">Username*</label><input className="input" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value.toLowerCase()}))} placeholder="prof_sharma"/></div>
              <div className="form-group"><label className="label">Password*</label><input className="input" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
              <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'4px'}}>
              <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<><span className="spinner"/>Saving…</>:'Create Teacher'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
