'use client'
import {useEffect,useState} from 'react'
import {useSession} from 'next-auth/react'
import Topbar from '@/components/layout/Topbar'
export default function ProfilePage(){
  const {data:session}=useSession()
  const [profile,setProfile]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [form,setForm]=useState({name:'',email:'',phone:''})
  const [pwForm,setPwForm]=useState({currentPassword:'',newPassword:'',confirmPassword:''})
  const [saving,setSaving]=useState(false)
  const [savingPw,setSavingPw]=useState(false)
  const [msg,setMsg]=useState('')
  const [err,setErr]=useState('')
  const [pwErr,setPwErr]=useState('')
  useEffect(()=>{
    fetch('/api/profile').then(r=>r.json()).then(p=>{setProfile(p);setForm({name:p.name||'',email:p.email||'',phone:p.phone||''})}).finally(()=>setLoading(false))
  },[])
  async function saveProfile(){
    setSaving(true);setErr('');setMsg('')
    const res=await fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const data=await res.json()
    setSaving(false)
    if(!res.ok){setErr(data.error||'Error');return}
    setMsg('Profile updated!');setTimeout(()=>setMsg(''),3000)
  }
  async function changePassword(){
    if(!pwForm.currentPassword||!pwForm.newPassword){setPwErr('All fields required');return}
    if(pwForm.newPassword!==pwForm.confirmPassword){setPwErr('Passwords do not match');return}
    if(pwForm.newPassword.length<6){setPwErr('New password must be at least 6 characters');return}
    setSavingPw(true);setPwErr('')
    const res=await fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:pwForm.currentPassword,newPassword:pwForm.newPassword})})
    const data=await res.json()
    setSavingPw(false)
    if(!res.ok){setPwErr(data.error||'Error');return}
    setPwForm({currentPassword:'',newPassword:'',confirmPassword:''});setMsg('Password changed!');setTimeout(()=>setMsg(''),3000)
  }
  const roleLabel:Record<string,string>={SUPER_ADMIN:'Super Admin',HOD:'Head of Department',TEACHER:'Teacher'}
  if(loading)return(<div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}><Topbar title="Profile"/><div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div></div>)
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="My Profile" subtitle="Account settings"/>
      <div className="page-wrap" style={{maxWidth:'680px'}}>
        {msg&&<div className="alert alert-success">✅ {msg}</div>}
        <div className="card" style={{padding:'22px 24px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'20px'}}>
            <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'linear-gradient(135deg,#635bff,#a8a4ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:'800',color:'#fff',flexShrink:0}}>{profile?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{fontSize:'17px',fontWeight:'700',color:'var(--text-1)'}}>{profile?.name}</div>
              <div style={{fontSize:'12.5px',color:'var(--text-3)'}}>{roleLabel[profile?.role]||profile?.role}{profile?.department&&` · ${profile.department.name}`}</div>
              <div style={{fontSize:'12px',color:'var(--text-4)',fontFamily:'monospace',marginTop:'1px'}}>@{profile?.username}</div>
            </div>
          </div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'12px'}}>Update Info</div>
          {err&&<div className="alert alert-danger">{err}</div>}
          <div className="form-group"><label className="label">Full Name</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="your@email.com"/></div>
            <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="9876543210"/></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:'4px'}}>
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>{saving?<><span className="spinner"/>Saving…</>:'Save Changes'}</button>
          </div>
        </div>
        <div className="card" style={{padding:'22px 24px'}}>
          <div style={{fontSize:'11px',fontWeight:'700',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'12px'}}>🔒 Change Password</div>
          {pwErr&&<div className="alert alert-danger">{pwErr}</div>}
          <div className="form-group"><label className="label">Current Password</label><input className="input" type="password" value={pwForm.currentPassword} onChange={e=>setPwForm(f=>({...f,currentPassword:e.target.value}))}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div className="form-group"><label className="label">New Password</label><input className="input" type="password" value={pwForm.newPassword} onChange={e=>setPwForm(f=>({...f,newPassword:e.target.value}))}/></div>
            <div className="form-group"><label className="label">Confirm New</label><input className="input" type="password" value={pwForm.confirmPassword} onChange={e=>setPwForm(f=>({...f,confirmPassword:e.target.value}))}/></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:'4px'}}>
            <button className="btn btn-primary" onClick={changePassword} disabled={savingPw}>{savingPw?<><span className="spinner"/>Changing…</>:'Change Password'}</button>
          </div>
        </div>
        {profile?.lastLoginAt&&(
          <div style={{textAlign:'center',fontSize:'11.5px',color:'var(--text-4)'}}>Last login: {new Date(profile.lastLoginAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
        )}
      </div>
    </div>
  )
}
