'use client'
import {useState, useRef, useEffect} from 'react'
import Topbar from '@/components/layout/Topbar'

type Msg = {role: 'user' | 'ai'; text: string; action?: string; data?: any}

const SUGGESTIONS = [
  'Mark all present for Sem 1 today',
  'Who has attendance below 75%?',
  'How many students are absent today?',
  'Show attendance summary for this week',
  'Mark BC2401 and BC2402 absent for CS301',
]

export default function AIAssistantPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'ai',
    text: "Hi! I'm AttendEase AI 👋\n\nI can help you:\n• Mark attendance using plain English\n• Answer questions about attendance records\n• Flag students with low attendance\n• Summarize attendance for any subject or semester\n\nWhat would you like to do?",
    action: 'chat'
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {bottomRef.current?.scrollIntoView({behavior: 'smooth'})}, [msgs])

  async function send(text?: string) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const newMsgs: Msg[] = [...msgs, {role: 'user', text: msg}]
    setMsgs(newMsgs)
    setLoading(true)

    // Build history for multi-turn (last 10 messages)
    const history = newMsgs.slice(-10).slice(0, -1).map(m => ({role: m.role, text: m.text}))

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: msg, history})
      })
      const data = await res.json()

      let displayText = data.message || 'Done!'

      // Enrich query responses with structured data
      if (data.action === 'query' && data.data?.summary) {
        displayText += '\n\n' + (typeof data.data.summary === 'string' ? data.data.summary : JSON.stringify(data.data.summary, null, 2))
      }

      const aiMsg: Msg = {role: 'ai', text: displayText, action: data.action, data}
      setMsgs(m => [...m, aiMsg])

      if (data.action === 'mark_attendance' && data.data?.records?.length > 0) {
        setPreview(data)
      }
    } catch {
      setMsgs(m => [...m, {role: 'ai', text: 'Sorry, something went wrong. Please try again.', action: 'error'}])
    }
    setLoading(false)
  }

  async function confirmAttendance() {
    if (!preview?.data?.records) return
    setSaving(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({records: preview.data.records})
      })
      if (!res.ok) throw new Error('Failed')
      setMsgs(m => [...m, {role: 'ai', text: `✅ Done! Saved ${preview.data.records.length} attendance records successfully.`, action: 'chat'}])
      setPreview(null)
    } catch {
      setMsgs(m => [...m, {role: 'ai', text: '❌ Failed to save attendance. Please try again.', action: 'error'}])
    }
    setSaving(false)
  }

  function getActionBadge(action?: string) {
    if (!action || action === 'chat') return null
    const map: any = {
      mark_attendance: {label: 'Attendance', color: '#10b981'},
      query: {label: 'Query', color: '#635bff'},
      error: {label: 'Error', color: '#ef4444'},
    }
    const a = map[action]
    if (!a) return null
    return <span style={{fontSize:'10px',fontWeight:'700',padding:'2px 7px',borderRadius:'99px',background:a.color+'20',color:a.color,marginBottom:'5px',display:'inline-block'}}>{a.label}</span>
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <Topbar title="AI Assistant" subtitle="Natural language attendance management"/>
      <div style={{flex:1,display:'flex',flexDirection:'column',maxWidth:'800px',width:'100%',margin:'0 auto',padding:'16px 22px',gap:'12px',overflow:'hidden'}}>

        {/* Messages */}
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px',paddingBottom:'8px'}}>
          {msgs.map((m, i) => (
            <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
              <div style={{maxWidth:'85%'}}>
                {m.role === 'ai' && getActionBadge(m.action)}
                <div style={{
                  padding:'12px 16px',
                  borderRadius: m.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role==='user' ? 'linear-gradient(135deg,#635bff,#8b7fff)' : 'var(--surface)',
                  border: m.role==='ai' ? '1.5px solid var(--border)' : 'none',
                  color: m.role==='user' ? '#fff' : 'var(--text-1)',
                  fontSize:'13.5px',lineHeight:'1.7',
                  boxShadow: m.role==='user' ? '0 2px 0 #4338ca,0 4px 14px rgba(99,91,255,.25)' : '0 2px 10px rgba(0,0,0,.05)',
                  whiteSpace:'pre-wrap',wordBreak:'break-word'
                }}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{display:'flex',justifyContent:'flex-start'}}>
              <div style={{padding:'12px 16px',borderRadius:'18px 18px 18px 4px',background:'var(--surface)',border:'1.5px solid var(--border)',display:'flex',gap:'5px',alignItems:'center'}}>
                {[0,1,2].map(i => <div key={i} style={{width:'7px',height:'7px',borderRadius:'50%',background:'var(--primary)',opacity:.5,animation:`bounce3 1s ease ${i*0.15}s infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Attendance Preview */}
        {preview && preview.data?.records?.length > 0 && (
          <div className="card" style={{padding:'16px 18px',border:'2px solid var(--primary)'}}>
            <div style={{fontWeight:'700',fontSize:'13.5px',marginBottom:'10px',color:'var(--primary)'}}>
              📋 Preview — {preview.data.records.length} records to save
            </div>
            <div style={{maxHeight:'160px',overflowY:'auto',marginBottom:'12px'}}>
              <table className="table" style={{fontSize:'12px'}}>
                <thead><tr><th>Student ID</th><th>Subject ID</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {preview.data.records.slice(0, 30).map((r: any, i: number) => (
                    <tr key={i}>
                      <td>{r.studentId}</td>
                      <td>{r.subjectId}</td>
                      <td>{r.date}</td>
                      <td><span className={`badge ${r.status==='PRESENT'?'badge-success':r.status==='ABSENT'?'badge-danger':'badge-warning'}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button className="btn btn-primary" onClick={confirmAttendance} disabled={saving}>
                {saving ? <><span className="spinner"/>Saving…</> : '✅ Confirm & Save'}
              </button>
              <button className="btn btn-ghost" onClick={() => setPreview(null)}>Discard</button>
            </div>
          </div>
        )}

        {/* Suggestions — only show when conversation is fresh */}
        {msgs.length <= 1 && (
          <div style={{display:'flex',flexWrap:'wrap',gap:'7px'}}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)} className="btn btn-ghost" style={{fontSize:'12px',padding:'6px 12px',borderRadius:'99px'}}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{display:'flex',gap:'9px',alignItems:'flex-end'}}>
          <textarea
            className="textarea"
            style={{flex:1,resize:'none',borderRadius:'13px'}}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
            placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            style={{height:'52px',width:'52px',padding:'0',borderRadius:'13px',fontSize:'20px'}}
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            {loading ? <span className="spinner"/> : '→'}
          </button>
        </div>
        <div style={{fontSize:'11px',color:'var(--text-4)',textAlign:'center'}}>
          Powered by Gemini 2.0 Flash · Always verify before confirming attendance saves
        </div>
      </div>
    </div>
  )
}