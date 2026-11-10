import {R,seed} from './core.js'
const API='https://api.clickup.com/api/v2'
export const dtBR=ms=>{if(!ms)return null;const d=new Date(+ms-3*36e5).toISOString();return{d:d.slice(0,10),h:d.slice(11,16)}}
export const msBR=(d,h)=>new Date(`${d}T${h||'12:00'}:00-03:00`).getTime()
// grava a reunião na data de entrega do card do cliente (calendário ⚠️REUNIÕES do ClickUp)
export async function setReu(cid,d,h,old){const T=process.env.CLICKUP_TOKEN;let cu=false
 if(T){const r=await fetch(`${API}/task/${cid}`,{method:'PUT',headers:{authorization:T,'content-type':'application/json'},body:JSON.stringify(d?{due_date:msBR(d,h),due_date_time:true}:{due_date:null})});cu=r.ok;if(!r.ok)console.error('clickup due',r.status,(await r.text()).slice(0,200))}
 const s=await seed(),c=s.c.find(x=>x.id===cid);if(c){c.reu=d?`${d} ${h}`:null;await R('SET','seed',JSON.stringify(s))}
 if(old)await R('HDEL','hist:reu',`${cid}:${old}`);if(d)await R('HSET','hist:reu',`${cid}:${d} ${h}`,JSON.stringify({cid,d,h}))
 return cu}
