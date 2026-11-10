import {hgetall,R,readToken,seed,send} from '../../lib/core.js'
const DN=['Seg','Ter','Qua','Qui','Sex']
export async function busy(){const [A,S]=await Promise.all([hgetall('st:agenda'),seed()]),s=new Set();for(const c of S.c||[])if(c.reu)s.add(c.reu.slice(0,10)+'|'+c.reu.slice(11));for(const v of Object.values(A))if(v&&v.dia&&v.hora&&!v.skip&&!v.cancel)s.add(v.dia+'|'+v.hora)
 for(const d of week()){const i=(new Date(d+'T12:00:00Z').getUTCDay()+6)%7;for(const[k,v]of Object.entries(A))if(k.startsWith('fx-')&&v&&v.fixo===DN[i]&&v.hora&&!A['sk-'+k.slice(3)+'-'+d])s.add(d+'|'+v.hora)}return{has:k=>{const[d,h]=k.split('|'),m=+h.slice(0,2)*60+ +h.slice(3,5);for(const x of s){const[d2,h2]=x.split('|');if(d2===d&&Math.abs(+h2.slice(0,2)*60+ +h2.slice(3,5)-m)<60)return true}return false}}}
export const TIMES=['10:00','13:00','14:00','15:00','16:00','17:00']
export function week(){const o=[],d=new Date(Date.now()-3*36e5);while(o.length<5){d.setUTCDate(d.getUTCDate()+1);const w=d.getUTCDay();if(w&&w<6)o.push(d.toISOString().slice(0,10))}return o}
export default async function(req,res){const t=new URL(req.url,'http://x').searchParams.get('t');let loja='';if(t){const id=readToken(t),c=id&&(await seed()).c.find(x=>x.id===id);if(!c)return send(res,404,{error:'Link inválido'});loja=c.name}
 const W=week(),B=await busy(),days=W.map(d=>({d,t:TIMES.filter(h=>!B.has(d+'|'+h))}));res.setHeader('cache-control','no-store');send(res,200,{loja,days})}
