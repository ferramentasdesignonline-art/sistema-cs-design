import {R,readToken,seed,send} from '../../lib/core.js'
export const TIMES=['10:00','13:00','14:00','15:00','16:00','17:00']
export function week(){const o=[],d=new Date(Date.now()-3*36e5);while(o.length<5){d.setUTCDate(d.getUTCDate()+1);const w=d.getUTCDay();if(w&&w<6)o.push(d.toISOString().slice(0,10))}return o}
export default async function(req,res){const t=new URL(req.url,'http://x').searchParams.get('t');let loja='';if(t){const id=readToken(t),c=id&&(await seed()).c.find(x=>x.id===id);if(!c)return send(res,404,{error:'Link inválido'});loja=c.name}
 const W=week(),K=W.flatMap(d=>TIMES.map(h=>`slot:${d}:${h}`)),v=await R('MGET',...K),days=W.map((d,i)=>({d,t:TIMES.filter((h,j)=>!v[i*TIMES.length+j])}));res.setHeader('cache-control','no-store');send(res,200,{loja,days})}
