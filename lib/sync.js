import fs from 'node:fs'
import path from 'node:path'
import {R,seed} from './core.js'
const F=JSON.parse(fs.readFileSync(path.join(process.cwd(),'lib/fields.json'),'utf8'))
const LIST='900101297340',GOS='901306161617',REL='1bbe66ba'
const API='https://api.clickup.com/api/v2'
async function get(url){for(let t=0;t<4;t++){const r=await fetch(url,{headers:{authorization:process.env.CLICKUP_TOKEN}});if(r.ok)return r.json();if(r.status===401)throw new Error('Token do ClickUp inválido (CLICKUP_TOKEN)');if(r.status!==429&&r.status<500)throw new Error('ClickUp '+r.status);await new Promise(z=>setTimeout(z,800*(t+1)))}throw new Error('ClickUp indisponível')}
async function pages(list,statuses,timl){const out=[];for(let p=0;p<20;p++){const q=new URLSearchParams({subtasks:'false',page:p});if(timl)q.set('include_timl','true');statuses.forEach(s=>q.append('statuses[]',s));const j=await get(`${API}/list/${list}/task?${q}`);out.push(...j.tasks);if(j.last_page||j.tasks.length<100)break}return out}
const iso=ms=>ms?new Date(+ms-3*36e5).toISOString().slice(0,10):undefined
const optId=f=>{if(typeof f.value==='string')return f.value;const o=(f.type_config?.options||[]).find(x=>x.orderindex===f.value);return o?.id}
const BOOL=['iaJ','iaW','vmPre','vmPos','npsS'],DATES=['ini','sai','vig','vmD']
function fields(list,r){for(const f of list||[]){const p=f.id.slice(0,8);if(f.value==null||f.value===''||(Array.isArray(f.value)&&!f.value.length))continue
  if(p==='b97245df'){const g=/instagram\.com\/([\w.]+)/.exec(f.value)||/@?([\w.]{3,30})\s*$/.exec(f.value);if(g)r.ig=`https://www.instagram.com/${g[1]}/`;continue}
  if(p==='49c1fd63'){const g=String(f.value).match(/\d{6,}/g);if(g)r.cm=g[g.length-1];continue}
  if(F.opts[p]){const v=F.opts[p].o[String(optId(f)).slice(0,8)];if(v)r[F.opts[p].k]=v}
  else if(F.keep[p]){const k=F.keep[p];if(k==='r')continue
   if(k==='verba'||k==='serv'){const l=(f.value||[]).map(id=>(f.type_config?.options||[]).find(o=>o.id===id)?.label).filter(Boolean);r[k]=k==='verba'?l[0]:l}
   else if(DATES.includes(k))r[k]=iso(f.value)
   else if(BOOL.includes(k))r[k]=f.value===true||f.value==='true'
   else if(k==='end')r[k]=String(f.value.formatted_address||'').slice(0,140)
   else r[k]=typeof f.value==='string'?f.value.trim():f.value}}
 return r}
function client(t){const r=fields(t.custom_fields,{id:t.id,name:t.name.trim(),st:t.status.status,subt:(t.subtasks||[]).length,chk:(t.checklists||[]).map(c=>({n:c.name,r:c.resolved,u:c.unresolved}))})
 const a=r.ata||'';r.ata=a.slice(0,6000);const m=/(\d{1,2})\/(\d{1,2})/.exec(a.slice(0,60));if(m){const y=new Date().getFullYear();let d=`${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;if(d>new Date().toISOString().slice(0,10))d=`${y-1}${d.slice(4)}`;r.ataD=d}
 return r}
export const OPEN=['falta arte | edição','falta aprovação','falta gravação','programado','pendente','falta anúncio','em andamento','standb-by','demandas de reunião']
const IA_LIST='901324814862',VM_LIST='901312033211'
export async function sync(){const t0=Date.now()
 try{if(!process.env.CLICKUP_TOKEN)throw new Error('Falta o CLICKUP_TOKEN nas variáveis da Vercel')
 const old=await seed(),[cl,ia,vm,gt]=await Promise.all([pages(LIST,['clientes - ativos','entradas | mês','saídas | mês','cliente - suspensão | adm']),pages(IA_LIST,[],true).catch(e=>(console.error('IA',e.message),[])),pages(VM_LIST,[],true).catch(e=>(console.error('VM',e.message),[])),pages(GOS,OPEN)])
 const c=cl.map(client),by=Object.fromEntries(c.map(x=>[x.id,x]))
 for(const t of[...ia,...vm]){const x=by[t.id];if(x){const e=fields(t.custom_fields,{});for(const k in e)if(x[k]==null)x[k]=e[k]}}
 const g=gt.map(t=>{const f=(t.custom_fields||[]).find(x=>x.id.startsWith(REL)),v=(f?.value||[])[0];return{id:t.id,c:typeof v==='string'?v:v?.id,n:t.name,st:t.status.status,due:iso(t.due_date)||null}}).filter(x=>x.c)
 const d=g.filter(x=>x.st==='demandas de reunião')
 const prev=Object.fromEntries(old.c.map(x=>[x.id,x]));c.forEach(x=>{const o=prev[x.id];if(o){x.conv=o.conv;x.cpc=o.cpc;if(!x.cm)x.cm=o.cm}})
 const H=c.filter(x=>x.ataD).flatMap(x=>[`${x.id}:${x.ataD}`,JSON.stringify({cid:x.id,d:x.ataD})]);if(H.length)await R('HSET','hist:atas',...H)
 const ref=new Date(Date.now()-3*36e5).toISOString().slice(0,16).replace('T',' '),s={c,d,g,m:[],ref};await R('SET','seed',JSON.stringify(s))
 const out={ok:true,em:new Date().toISOString(),clientes:c.length,demandas:g.length,ms:Date.now()-t0};await R('SET','sync:last',JSON.stringify(out));return out}
 catch(e){await R('SET','sync:last',JSON.stringify({ok:false,em:new Date().toISOString(),erro:e.message})).catch(()=>{});throw e}}
