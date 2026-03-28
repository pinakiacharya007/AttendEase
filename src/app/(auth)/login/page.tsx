'use client'
import {useState} from 'react'
import {signIn} from 'next-auth/react'
import {useRouter} from 'next/navigation'
export default function LoginPage(){
  const router=useRouter()
  const [u,setU]=useState('');const [p,setP]=useState('');const [err,setErr]=useState('');const [loading,setLoading]=useState(false)
  async function submit(e:React.FormEvent){
    e.preventDefault();setErr('');setLoading(true)
    const res=await signIn('credentials',{username:u.trim().toLowerCase(),password:p,redirect:false})
    setLoading(false)
    if(res?.error){setErr('Invalid username or password');return}
    router.push('/');router.refresh()
  }
  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f2f1ff 0%,#e8e4ff 45%,#f5f0ff 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px',animation:'popIn .45s ease both'}}>
        <div style={{textAlign:'center',marginBottom:'26px'}}>
          <div style={{width:'58px',height:'58px',borderRadius:'16px',background:'linear-gradient(135deg,#635bff,#8b7fff)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 13px',boxShadow:'0 4px 0 #4338ca,0 8px 24px rgba(99,91,255,.3)',fontSize:'26px'}}>📋</div>
          <h1 style={{fontSize:'23px',fontWeight:'800',color:'#1e1b4b',margin:'0 0 4px'}}>AttendEase</h1>
          <p style={{fontSize:'13px',color:'#7c72b2',margin:0}}>University Attendance Management</p>
        </div>
        <div style={{background:'rgba(255,255,255,.94)',border:'1.5px solid rgba(228,225,255,.9)',borderRadius:'22px',padding:'30px 26px',boxShadow:'0 4px 0 rgba(0,0,0,.05),0 8px 40px rgba(99,91,255,.1)'}}>
          <h2 style={{fontSize:'17px',fontWeight:'700',color:'#1e1b4b',margin:'0 0 20px'}}>Sign in to continue</h2>
          {err&&<div className="alert alert-danger">{err}</div>}
          <form onSubmit={submit}>
            <div className="form-group"><label className="label">Username</label><input className="input" type="text" value={u} onChange={e=>setU(e.target.value)} placeholder="Enter username" required autoFocus/></div>
            <div className="form-group"><label className="label">Password</label><input className="input" type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="Enter password" required/></div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{width:'100%',marginTop:'4px'}}>
              {loading?<><span className="spinner"/>Signing in…</>:'Sign In'}
            </button>
          </form>
        </div>
        <p style={{textAlign:'center',fontSize:'11.5px',color:'#a8a4cc',marginTop:'16px'}}>AttendEase © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
