import {R,readToken,seed,send} from '../../lib/core.js'
export const TIMES=['13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']
export function week(){const o=[],d=new Date(Date.now()-3*36e5);while(o.length<5){d.setUTCDate(d.getUTCDate()+1);const w=d.getUTCDay();if(w&&w<6)o.push(d.toISOString().slice(0,10))}return o}
export default async function(req,res){const t=new URL(req.url,'http://x').searchParams.get('t');let loja='';if(t){const id=readToken(t),c=id&&(await seed()).c.find(x=>x.id===id);if(!c)return send(res,404,{error:'Link inválido'});loja=c.name}
 const days=[];for(const d of week()){const l=[];for(const h of TIMES)if(!await R('GET',`slot:${d}:${h}`))l.push(h);days.push({d,t:l})}send(res,200,{loja,days})}
