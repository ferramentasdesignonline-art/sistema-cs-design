import {body,hset,ip,R,readToken,send} from '../../lib/core.js'
import {TIMES,week} from './slots.js'
export default async function(req,res){if(req.method!=='POST')return send(res,405,{})
 const k='bk:'+ip(req),n=await R('INCR',k);if(n===1)await R('EXPIRE',k,600);if(n>10)return send(res,429,{error:'Tente de novo em alguns minutos'})
 const{t,dia,hora,nome,email,loja,tipo}=await body(req),cid=t?readToken(t):null,clean=s=>String(s||'').slice(0,120).trim()
 if((t&&!cid)||!week().includes(dia)||!TIMES.includes(hora)||!clean(nome)||!/.+@.+\..+/.test(String(email)))return send(res,400,{error:'Confira os dados'})
 if(!await R('SET',`slot:${dia}:${hora}`,clean(email),'NX','EX',1209600))return send(res,409,{error:'Esse horário acabou de ser reservado'})
 const a={cid,dia,hora,nome:clean(nome),email:clean(email),loja:clean(loja),tipo:tipo==='Onboarding'?'Onboarding':'Reunião'};await hset('agenda',`bk-${Date.now()}`,a)
 const L=process.env.CLICKUP_AGENDA_LIST;if(L&&process.env.CLICKUP_TOKEN){try{await fetch(`https://api.clickup.com/api/v2/list/${L}/task`,{method:'POST',headers:{authorization:process.env.CLICKUP_TOKEN,'content-type':'application/json'},body:JSON.stringify({name:`${a.tipo} CS | ${a.loja||a.nome}`,description:`${a.nome} · ${a.email}`,due_date:new Date(`${dia}T${hora}:00-03:00`).getTime(),due_date_time:true})})}catch{}}
 send(res,200,{ok:true,meet:process.env.MEET_LINK||''})}
