'use client'
import {useEffect, useState} from 'react'
import Topbar from '@/components/layout/Topbar'

export default function HodsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [depts, setDepts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPassModal, setShowPassModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [form, setForm] = useState({name:'', username:'', password:'', email:'', phone:'', deptId:''})
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [passErr, setPassErr] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [usersRes, deptRes] = await Promise.all([
        fetch('/api/users?role=HOD'),
        fetch('/api/departments')
      ])
      const usersData = usersRes.ok ? await usersRes.json().catch(() => []) : []
      const deptsData = deptRes.ok ? await deptRes.json().catch(() => []) : []
      setUsers(Array.isArray(usersData) ? usersData : [])
      setDepts(Array.isArray(deptsData) ? deptsData : [])
    } catch (error) {
      setUsers([])
      setDepts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {load()}, [])

  async function save() {
    if (!form.name || !form.username || !form.password) {setErr('Name, username and password are required'); return}
    setSaving(true); setErr('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...form, role: 'HOD', deptId: form.deptId ? Number(form.deptId) : undefined})
      })
      const data = await res.json().catch(() => ({error: 'Invalid server response'}))
      setSaving(false)
      if (!res.ok) {setErr(data.error || `Error ${res.status}`); return}
      setShowModal(false); load()
    } catch (error:any) {
      setSaving(false)
      setErr(error?.message || 'Network error')
    }
  }

  async function changePassword() {
    if (!newPass || newPass.length < 6) {setPassErr('Password must be at least 6 characters'); return}
    setSaving(true); setPassErr('')
    const res = await fetch(`/api/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({password: newPass})
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {setPassErr(data.error || 'Error'); return}
    setShowPassModal(false); setNewPass(''); setSelectedUser(null)
  }

  async function toggleActive(u: any) {
    await fetch(`/api/users/${u.id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({isActive: !u.isActive})
    })
    load()
  }

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
      <Topbar title="HOD Accounts" subtitle="Manage department heads" actions={
        <button className="btn btn-primary" onClick={() => {setForm({name:'', username:'', password:'', email:'', phone:'', deptId:''}); setErr(''); setShowModal(true)}}>
          + Add HOD
        </button>
      }/>
      <div className="page-wrap">
        {loading
          ? <div style={{textAlign:'center', padding:'40px', color:'var(--text-4)'}}>Loading…</div>
          : <div className="card">
              {users.length === 0
                ? <div className="empty"><div className="empty-icon">👤</div><div className="empty-title">No HODs yet</div></div>
                : <table className="table">
                    <thead>
                      <tr><th>Name</th><th>Username</th><th>Department</th><th>Email</th><th>Last Login</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td style={{fontWeight:'500'}}>{u.name}</td>
                          <td style={{fontFamily:'monospace', fontSize:'12px'}}>{u.username}</td>
                          <td>{u.department?.name || <span style={{color:'var(--text-4)'}}>Unassigned</span>}</td>
                          <td style={{color:'var(--text-3)'}}>{u.email || '—'}</td>
                          <td style={{color:'var(--text-3)', fontSize:'12px'}}>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}</td>
                          <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-gray'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <div style={{display:'flex', gap:'6px'}}>
                              <button className="btn btn-ghost btn-sm" onClick={() => {setSelectedUser(u); setNewPass(''); setPassErr(''); setShowPassModal(true)}}>
                                🔑 Password
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
        }
      </div>

      {/* Add HOD Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => {if (e.target === e.currentTarget) setShowModal(false)}}>
          <div className="modal">
            <div className="modal-title">Add HOD Account</div>
            {err && <div className="alert alert-danger">{err}</div>}
            <div className="form-group">
              <label className="label">Full Name*</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Dr. John Smith" autoFocus/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div className="form-group">
                <label className="label">Username*</label>
                <input className="input" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value.toLowerCase().replace(/\s/g, '_')}))} placeholder="hod_bca"/>
              </div>
              <div className="form-group">
                <label className="label">Password*</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="Min 6 chars"/>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="hod@uni.edu"/>
              </div>
              <div className="form-group">
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="9876543210"/>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Department</label>
              <select className="select" value={form.deptId} onChange={e => setForm(f => ({...f, deptId: e.target.value}))}>
                <option value="">— Select Department —</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
            <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner"/>Saving…</> : 'Create HOD'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPassModal && selectedUser && (
        <div className="modal-overlay" onClick={e => {if (e.target === e.currentTarget) {setShowPassModal(false); setSelectedUser(null)}}}>
          <div className="modal">
            <div className="modal-title">Change Password</div>
            <div style={{fontSize:'13px', color:'var(--text-3)', marginBottom:'16px'}}>
              Changing password for <strong>{selectedUser.name}</strong>
              <span style={{fontFamily:'monospace', fontSize:'12px', color:'var(--text-4)', marginLeft:'6px'}}>({selectedUser.username})</span>
            </div>
            {passErr && <div className="alert alert-danger">{passErr}</div>}
            <div className="form-group">
              <label className="label">New Password*</label>
              <input className="input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" autoFocus/>
            </div>
            <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={() => {setShowPassModal(false); setSelectedUser(null)}}>Cancel</button>
              <button className="btn btn-primary" onClick={changePassword} disabled={saving}>
                {saving ? <><span className="spinner"/>Saving…</> : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}