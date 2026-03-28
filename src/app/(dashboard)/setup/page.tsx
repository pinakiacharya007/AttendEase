'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
export default function SetupPage(){
  const router=useRouter()
  const [step,setStep]=useState(1)
  const [form,setForm]=useState({uniName:'',uniShort:'',adminName:'Super Admin',adminUsername:'superadmin',adminPassword:''})
  const [saving,setSaving]=useState(false)
  const [err,setErr]=useState('')
  async function finish(){
    setSaving(true);setErr('')
    const res=await fetch('/api/setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const data=await res.json()
    setSaving(false)
    if(!res.ok){setErr(data.error||'Setup failed');return}
    router.push('/login')
  }
  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f2f1ff,#e8e4ff)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'460px'}}>
        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'14px',background:'linear-gradient(135deg,#635bff,#8b7fff)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:'24px',boxShadow:'0 3px 0 #4338ca'}}>📋</div>
          <h1 style={{fontSize:'21px',fontWeight:'800',color:'#1e1b4b',margin:'0 0 4px'}}>Setup AttendEase</h1>
          <p style={{fontSize:'12.5px',color:'#7c72b2',margin:0}}>Step {step} of 3</p>
        </div>
        <div style={{display:'flex',gap:'6px',marginBottom:'20px'}}>
          {[1,2,3].map(i=><div key={i} style={{flex:1,height:'4px',borderRadius:'99px',background:i<=step?'#635bff':'var(--border)',transition:'background .3s'}}/>)}
        </div>
        <div className="card" style={{padding:'26px'}}>
          {err&&<div className="alert alert-danger">{err}</div>}
          {step===1&&(<>
            <h2 style={{fontSize:'16px',fontWeight:'700',margin:'0 0 16px'}}>University Info</h2>
            <div className="form-group"><label className="label">University Name*</label><input className="input" value={form.uniName} onChange={e=>setForm(f=>({...f,uniName:e.target.value}))} placeholder="e.g. State University of Technology" autoFocus/></div>
            <div className="form-group"><label className="label">Short Name</label><input className="input" value={form.uniShort} onChange={e=>setForm(f=>({...f,uniShort:e.target.value}))} placeholder="e.g. SUT"/></div>
            <button className="btn btn-primary btn-lg" style={{width:'100%',marginTop:'8px'}} onClick={()=>{if(!form.uniName){setErr('University name required');return}setErr('');setStep(2)}} >Next →</button>
          </>)}
          {step===2&&(<>
            <h2 style={{fontSize:'16px',fontWeight:'700',margin:'0 0 16px'}}>Super Admin Account</h2>
            <div className="form-group"><label className="label">Display Name</label><input className="input" value={form.adminName} onChange={e=>setForm(f=>({...f,adminName:e.target.value}))} placeholder="Super Admin"/></div>
            <div className="form-group"><label className="label">Username*</label><input className="input" value={form.adminUsername} onChange={e=>setForm(f=>({...f,adminUsername:e.target.value.toLowerCase()}))} placeholder="superadmin"/></div>
            <div className="form-group"><label className="label">Password*</label><input className="input" type="password" value={form.adminPassword} onChange={e=>setForm(f=>({...f,adminPassword:e.target.value}))} placeholder="Min 8 characters"/></div>
            <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
              <button className="btn btn-ghost btn-lg" style={{flex:1}} onClick={()=>setStep(1)}>← Back</button>
              <button className="btn btn-primary btn-lg" style={{flex:2}} onClick={()=>{if(!form.adminUsername||form.adminPassword.length<6){setErr('Fill all fields (password min 6 chars)');return}setErr('');setStep(3)}}>Next →</button>
            </div>
          </>)}
          {step===3&&(<>
            <h2 style={{fontSize:'16px',fontWeight:'700',margin:'0 0 16px'}}>✅ Ready to Launch</h2>
            <div style={{background:'var(--surface-2)',borderRadius:'10px',padding:'14px',marginBottom:'16px',fontSize:'13px',color:'var(--text-2)',lineHeight:1.7}}>
              <strong>University:</strong> {form.uniName}{form.uniShort&&` (${form.uniShort})`}<br/>
              <strong>Admin:</strong> {form.adminName} @ <code style={{background:'var(--border)',padding:'1px 5px',borderRadius:'4px'}}>{form.adminUsername}</code>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button className="btn btn-ghost btn-lg" style={{flex:1}} onClick={()=>setStep(2)}>← Back</button>
              <button className="btn btn-primary btn-lg" style={{flex:2}} onClick={finish} disabled={saving}>{saving?<><span className="spinner"/>Setting up…</>:'🚀 Launch AttendEase'}</button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  )
}
