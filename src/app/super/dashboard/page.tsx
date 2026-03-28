'use client'
import {useEffect, useState} from 'react'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'

export default function SuperDashboard() {
  const [report, setReport] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports?type=dept')
      .then(r => r.json())
      .then(setReport)
      .finally(() => setLoading(false))
  }, [])

  const totalDepts = report.length
  const totalHODs = report.filter(d => d.hodId).length
  const totalTeachers = report.reduce((a, d) => a + (d.teacherCount || 0), 0)
  const totalStudents = report.reduce((a, d) => a + (d.studentCount || 0), 0)
  const avgAttendance = (() => {
    const withData = report.filter(r => r.pct !== null)
    if (withData.length === 0) return '—'
    return (withData.reduce((a, r) => a + r.pct, 0) / withData.length).toFixed(0) + '%'
  })()

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
      <Topbar title="Super Admin Dashboard" subtitle="System-wide overview"/>
      <div className="page-wrap">
        {loading
          ? <div style={{textAlign:'center', padding:'40px', color:'var(--text-4)'}}>Loading…</div>
          : (<>
            <div className="stats-grid stagger">
              {[
                {icon:'🏛️', label:'Departments', value: totalDepts, color:'#ede9ff'},
                {icon:'👤', label:'HODs', value: totalHODs, color:'#dbeafe'},
                {icon:'🎓', label:'Teachers', value: totalTeachers, color:'#fef3c7'},
                {icon:'🧑‍🎓', label:'Students', value: totalStudents, color:'#d1fae5'},
                {icon:'📊', label:'Avg Attendance', value: avgAttendance, color:'#fce7f3'},
              ].map((c, i) => (
                <div key={i} className="card stat-card anim-fade-up">
                  <div className="stat-icon" style={{background: c.color}}>{c.icon}</div>
                  <div className="stat-value">{c.value}</div>
                  <div className="stat-label">{c.label}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{padding:'18px 20px'}}>
              <div style={{fontWeight:'700', fontSize:'14px', marginBottom:'13px', color:'var(--text-1)'}}>Department Overview</div>
              {report.length === 0
                ? <div className="empty"><div className="empty-icon">🏛️</div><div className="empty-title">No data yet</div></div>
                : <table className="table">
                    <thead>
                      <tr><th>Department</th><th>HOD</th><th>Teachers</th><th>Students</th><th>Attendance</th></tr>
                    </thead>
                    <tbody>
                      {report.map((r: any) => (
                        <tr key={r.id}>
                          <td>
                            <div style={{fontWeight:'600'}}>{r.name}</div>
                            <span className="badge badge-primary" style={{marginTop:'3px'}}>{r.code}</span>
                          </td>
                          <td>
                            {r.hodName
                              ? <div>
                                  <div style={{fontWeight:'500', fontSize:'13px'}}>{r.hodName}</div>
                                  <div style={{fontSize:'11px', color:'var(--text-4)', fontFamily:'monospace'}}>{r.hodUsername}</div>
                                </div>
                              : <span style={{color:'var(--text-4)', fontSize:'12px'}}>Not assigned</span>
                            }
                          </td>
                          <td style={{fontWeight:'600'}}>{r.teacherCount || 0}</td>
                          <td style={{fontWeight:'600'}}>{r.studentCount}</td>
                          <td>
                            <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                              <div style={{flex:1, height:'6px', background:'var(--surface-2)', borderRadius:'99px', overflow:'hidden'}}>
                                <div style={{width:`${r.pct ?? 0}%`, height:'100%', background: r.pct >= 75 ? 'var(--success)' : r.pct >= 60 ? 'var(--warning)' : 'var(--danger)', borderRadius:'99px'}}/>
                              </div>
                              <span style={{fontSize:'12px', fontWeight:'700', color: r.pct >= 75 ? 'var(--success)' : r.pct >= 60 ? 'var(--warning)' : 'var(--danger)', width:'38px'}}>
                                {r.pct ?? '—'}{r.pct !== null ? '%' : ''}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'11px'}}>
              {[
                {href:'/super/departments', icon:'🏛️', label:'Manage Departments'},
                {href:'/super/hods', icon:'👤', label:'Manage HODs'},
                {href:'/super/analytics', icon:'📊', label:'Analytics'},
                {href:'/super/ai-logs', icon:'🤖', label:'AI Logs'},
                {href:'/super/settings', icon:'⚙️', label:'Settings'},
              ].map(l => (
                <Link key={l.href} href={l.href} style={{textDecoration:'none'}}>
                  <div className="card" style={{padding:'15px 18px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', transition:'transform .13s'}}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                    <span style={{fontSize:'20px'}}>{l.icon}</span>
                    <span style={{fontWeight:'600', fontSize:'13px', color:'var(--text-1)'}}>{l.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>)
        }
      </div>
    </div>
  )
}