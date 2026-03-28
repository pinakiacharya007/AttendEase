'use client'
import {useEffect,useState} from 'react'
import Topbar from '@/components/layout/Topbar'
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid,PieChart,Pie,Cell} from 'recharts'
export default function ReportsPage(){
  const [sems,setSems]=useState<any[]>([])
  const [semId,setSemId]=useState('')
  const [summary,setSummary]=useState<any[]>([])
  const [subjects,setSubjects]=useState<any[]>([])
  const [defaulters,setDefaulters]=useState<any[]>([])
  const [tab,setTab]=useState<'summary'|'subjects'|'defaulters'>('summary')
  const [loading,setLoading]=useState(false)
  useEffect(()=>{fetch('/api/semesters').then(r=>r.json()).then(d=>setSems(Array.isArray(d)?d:[]))},[])
  useEffect(()=>{
    setLoading(true)
    const p=semId?`&semId=${semId}`:''
    Promise.all([
      fetch(`/api/reports?type=summary${p}`).then(r=>r.json()),
      fetch(`/api/reports?type=subject${p}`).then(r=>r.json()),
      fetch(`/api/reports?type=defaulters${p}`).then(r=>r.json()),
    ]).then(([s,sub,d])=>{setSummary(Array.isArray(s)?s:[]);setSubjects(Array.isArray(sub)?sub:[]);setDefaulters(Array.isArray(d)?d:[])}).finally(()=>setLoading(false))
  },[semId])
  function exportCSV(){
    const data=tab==='defaulters'?defaulters:tab==='subjects'?subjects:summary
    const keys=Object.keys(data[0]||{}).filter(k=>!['id','department','semester','attendance'].includes(k))
    const csv=[keys.join(','),...data.map(r=>keys.map(k=>JSON.stringify(r[k]??'')).join(','))].join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`${tab}_report.csv`;a.click()
  }
  const COLORS=['#635bff','#10b981','#f59e0b','#ef4444','#3b82f6','#8b7fff']
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Reports" subtitle="Attendance analytics and insights" actions={
        <div style={{display:'flex',gap:'7px'}}>
          <select className="select" style={{width:'170px'}} value={semId} onChange={e=>setSemId(e.target.value)}><option value="">All Semesters</option>{sems.map(s=><option key={s.id} value={s.id}>Sem {s.semNumber} (Yr {s.yearOfStudy})</option>)}</select>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
        </div>
      }/>
      <div className="page-wrap">
        <div style={{display:'flex',gap:'6px',background:'var(--surface)',border:'1.5px solid var(--border)',borderRadius:'11px',padding:'4px',width:'fit-content'}}>
          {(['summary','subjects','defaulters'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'6px 16px',borderRadius:'8px',border:'none',background:tab===t?'var(--primary)':'transparent',color:tab===t?'#fff':'var(--text-3)',fontWeight:'600',fontSize:'12.5px',cursor:'pointer',fontFamily:'inherit',textTransform:'capitalize',transition:'all .15s'}}>{t}</button>
          ))}
        </div>
        {loading?<div style={{textAlign:'center',padding:'40px',color:'var(--text-4)'}}>Loading…</div>:(
          <>
            {tab==='summary'&&(
              <>
                {summary.length>0&&(
                  <div className="card" style={{padding:'18px 20px'}}>
                    <div style={{fontWeight:'700',fontSize:'14px',marginBottom:'11px'}}>Student Attendance Overview</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={summary.slice(0,20)} barSize={18}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e1ff" vertical={false}/>
                        <XAxis dataKey="rollNo" tick={{fontSize:9,fill:'#7c72b2'}}/>
                        <YAxis domain={[0,100]} tick={{fontSize:10,fill:'#7c72b2'}} unit="%"/>
                        <Tooltip formatter={(v:any)=>[`${v}%`,'Attendance']} contentStyle={{borderRadius:'9px',border:'1.5px solid var(--border)'}}/>
                        <Bar dataKey="pct" fill="#635bff" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="card">
                  {summary.length===0?<div className="empty" style={{padding:'44px'}}><div className="empty-icon">📊</div><div className="empty-title">No data yet</div></div>:(
                    <table className="table">
                      <thead><tr><th>Roll No</th><th>Name</th><th>Total</th><th>Present</th><th>Absent</th><th>%</th><th>Status</th></tr></thead>
                      <tbody>
                        {summary.map((s:any)=>(
                          <tr key={s.id}>
                            <td style={{fontFamily:'monospace',fontSize:'12.5px',fontWeight:'600'}}>{s.rollNo}</td>
                            <td style={{fontWeight:'500'}}>{s.name}</td>
                            <td>{s.total}</td>
                            <td style={{color:'var(--success)',fontWeight:'600'}}>{s.present}</td>
                            <td style={{color:'var(--danger)',fontWeight:'600'}}>{s.absent}</td>
                            <td><span style={{fontWeight:'700',color:s.pct>=75?'var(--success)':s.pct>=60?'var(--warning)':'var(--danger)'}}>{s.pct??'—'}%</span></td>
                            <td>{s.shortage?<span className="badge badge-danger">⚠ Shortage</span>:<span className="badge badge-success">OK</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
            {tab==='subjects'&&(
              <>
                {subjects.length>0&&(
                  <div className="card" style={{padding:'18px 20px'}}>
                    <div style={{fontWeight:'700',fontSize:'14px',marginBottom:'11px'}}>Subject-wise Attendance</div>
                    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'18px',alignItems:'center'}}>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={subjects} barSize={24}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e4e1ff" vertical={false}/>
                          <XAxis dataKey="code" tick={{fontSize:10,fill:'#7c72b2'}}/>
                          <YAxis domain={[0,100]} tick={{fontSize:10,fill:'#7c72b2'}} unit="%"/>
                          <Tooltip formatter={(v:any)=>[`${v}%`,'Attendance']}/>
                          <Bar dataKey="pct" radius={[5,5,0,0]}>{subjects.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart><Pie data={subjects.filter(s=>s.pct!==null)} dataKey="pct" nameKey="code" cx="50%" cy="50%" outerRadius={80} label={({code,pct})=>`${code} ${pct}%`} labelLine={false}>
                          {subjects.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                        </Pie><Tooltip/></PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                <div className="card">
                  <table className="table">
                    <thead><tr><th>Code</th><th>Subject</th><th>Total</th><th>Present</th><th>%</th></tr></thead>
                    <tbody>
                      {subjects.map((s:any)=>(
                        <tr key={s.id}>
                          <td><span className="badge badge-primary">{s.code}</span></td>
                          <td style={{fontWeight:'500'}}>{s.name}</td>
                          <td>{s.total}</td>
                          <td>{s.present}</td>
                          <td><span style={{fontWeight:'700',color:s.pct>=75?'var(--success)':s.pct>=60?'var(--warning)':'var(--danger)'}}>{s.pct??'—'}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {tab==='defaulters'&&(
              <div className="card">
                {defaulters.length===0?<div className="empty" style={{padding:'44px'}}><div className="empty-icon">✅</div><div className="empty-title">No defaulters!</div><div className="empty-sub">All students are above the threshold</div></div>:(
                  <>
                    <div style={{padding:'10px 16px',borderBottom:'1px solid var(--surface-2)',background:'#fef3c7',borderRadius:'13px 13px 0 0'}}>
                      <span style={{fontWeight:'600',fontSize:'13px',color:'#92400e'}}>⚠️ {defaulters.length} students below attendance threshold</span>
                    </div>
                    <table className="table">
                      <thead><tr><th>Roll No</th><th>Name</th><th>Present</th><th>Total</th><th>%</th><th>Guardian Phone</th></tr></thead>
                      <tbody>
                        {defaulters.map((s:any)=>(
                          <tr key={s.id} style={{background:'rgba(239,68,68,.02)'}}>
                            <td style={{fontFamily:'monospace',fontSize:'12.5px',fontWeight:'600'}}>{s.rollNo}</td>
                            <td style={{fontWeight:'500'}}>{s.name}</td>
                            <td>{s.present}</td>
                            <td>{s.total}</td>
                            <td><span style={{fontWeight:'700',color:'var(--danger)'}}>{s.pct}%</span></td>
                            <td style={{color:'var(--text-3)'}}>{s.guardianPhone||'—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
