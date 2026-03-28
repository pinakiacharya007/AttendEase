import {clsx,type ClassValue} from 'clsx'
import {twMerge} from 'tailwind-merge'
export const cn=(...i:ClassValue[])=>twMerge(clsx(i))
export const fmtDate=(d:Date|string)=>new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
export const todayStr=()=>new Date().toISOString().split('T')[0]
export const pct=(p:number,t:number)=>t===0?0:Math.round((p/t)*100)
