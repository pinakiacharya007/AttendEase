'use client'
import {useState, useEffect} from 'react'
interface Props{title:string;subtitle?:string;actions?:React.ReactNode}
export default function Topbar({title,subtitle,actions}:Props){
  const [isMobile,setIsMobile]=useState(false)
  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<=640)
    check()
    window.addEventListener('resize',check)
    return()=>window.removeEventListener('resize',check)
  },[])
  return(
    <header style={{flexShrink:0,background:'rgba(255,255,255,.93)',backdropFilter:'blur(12px)',borderBottom:'1.5px solid var(--border)',display:'flex',alignItems:'center',padding:isMobile?'10px 14px 10px 52px':'0 22px',gap:'10px',position:'sticky',top:0,zIndex:40,minHeight:'52px',flexWrap:'wrap'}}>
      <div style={{flex:1,minWidth:0}}>
        <h1 style={{fontSize:isMobile?'14px':'15px',fontWeight:'700',color:'var(--text-1)',margin:0,lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</h1>
        {subtitle&&!isMobile&&<p style={{fontSize:'11.5px',color:'var(--text-4)',margin:0}}>{subtitle}</p>}
      </div>
      {actions&&<div style={{display:'flex',alignItems:'center',gap:'6px',flexShrink:0}}>{actions}</div>}
    </header>
  )
}