import {allState,bookToken,guard,hgetall,R,seed,send} from '../lib/core.js'
const pad=n=>String(n).padStart(2,'0')
function reunioes(c,ing,atas){const lim=new Date(Date.now()-120*864e5).toISOString().slice(0,10),out=[],ja=new Set()
 for(const m of Object.values(ing)){const at=(m.attendees||[]).map(String),out1=at.filter(a=>!/thiago|davi/i.test(a)),w=out1[0]||at[0]||'';if(!w)continue
  const d=new Date(new Date(m.date).getTime()-3*36e5),dia=d.toISOString().slice(0,10);if(dia<lim)continue
  const f=w.split(/[ @]/)[0].toLowerCase(),cs=f.length>2?c.filter(x=>x.st!=='saídas | mês'&&((x.dec||'').toLowerCase().includes(f)||(x.name||'').toLowerCase().includes(f))):[]
  const cid=cs.length===1?cs[0].id:null;out.push({id:m.id,d:dia,h:pad(d.getUTCHours())+':'+pad(d.getUTCMinutes()),min:m.min||0,who:w,cid,t:m.title||''});if(cid)ja.add(cid+':'+dia)}
 for(const a of Object.values(atas)){if(a.d<lim||ja.has(a.cid+':'+a.d))continue;const x=c.find(y=>y.id===a.cid);if(!x)continue;out.push({id:'ata-'+a.cid+'-'+a.d,d:a.d,h:'',min:0,who:x.dec||x.name,cid:a.cid,t:'ATA registrada'})}
 return out.sort((a,b)=>(b.d+b.h).localeCompare(a.d+a.h))}
export default async function(req,res){const s=guard(req,res);if(!s)return
 const [d,state,ing,atas,last]=await Promise.all([seed(),allState(),hgetall('st:reunioes'),hgetall('hist:atas'),R('GET','sync:last')]),host=`https://${req.headers.host}`
 d.c.forEach(c=>c.link=`${host}/agendar/${bookToken(c.id)}`);d.m=reunioes(d.c,ing,atas)
 send(res,200,{seed:d,state,user:{n:s.n,r:s.r},sync:last?(typeof last==='string'?JSON.parse(last):last):null})}
