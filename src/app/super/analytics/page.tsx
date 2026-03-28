'use client'
import {useEffect, useState} from 'react'
import Topbar from '@/components/layout/Topbar'
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell} from 'recharts'

const COLORS = ['#635bff','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899']

export default function AnalyticsPage() {
  const [depts, setDepts] = useState<any[]>([])
  const [selectedDept, setSelectedDept] = useState<any>(null)
  const [deptDetail, setDeptDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetch('/api/reports?type=dept')
      .then(r => r.json())
      .then(d => setDepts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  async function selectDept(dept: any) {
    if (selectedDept?.id === dept.id) {setSelectedDept(null); setDeptDetail(null); return}
    setSelectedDept(dept)
    setDetailLoading(true)
    const [summary, subjects] = await Promise.all([
      fetch(`/api/reports?type=summary&deptId=${dept.id}`).then(r => r.json()),
      fetch(`/api/reports?type=subject&deptId=${dept.id}`).then(r => r.json()),
    ])
    setDeptDetail({summary, subjects})
    setDetailLoading(false)
  }

  const sorted = [...depts].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
  const pieData = sorted.filter(d => d.studentCount > 0).map(d => ({name: d.code, value: d.studentCount}))

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
      <Topbar title="Analytics" subtitle="Department-wise attendance overview"/>
      <div className="page-wrap">
        {loading
          ? <div style={{textAlign:'center', padding:'40px', color:'var(--text-4)'}}>Loading…</div>
          : depts.length === 0
            ? <div className="empty card" style={{padding:'44px'}}><div className="empty-icon">📊</div><div className="empty-title">No attendance data yet</div></div>
            : (<>
              {/* Overview charts */}
              <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'14px', marginBottom:'14px'}}>
                <div className="card" style={{padding:'18px 20px'}}>
                  <div style={{fontWeight:'700', fontSize:'14px', marginBottom:'13px'}}>Attendance % by Department</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={sorted} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e1ff" vertical={false}/>
                      <XAxis dataKey="code" tick={{fontSize:11, fill:'#7c72b2'}}/>
                      <YAxis domain={[0,100]} tick={{fontSize:11, fill:'#7c72b2'}} unit="%"/>
                      <Tooltip formatter={(v: any) => [`${v}%`, 'Attendance']} contentStyle={{borderRadius:'9px', border:'1.5px solid var(--border)'}}/>
                      <Bar dataKey="pct" fill="#635bff" radius={[5,5,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{padding:'18px 20px'}}>
                  <div style={{fontWeight:'700', fontSize:'14px', marginBottom:'13px'}}>Students by Department</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, value}) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dept table — click to drill down */}
              <div className="card" style={{padding:'18px 20px', marginBottom:'14px'}}>
                <div style={{fontWeight:'700', fontSize:'14px', marginBottom:'4px'}}>Department Details</div>
                <div style={{fontSize:'12px', color:'var(--text-3)', marginBottom:'13px'}}>Click any row to see subject and student breakdown</div>
                <table className="table">
                  <thead>
                    <tr><th>Department</th><th>HOD</th><th>Teachers</th><th>Students</th><th>Attendance %</th><th></th></tr>
                  </thead>
                  <tbody>
                    {sorted.map((d: any) => (
                      <tr key={d.id} style={{cursor:'pointer', background: selectedDept?.id === d.id ? 'rgba(99,91,255,.05)' : undefined}} onClick={() => selectDept(d)}>
                        <td>
                          <div style={{fontWeight:'600'}}>{d.name}</div>
                          <span className="badge badge-primary">{d.code}</span>
                        </td>
                        <td style={{fontSize:'12.5px'}}>{d.hodName || <span style={{color:'var(--text-4)'}}>—</span>}</td>
                        <td style={{fontWeight:'600'}}>{d.teacherCount || 0}</td>
                        <td style={{fontWeight:'600'}}>{d.studentCount}</td>
                        <td>
                          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <div style={{width:'80px', height:'6px', background:'var(--surface-2)', borderRadius:'99px', overflow:'hidden'}}>
                              <div style={{width:`${d.pct ?? 0}%`, height:'100%', background: d.pct >= 75 ? 'var(--success)' : d.pct >= 60 ? 'var(--warning)' : 'var(--danger)', borderRadius:'99px'}}/>
                            </div>
                            <span style={{fontWeight:'700', fontSize:'13px', color: d.pct >= 75 ? 'var(--success)' : d.pct >= 60 ? 'var(--warning)' : 'var(--danger)'}}>
                              {d.pct ?? '—'}{d.pct !== null ? '%' : ''}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{fontSize:'12px', color:'var(--primary)', fontWeight:'600'}}>
                            {selectedDept?.id === d.id ? '▼ Hide' : 'View →'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Drill-down panel */}
              {selectedDept && (
                <div style={{border:'2px solid rgba(99,91,255,.2)', borderRadius:'16px', padding:'20px', background:'rgba(99,91,255,.02)'}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
                    <div>
                      <div style={{fontWeight:'800', fontSize:'16px', color:'var(--text-1)'}}>{selectedDept.name}</div>
                      <div style={{fontSize:'12.5px', color:'var(--text-3)', marginTop:'2px'}}>
                        HOD: {selectedDept.hodName || 'Not assigned'} · {selectedDept.teacherCount} Teachers · {selectedDept.studentCount} Students
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => {setSelectedDept(null); setDeptDetail(null)}}>✕ Close</button>
                  </div>

                  {detailLoading
                    ? <div style={{textAlign:'center', padding:'30px', color:'var(--text-4)'}}>Loading details…</div>
                    : deptDetail && (<>

                      {/* Subject breakdown */}
                      {deptDetail.subjects?.length > 0 && (
                        <div className="card" style={{padding:'16px 18px', marginBottom:'12px'}}>
                          <div style={{fontWeight:'700', fontSize:'13.5px', marginBottom:'12px'}}>Subject-wise Attendance</div>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={deptDetail.subjects} barSize={20}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e4e1ff" vertical={false}/>
                              <XAxis dataKey="code" tick={{fontSize:10, fill:'#7c72b2'}}/>
                              <YAxis domain={[0,100]} tick={{fontSize:10, fill:'#7c72b2'}} unit="%"/>
                              <Tooltip formatter={(v: any) => [`${v}%`, 'Attendance']} contentStyle={{borderRadius:'9px', border:'1.5px solid var(--border)'}}/>
                              <Bar dataKey="pct" fill="#10b981" radius={[4,4,0,0]}/>
                            </BarChart>
                          </ResponsiveContainer>
                          <table className="table" style={{marginTop:'10px'}}>
                            <thead><tr><th>Subject</th><th>Code</th><th>Total Classes</th><th>Present</th><th>Attendance %</th></tr></thead>
                            <tbody>
                              {deptDetail.subjects.map((sub: any) => (
                                <tr key={sub.id}>
                                  <td style={{fontWeight:'500'}}>{sub.name}</td>
                                  <td><span className="badge badge-info">{sub.code}</span></td>
                                  <td>{sub.total}</td>
                                  <td>{sub.present}</td>
                                  <td>
                                    <span style={{fontWeight:'700', color: sub.pct >= 75 ? 'var(--success)' : sub.pct >= 60 ? 'var(--warning)' : 'var(--danger)'}}>
                                      {sub.pct ?? '—'}{sub.pct !== null ? '%' : ''}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Student breakdown */}
                      {deptDetail.summary?.length > 0 && (
                        <div className="card" style={{padding:'16px 18px'}}>
                          <div style={{fontWeight:'700', fontSize:'13.5px', marginBottom:'12px'}}>
                            Student Attendance
                            <span style={{marginLeft:'8px', fontSize:'11px', fontWeight:'400', color:'var(--text-3)'}}>
                              {deptDetail.summary.filter((s: any) => s.shortage).length} below threshold
                            </span>
                          </div>
                          <table className="table">
                            <thead><tr><th>Name</th><th>Roll No</th><th>Present</th><th>Total</th><th>Attendance %</th></tr></thead>
                            <tbody>
                              {[...deptDetail.summary].sort((a: any, b: any) => (a.pct ?? 101) - (b.pct ?? 101)).map((st: any) => (
                                <tr key={st.id} style={{background: st.shortage ? 'rgba(239,68,68,.03)' : undefined}}>
                                  <td style={{fontWeight:'500'}}>
                                    {st.name}
                                    {st.shortage && <span className="badge badge-danger" style={{marginLeft:'6px', fontSize:'10px'}}>Low</span>}
                                  </td>
                                  <td style={{fontFamily:'monospace', fontSize:'12px'}}>{st.rollNo}</td>
                                  <td>{st.present}</td>
                                  <td>{st.total}</td>
                                  <td>
                                    <span style={{fontWeight:'700', color: st.pct >= 75 ? 'var(--success)' : st.pct >= 60 ? 'var(--warning)' : 'var(--danger)'}}>
                                      {st.pct ?? '—'}{st.pct !== null ? '%' : ''}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>)
                  }
                </div>
              )}
            </>)
        }
      </div>
    </div>
  )
}