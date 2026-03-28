'use client'
interface Props{title:string;subtitle?:string;actions?:React.ReactNode}
export default function Topbar({title,subtitle,actions}:Props){
  return(
    <header style={{height:'58px',flexShrink:0,background:'rgba(255,255,255,.93)',backdropFilter:'blur(12px)',borderBottom:'1.5px solid var(--border)',display:'flex',alignItems:'center',padding:'0 22px',gap:'14px',position:'sticky',top:0,zIndex:40}}>
      <div style={{flex:1}}>
        <h1 style={{fontSize:'15px',fontWeight:'700',color:'var(--text-1)',margin:0,lineHeight:1.2}}>{title}</h1>
        {subtitle&&<p style={{fontSize:'11.5px',color:'var(--text-4)',margin:0}}>{subtitle}</p>}
      </div>
      {actions&&<div style={{display:'flex',alignItems:'center',gap:'8px'}}>{actions}</div>}
    </header>
  )
}
