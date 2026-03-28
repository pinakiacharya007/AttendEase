'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
export default function AiLogsPage(){
  const [data,setData]=useState<any>({logs:[],total:0,pages:1})
  const [page,setPage]=useState(1)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{setLoading(true);fetch(`/api/ai/logs?page=${page}`).then(r=>r.json()).then(setData).finally(()=>setLoading(false))},[page])
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="AI Logs" subtitle={`${data.total} total AI interactions`}/>
      <div className="page-wrap">
        <div className="card">
          {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:data.logs.length===0?<div className="empty" style={{padding:'44px'}}><div className="empty-icon">🤖</div><div className="empty-title">No AI logs yet</div></div>:(
            <>
              <table className="table">
                <thead><tr><th>User</th><th>Input</th><th>Action</th><th>Status</th><th>Time</th></tr></thead>
                <tbody>
                  {data.logs.map((l:any)=>(
                    <tr key={l.id}>
                      <td style={{fontWeight:'500'}}>{l.user?.name}<br/><span style={{fontSize:'11px',color:'var(--text-4)'}}>{l.user?.username}</span></td>
                      <td style={{maxWidth:'280px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-2)'}}>{l.inputText}</td>
                      <td><span className="badge badge-info">{l.actionTaken||'—'}</span></td>
                      <td><span className={`badge ${l.success?'badge-success':'badge-danger'}`}>{l.success?'OK':'Error'}</span></td>
                      <td style={{fontSize:'12px',color:'var(--text-4)'}}>{new Date(l.createdAt).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.pages>1&&(
                <div style={{display:'flex',gap:'6px',justifyContent:'center',padding:'14px'}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Prev</button>
                  <span style={{padding:'5px 11px',fontSize:'12px',color:'var(--text-3)'}}>Page {page} of {data.pages}</span>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.min(data.pages,p+1))} disabled={page===data.pages}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
