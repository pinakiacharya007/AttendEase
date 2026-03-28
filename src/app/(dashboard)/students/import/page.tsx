'use client'
import {useState,useEffect} from 'react'
import {useRouter} from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
export default function ImportStudentsPage(){
  const router=useRouter()
  const [sems,setSems]=useState<any[]>([])
  const [semId,setSemId]=useState('')
  const [rawText,setRawText]=useState('')
  const [preview,setPreview]=useState<any[]>([])
  const [parsing,setParsing]=useState(false)
  const [importing,setImporting]=useState(false)
  const [result,setResult]=useState<any>(null)
  const [err,setErr]=useState('')
  useEffect(()=>{fetch('/api/semesters').then(r=>r.json()).then(setSems)},[])
  async function parse(){
    if(!rawText.trim()){setErr('Paste some data first');return}
    setParsing(true);setErr('')
    const res=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:`Parse this student list into JSON. Return ONLY a JSON array with objects: {name, rollNo, examRoll, phone?, email?, yearOfStudy}. Data:\n${rawText}`})})
    const data=await res.json()
    setParsing(false)
    try{
      let arr=data.data?.records||data
      if(typeof arr==='string')arr=JSON.parse(arr.replace(/```json|```/g,'').trim())
      if(data.message){try{arr=JSON.parse(data.message.replace(/```json|```/g,'').trim())}catch{}}
      if(Array.isArray(arr))setPreview(arr)
      else setErr('Could not parse — try a cleaner format')
    }catch{setErr('Parse error. Try CSV format: Roll,Name,ExamRoll')}
  }
  function parseCSV(){
    const lines=rawText.trim().split('\n').filter(l=>l.trim())
    const rows=lines.map(l=>l.split(/[,\t|]+/).map(c=>c.trim()))
    const isHeader=(r:string[])=>r.some(c=>/name|roll|student/i.test(c))
    const start=isHeader(rows[0])?1:0
    const parsed=rows.slice(start).map(r=>({rollNo:r[0]||'',name:r[1]||r[0]||'',examRoll:r[2]||r[0]||'',phone:r[3]||'',yearOfStudy:r[4]||'1'})).filter(r=>r.rollNo&&r.name)
    setPreview(parsed)
  }
  async function doImport(){
    if(!semId){setErr('Select a semester');return}
    setImporting(true);setErr('')
    const res=await fetch('/api/students/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({students:preview,semId:Number(semId)})})
    const data=await res.json()
    setImporting(false)
    setResult(data)
  }
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Topbar title="Import Students" subtitle="Bulk import via paste or CSV"/>
      <div className="page-wrap" style={{maxWidth:'780px'}}>
        {err&&<div className="alert alert-danger">{err}</div>}
        {result&&<div className="alert alert-success">✅ Imported {result.created} students. {result.skipped>0?`${result.skipped} skipped.`:''}</div>}
        <div className="card" style={{padding:'20px 22px'}}>
          <div className="form-group"><label className="label">Target Semester*</label><select className="select" style={{maxWidth:'280px'}} value={semId} onChange={e=>setSemId(e.target.value)}><option value="">— Select Semester —</option>{sems.map(s=><option key={s.id} value={s.id}>Sem {s.semNumber} (Year {s.yearOfStudy})</option>)}</select></div>
          <div className="form-group">
            <label className="label">Paste Data (CSV, table, or plain text)</label>
            <textarea className="textarea" rows={7} value={rawText} onChange={e=>setRawText(e.target.value)} placeholder="RollNo, Name, ExamRoll, Phone&#10;BC2401, Ravi Sharma, BS2401, 9876543210&#10;BC2402, Priya Das, BS2402, 9876543211&#10;&#10;Or paste from Excel/Google Sheets…"/>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button className="btn btn-primary" onClick={parse} disabled={parsing}>{parsing?<><span className="spinner"/>AI Parsing…</>:'🤖 Parse with AI'}</button>
            <button className="btn btn-ghost" onClick={parseCSV}>📋 Parse CSV</button>
          </div>
        </div>
        {preview.length>0&&(
          <>
            <div className="card" style={{padding:'18px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'11px'}}>
                <div style={{fontWeight:'700',fontSize:'13.5px'}}>Preview — {preview.length} students</div>
                <button className="btn btn-primary" onClick={doImport} disabled={importing}>{importing?<><span className="spinner"/>Importing…</>:`📥 Import ${preview.length} Students`}</button>
              </div>
              <table className="table">
                <thead><tr><th>Roll No</th><th>Name</th><th>Exam Roll</th><th>Phone</th><th>Year</th></tr></thead>
                <tbody>
                  {preview.slice(0,20).map((s,i)=>(
                    <tr key={i}>
                      <td style={{fontFamily:'monospace',fontSize:'12px'}}>{s.rollNo}</td>
                      <td style={{fontWeight:'500'}}>{s.name}</td>
                      <td style={{fontFamily:'monospace',fontSize:'12px',color:'var(--text-3)'}}>{s.examRoll}</td>
                      <td style={{color:'var(--text-3)'}}>{s.phone||'—'}</td>
                      <td>{s.yearOfStudy||1}</td>
                    </tr>
                  ))}
                  {preview.length>20&&<tr><td colSpan={5} style={{textAlign:'center',color:'var(--text-4)',fontSize:'12px',padding:'8px'}}>…and {preview.length-20} more</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
