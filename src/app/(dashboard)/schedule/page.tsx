'use client'
import {useEffect, useState} from 'react'
import {useSession} from 'next-auth/react'
import Topbar from '@/components/layout/Topbar'
import {fmtDate} from '@/lib/utils'

function getSemOptions(programmeType: string) {
  return programmeType === 'PG' ? [1,2,3,4] : [1,2,3,4,5,6]
}
function getYearFromSem(semNum: number) {
  return Math.ceil(semNum / 2)
}
function getYearLabel(semNum: number, programmeType: string) {
  const totalYears = programmeType === 'PG' ? 2 : 3
  return `Year ${getYearFromSem(semNum)} of ${totalYears}`
}

export default function SchedulePage() {
  const {data: session} = useSession()
  const [dept, setDept] = useState<any>(null)
  const [academicYears, setAcademicYears] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'years'|'semesters'>('years')
  const [showAYModal, setShowAYModal] = useState(false)
  const [editAY, setEditAY] = useState<any>(null)
  const [ayForm, setAYForm] = useState({label:'', startDate:'', endDate:'', isCurrent: false})
  const [showSemModal, setShowSemModal] = useState(false)
  const [editSem, setEditSem] = useState<any>(null)
  const [semForm, setSemForm] = useState({semNumber:'1', startDate:'', endDate:'', isActive: false, academicYearId:''})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number|null>(null)
  const [err, setErr] = useState('')

  const progType = dept?.programmeType || 'UG'
  const semOptions = getSemOptions(progType)

  function load() {
    setLoading(true)
    const deptId = session?.user?.deptId
    Promise.all([
      deptId ? fetch(`/api/departments/${deptId}`).then(r => r.json()).catch(() => null) : Promise.resolve(null),
      fetch('/api/academic-years').then(r => r.json()),
      fetch('/api/semesters').then(r => r.json()),
    ]).then(([d, ays, sems]) => {
      if (d && !d.error) setDept(d)
      setAcademicYears(Array.isArray(ays) ? ays : [])
      setSemesters(Array.isArray(sems) ? sems : [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { if (session) load() }, [session])

  async function saveAY() {
    if (!ayForm.label || !ayForm.startDate || !ayForm.endDate) {setErr('All fields required'); return}
    setSaving(true); setErr('')
    const url = editAY ? `/api/academic-years/${editAY.id}` : '/api/academic-years'
    const method = editAY ? 'PATCH' : 'POST'
    const res = await fetch(url, {method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(ayForm)})
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {setErr(data.error || 'Error'); return}
    setShowAYModal(false); setEditAY(null); load()
  }

  async function deleteAY(id: number) {
    if (!confirm('Delete this academic year? All its semesters will also be deleted.')) return
    setDeleting(id)
    const res = await fetch(`/api/academic-years/${id}`, {method: 'DELETE'})
    const data = await res.json()
    setDeleting(null)
    if (!res.ok) {alert(data.error || 'Cannot delete'); return}
    load()
  }

  async function saveSem() {
    if (!semForm.semNumber || !semForm.startDate || !semForm.endDate || !semForm.academicYearId) {setErr('All fields required'); return}
    setSaving(true); setErr('')
    const url = editSem ? `/api/semesters/${editSem.id}` : '/api/semesters'
    const method = editSem ? 'PATCH' : 'POST'
    const res = await fetch(url, {method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(semForm)})
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {setErr(data.error || 'Error'); return}
    setShowSemModal(false); setEditSem(null); load()
  }

  async function deleteSem(id: number) {
    if (!confirm('Delete this semester?')) return
    setDeleting(id)
    const res = await fetch(`/api/semesters/${id}`, {method: 'DELETE'})
    const data = await res.json()
    setDeleting(null)
    if (!res.ok) {alert(data.error || 'Cannot delete'); return}
    load()
  }

  async function toggleActive(sem: any) {
    await fetch(`/api/semesters/${sem.id}`, {method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({isActive: !sem.isActive})})
    load()
  }

  function openAddSem() {
    setSemForm({semNumber:'1', startDate:'', endDate:'', isActive: false, academicYearId: academicYears[0] ? String(academicYears[0].id) : ''})
    setEditSem(null); setErr(''); setShowSemModal(true)
  }

  function openEditSem(sem: any) {
    setSemForm({semNumber: String(sem.semNumber), startDate: sem.startDate?.split('T')[0] || '', endDate: sem.endDate?.split('T')[0] || '', isActive: sem.isActive, academicYearId: String(sem.academicYearId)})
    setEditSem(sem); setErr(''); setShowSemModal(true)
  }

  function openEditAY(ay: any) {
    setAYForm({label: ay.label, startDate: ay.startDate?.split('T')[0] || '', endDate: ay.endDate?.split('T')[0] || '', isCurrent: ay.isCurrent})
    setEditAY(ay); setErr(''); setShowAYModal(true)
  }

  const semsForAY = (ayId: number) => semesters.filter(s => s.academicYearId === ayId)

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
      <Topbar title="Academic Schedule" subtitle={`${progType} · ${semOptions.length} semesters`} actions={
        <div style={{display:'flex', gap:'7px'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => {setAYForm({label:'',startDate:'',endDate:'',isCurrent:false}); setEditAY(null); setErr(''); setShowAYModal(true)}}>+ Academic Year</button>
          <button className="btn btn-primary btn-sm" onClick={openAddSem} disabled={academicYears.length === 0}>+ Semester</button>
        </div>
      }/>

      <div className="page-wrap">
        {academicYears.length === 0 && !loading && (
          <div className="alert" style={{marginBottom:'16px', background:'rgba(99,91,255,.08)', border:'1.5px solid rgba(99,91,255,.2)', color:'var(--primary)', borderRadius:'11px', padding:'12px 16px', fontSize:'13px'}}>
            👋 Start by adding an <strong>Academic Year</strong> (e.g. 2024-25), then add semesters under it.
          </div>
        )}

        {dept && (
          <div style={{display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap'}}>
            <span className="badge badge-info">{progType === 'PG' ? 'Post Graduate' : 'Under Graduate'}</span>
            <span className="badge badge-gray">{progType === 'PG' ? '2 Years · 4 Semesters' : '3 Years · 6 Semesters'}</span>
            {semesters.find(s => s.isActive) && <span className="badge badge-success">Active: Sem {semesters.find(s => s.isActive)?.semNumber}</span>}
          </div>
        )}

        <div style={{display:'flex', gap:'6px', background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:'11px', padding:'4px', width:'fit-content', marginBottom:'16px'}}>
          {(['years','semesters'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{padding:'6px 16px', borderRadius:'8px', border:'none', background: tab===t ? 'var(--primary)' : 'transparent', color: tab===t ? '#fff' : 'var(--text-3)', fontWeight:'600', fontSize:'12.5px', cursor:'pointer', fontFamily:'inherit', transition:'all .15s'}}>
              {t === 'years' ? `Academic Years (${academicYears.length})` : `Semesters (${semesters.length})`}
            </button>
          ))}
        </div>

        {loading ? <div style={{textAlign:'center', padding:'40px', color:'var(--text-4)'}}>Loading…</div> : (<>

          {tab === 'years' && (
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {academicYears.length === 0
                ? <div className="empty card" style={{padding:'60px'}}><div className="empty-icon">🗓️</div><div className="empty-title">No academic years yet</div><div className="empty-sub">Click "+ Academic Year" to add one</div></div>
                : academicYears.map(ay => (
                  <div key={ay.id} className="card" style={{padding:'18px 20px'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'9px'}}>
                        <div style={{fontSize:'15px', fontWeight:'800', color:'var(--text-1)'}}>{ay.label}</div>
                        {ay.isCurrent && <span className="badge badge-success">Current</span>}
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{fontSize:'12.5px', color:'var(--text-3)'}}>{fmtDate(ay.startDate)} – {fmtDate(ay.endDate)}</div>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditAY(ay)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{color:'var(--danger)'}} onClick={() => deleteAY(ay.id)} disabled={deleting === ay.id}>{deleting === ay.id ? '…' : 'Delete'}</button>
                      </div>
                    </div>
                    {semsForAY(ay.id).length > 0
                      ? <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                          {semsForAY(ay.id).map(s => (
                            <div key={s.id} style={{padding:'8px 13px', borderRadius:'9px', background:'var(--surface-2)', border:`1.5px solid ${s.isActive ? 'var(--primary)' : 'var(--border)'}`, fontSize:'12.5px'}}>
                              <div style={{fontWeight:'700', color:'var(--text-1)'}}>Sem {s.semNumber}</div>
                              <div style={{fontSize:'11px', color:'var(--text-3)', marginTop:'1px'}}>{getYearLabel(s.semNumber, progType)}</div>
                              <div style={{fontSize:'11px', color:'var(--text-4)', marginTop:'2px'}}>{fmtDate(s.startDate)} – {fmtDate(s.endDate)}</div>
                              {s.isActive && <span className="badge badge-success" style={{marginTop:'4px', display:'inline-flex', fontSize:'10px'}}>Active</span>}
                            </div>
                          ))}
                        </div>
                      : <div style={{fontSize:'12.5px', color:'var(--text-4)', fontStyle:'italic'}}>No semesters added yet</div>
                    }
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'semesters' && (
            <div className="card">
              {semesters.length === 0
                ? <div className="empty" style={{padding:'44px'}}><div className="empty-icon">📅</div><div className="empty-title">No semesters yet</div><div className="empty-sub">Add an academic year first, then add semesters</div></div>
                : <table className="table">
                    <thead><tr><th>Sem</th><th>Year</th><th>Academic Year</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {semesters.map(s => (
                        <tr key={s.id}>
                          <td style={{fontWeight:'700'}}>Sem {s.semNumber}</td>
                          <td style={{color:'var(--text-3)', fontSize:'12.5px'}}>{getYearLabel(s.semNumber, progType)}</td>
                          <td><span className="badge badge-info">{s.academicYear?.label}</span></td>
                          <td style={{fontSize:'12.5px'}}>{fmtDate(s.startDate)}</td>
                          <td style={{fontSize:'12.5px'}}>{fmtDate(s.endDate)}</td>
                          <td>
                            <button onClick={() => toggleActive(s)} className={`badge ${s.isActive ? 'badge-success' : 'badge-gray'}`} style={{cursor:'pointer', border:'none', fontFamily:'inherit'}}>
                              {s.isActive ? '● Active' : 'Inactive'}
                            </button>
                          </td>
                          <td>
                            <div style={{display:'flex', gap:'6px'}}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEditSem(s)}>Edit</button>
                              <button className="btn btn-ghost btn-sm" style={{color:'var(--danger)'}} onClick={() => deleteSem(s.id)} disabled={deleting === s.id}>{deleting === s.id ? '…' : 'Del'}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          )}

        </>)}
      </div>

      {/* AY MODAL */}
      {showAYModal && (
        <div className="modal-overlay" onClick={e => {if (e.target === e.currentTarget) {setShowAYModal(false); setEditAY(null)}}}>
          <div className="modal">
            <div className="modal-title">{editAY ? 'Edit Academic Year' : 'Add Academic Year'}</div>
            {err && <div className="alert alert-danger">{err}</div>}
            <div className="form-group"><label className="label">Label* (e.g. 2024-25)</label><input className="input" value={ayForm.label} onChange={e => setAYForm(f => ({...f, label: e.target.value}))} placeholder="2024-25" autoFocus/></div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div className="form-group"><label className="label">Start Date*</label><input className="input" type="date" value={ayForm.startDate} onChange={e => setAYForm(f => ({...f, startDate: e.target.value}))}/></div>
              <div className="form-group"><label className="label">End Date*</label><input className="input" type="date" value={ayForm.endDate} onChange={e => setAYForm(f => ({...f, endDate: e.target.value}))}/></div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px', padding:'10px 13px', background:'var(--surface-2)', borderRadius:'9px', border:'1px solid var(--border)', cursor:'pointer'}} onClick={() => setAYForm(f => ({...f, isCurrent: !f.isCurrent}))}>
              <div style={{width:'18px', height:'18px', borderRadius:'5px', background: ayForm.isCurrent ? 'var(--primary)' : 'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'11px'}}>{ayForm.isCurrent ? '✓' : ''}</div>
              <span style={{fontSize:'12.5px', fontWeight:'600', color:'var(--text-1)'}}>Set as current academic year</span>
            </div>
            <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={() => {setShowAYModal(false); setEditAY(null)}}>Cancel</button>
              <button className="btn btn-primary" onClick={saveAY} disabled={saving}>{saving ? <><span className="spinner"/>Saving…</> : editAY ? 'Save Changes' : 'Add Year'}</button>
            </div>
          </div>
        </div>
      )}

      {/* SEM MODAL */}
      {showSemModal && (
        <div className="modal-overlay" onClick={e => {if (e.target === e.currentTarget) {setShowSemModal(false); setEditSem(null)}}}>
          <div className="modal">
            <div className="modal-title">{editSem ? 'Edit Semester' : 'Add Semester'}</div>
            {err && <div className="alert alert-danger">{err}</div>}
            <div className="form-group">
              <label className="label">Academic Year*</label>
              <select className="select" value={semForm.academicYearId} onChange={e => setSemForm(f => ({...f, academicYearId: e.target.value}))}>
                <option value="">— Select —</option>
                {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.label}{ay.isCurrent ? ' (Current)' : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Semester Number*</label>
              <div style={{display:'grid', gridTemplateColumns:`repeat(${semOptions.length}, 1fr)`, gap:'7px'}}>
                {semOptions.map(n => (
                  <button key={n} type="button" onClick={() => setSemForm(f => ({...f, semNumber: String(n)}))} style={{padding:'10px 4px', borderRadius:'9px', border: semForm.semNumber === String(n) ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: semForm.semNumber === String(n) ? 'rgba(99,91,255,.08)' : 'var(--surface-2)', color: semForm.semNumber === String(n) ? 'var(--primary)' : 'var(--text-2)', fontWeight:'700', fontSize:'13px', cursor:'pointer', fontFamily:'inherit', transition:'all .15s'}}>
                    <div>Sem {n}</div>
                    <div style={{fontSize:'10px', fontWeight:'400', marginTop:'2px', opacity:.7}}>Yr {getYearFromSem(n)}</div>
                  </button>
                ))}
              </div>
              <div style={{fontSize:'11.5px', color:'var(--text-3)', marginTop:'7px'}}>
                Selected: <strong>Semester {semForm.semNumber}</strong> → {getYearLabel(Number(semForm.semNumber), progType)} (auto-calculated)
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div className="form-group"><label className="label">Start Date*</label><input className="input" type="date" value={semForm.startDate} onChange={e => setSemForm(f => ({...f, startDate: e.target.value}))}/></div>
              <div className="form-group"><label className="label">End Date*</label><input className="input" type="date" value={semForm.endDate} onChange={e => setSemForm(f => ({...f, endDate: e.target.value}))}/></div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px', padding:'10px 13px', background:'var(--surface-2)', borderRadius:'9px', border:'1px solid var(--border)', cursor:'pointer'}} onClick={() => setSemForm(f => ({...f, isActive: !f.isActive}))}>
              <div style={{width:'18px', height:'18px', borderRadius:'5px', background: semForm.isActive ? 'var(--primary)' : 'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'11px'}}>{semForm.isActive ? '✓' : ''}</div>
              <div>
                <div style={{fontSize:'12.5px', fontWeight:'600', color:'var(--text-1)'}}>Mark as active semester</div>
                <div style={{fontSize:'11px', color:'var(--text-3)'}}>This will deactivate all other semesters in this department</div>
              </div>
            </div>
            <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={() => {setShowSemModal(false); setEditSem(null)}}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSem} disabled={saving}>{saving ? <><span className="spinner"/>Saving…</> : editSem ? 'Save Changes' : 'Add Semester'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}