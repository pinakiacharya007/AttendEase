'use client'
import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {useSession} from 'next-auth/react'
import Topbar from '@/components/layout/Topbar'

function getYearFromSem(semNum: number) {
  return Math.ceil(semNum / 2)
}

export default function AddStudentPage() {
  const router = useRouter()
  const {data: session} = useSession()
  const [dept, setDept] = useState<any>(null)
  const [sems, setSems] = useState<any[]>([])
  const [form, setForm] = useState({
    name:'', rollNo:'', examRoll:'', semId:'',
    phone:'', email:'', guardianName:'', guardianPhone:'',
    gender:'', address:'', dateOfBirth:''
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const progType = dept?.programmeType || 'UG'
  const selectedSem = sems.find(s => String(s.id) === form.semId)
  const yearOfStudy = selectedSem ? getYearFromSem(selectedSem.semNumber) : null

  useEffect(() => {
    const deptId = session?.user?.deptId
    if (!deptId) return
    Promise.all([
      fetch(`/api/departments/${deptId}`).then(r => r.json()).catch(() => null),
      fetch('/api/semesters').then(r => r.json())
    ]).then(([d, s]) => {
      if (d && !d.error) setDept(d)
      setSems(Array.isArray(s) ? s : [])
    })
  }, [session])

  const sf = (k: string) => (e: any) => setForm(f => ({...f, [k]: e.target.value}))

  async function save() {
    if (!form.name || !form.rollNo || !form.examRoll || !form.semId) {
      setErr('Name, roll numbers and semester are required'); return
    }
    setSaving(true); setErr('')
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...form, yearOfStudy: yearOfStudy || 1})
      })
      const data = await res.json().catch(() => ({error: 'Invalid server response'}))
      setSaving(false)
      if (!res.ok) {setErr(data.error || `Error ${res.status}`); return}
      router.push('/students')
    } catch (error:any) {
      setSaving(false)
      setErr(error?.message || 'Network error')
    }
  }

  // Group sems by academic year for display
  const semsByAY = sems.reduce((acc: any, s: any) => {
    const label = s.academicYear?.label || 'Unknown'
    if (!acc[label]) acc[label] = []
    acc[label].push(s)
    return acc
  }, {})

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
      <Topbar title="Add Student" subtitle="Register a new student"/>
      <div className="page-wrap" style={{maxWidth:'680px'}}>
        {err && <div className="alert alert-danger">{err}</div>}

        <div className="card" style={{padding:'22px 24px'}}>
          <div style={{fontSize:'11px', fontWeight:'700', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'14px'}}>Basic Info</div>
          <div className="form-group"><label className="label">Full Name*</label><input className="input" value={form.name} onChange={sf('name')} placeholder="Student full name" autoFocus/></div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <div className="form-group"><label className="label">Roll Number*</label><input className="input" value={form.rollNo} onChange={sf('rollNo')} placeholder="e.g. BC2401"/></div>
            <div className="form-group"><label className="label">Exam Roll*</label><input className="input" value={form.examRoll} onChange={sf('examRoll')} placeholder="e.g. 24010001"/></div>
          </div>

          {/* Semester picker — grouped, programme-aware */}
          <div className="form-group">
            <label className="label">Semester*</label>
            {sems.length === 0
              ? <div style={{padding:'12px', borderRadius:'9px', background:'var(--surface-2)', border:'1.5px solid var(--border)', fontSize:'13px', color:'var(--text-3)'}}>
                  No semesters found. Please add semesters in <strong>Academic Schedule</strong> first.
                </div>
              : <select className="select" value={form.semId} onChange={sf('semId')}>
                  <option value="">— Select Semester —</option>
                  {Object.entries(semsByAY).map(([ayLabel, ayS]: any) => (
                    <optgroup key={ayLabel} label={`AY ${ayLabel}`}>
                      {ayS.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          Sem {s.semNumber} — Year {getYearFromSem(s.semNumber)} {s.isActive ? '(Active)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
            }
            {/* Auto-filled year display */}
            {selectedSem && (
              <div style={{marginTop:'7px', padding:'8px 12px', borderRadius:'8px', background:'rgba(99,91,255,.06)', border:'1px solid rgba(99,91,255,.15)', fontSize:'12.5px', color:'var(--primary)'}}>
                📌 Semester {selectedSem.semNumber} → <strong>Year {yearOfStudy}</strong> of {progType === 'PG' ? '2' : '3'} (auto-calculated)
              </div>
            )}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <div className="form-group">
              <label className="label">Gender</label>
              <select className="select" value={form.gender} onChange={sf('gender')}>
                <option value="">— Select —</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group"><label className="label">Date of Birth</label><input className="input" type="date" value={form.dateOfBirth} onChange={sf('dateOfBirth')}/></div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={sf('phone')} placeholder="9876543210"/></div>
            <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={sf('email')} placeholder="student@email.com"/></div>
          </div>
        </div>

        <div className="card" style={{padding:'22px 24px'}}>
          <div style={{fontSize:'11px', fontWeight:'700', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'14px'}}>Guardian Info</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <div className="form-group"><label className="label">Guardian Name</label><input className="input" value={form.guardianName} onChange={sf('guardianName')} placeholder="Parent/Guardian name"/></div>
            <div className="form-group"><label className="label">Guardian Phone</label><input className="input" value={form.guardianPhone} onChange={sf('guardianPhone')} placeholder="9876543210"/></div>
          </div>
          <div className="form-group"><label className="label">Address</label><textarea className="textarea" rows={2} value={form.address} onChange={sf('address')} placeholder="Home address"/></div>
        </div>

        <div style={{display:'flex', gap:'9px', justifyContent:'flex-end'}}>
          <button className="btn btn-ghost btn-lg" onClick={() => router.back()}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={save} disabled={saving}>{saving ? <><span className="spinner"/>Saving…</> : 'Save Student'}</button>
        </div>
      </div>
    </div>
  )
}