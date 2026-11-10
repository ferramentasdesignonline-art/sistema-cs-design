import {body,hset,ip,R,readToken,send} from '../../lib/core.js'
import {TIMES,week} from './slots.js'
const MEET=process.env.MEET_LINK||'https://meet.google.com/gvu-oeyw-bsg'
export default async function(req,res){if(req.method!=='POST')return send(res,405,{})
 const k='bk:'+ip(req),n=await R('INCR',k);if(n===1)await R('EXPIRE',k,600);if(n>10)return send(res,429,{error:'Tente de novo em alguns minutos'})
 const{t,dia,hora,nome,email,wa,loja,tipo}=await body(req),cid=t?readToken(t):null,clean=s=>String(s||'').slice(0,120).trim()
 if((t&&!cid)||!week().includes(dia)||!TIMES.includes(hora)||!clean(nome)||!/.+@.+\..+/.test(String(email))||!/^(55)?\d{10,11}$/.test(String(wa||'').replace(/\D/g,'')))return send(res,400,{error:'Confira os dados'})
 if(!await R('SET',`slot:${dia}:${hora}`,clean(email),'NX','EX',1209600))return send(res,409,{error:'Esse horário acabou de ser reservado'})
 const fone=String(wa).replace(/\D/g,'').replace(/^(?!55)/,'55'),a={cid,dia,hora,nome:clean(nome),email:clean(email),wa:fone,loja:clean(loja),tipo:tipo==='Onboarding'?'Onboarding':'Reunião'};await hset('agenda',`bk-${Date.now()}`,a)
 const L=process.env.CLICKUP_AGENDA_LIST;if(L&&process.env.CLICKUP_TOKEN){try{await fetch(`https://api.clickup.com/api/v2/list/${L}/task`,{method:'POST',headers:{authorization:process.env.CLICKUP_TOKEN,'content-type':'application/json'},body:JSON.stringify({name:`${a.tipo} CS | ${a.loja||a.nome}`,description:`${a.nome} · ${a.email} · ${a.wa}\nMeet: ${MEET}`,due_date:new Date(`${dia}T${hora}:00-03:00`).getTime(),due_date_time:true})})}catch{}}
 const ok=await confirma(a);if(ok)await hset('agenda',`wa-${a.dia}-${a.hora}`,{wa:a.wa,em:new Date().toISOString()})
 send(res,200,{ok:true,meet:MEET,wa:ok})}

const DIA=d=>new Date(d+'T12:00:00-03:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',timeZone:'America/Sao_Paulo'})
async function confirma(a){const U=process.env.UAZAPI_URL,T=process.env.UAZAPI_TOKEN;if(!U||!T)return false
 const n=a.nome.split(' ')[0],txt=a.tipo==='Onboarding'
  ?`Fala, ${n}! Tudo certo? ✅\n\nSua reunião de entrada com a Design Online está confirmada:\n\n📅 ${DIA(a.dia)}, às ${a.hora}\n🎥 ${MEET}\n\nNela eu te apresento o Manual do Cliente e a gente alinha todo o começo do trabalho. Até lá!`
  :`Fala, ${n}! Tudo certo? ✅\n\nNossa reunião está confirmada:\n\n📅 ${DIA(a.dia)}, às ${a.hora}\n🎥 ${MEET}\n\nQualquer imprevisto, é só me avisar por aqui. Até lá!`
 try{const r=await fetch(U.replace(/\/$/,'')+'/send/text',{method:'POST',headers:{token:T,'content-type':'application/json',accept:'application/json'},body:JSON.stringify({number:a.wa,text:txt}),signal:AbortSignal.timeout(8000)});if(!r.ok)console.error('uazapi',r.status,(await r.text()).slice(0,300));return r.ok}catch(e){console.error('uazapi',e.message);return false}}
