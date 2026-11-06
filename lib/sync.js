import fs from 'node:fs'
import path from 'node:path'
import {R,seed} from './core.js'
const F=JSON.parse(fs.readFileSync(path.join(process.cwd(),'lib/fields.json'),'utf8'))
const LIST='900101297340',GOS='901306161617',REL='1bbe66ba'
const API='https://api.clickup.com/api/v2'
async function pages(list,statuses){const out=[];for(let p=0;p<20;p++){const q=new URLSearchParams({subtasks:'false',page:p});statuses.forEach(s=>q.append('statuses[]',s));const r=await fetch(`${API}/list/${list}/task?${q}`,{headers:{authorization:process.env.CLICKUP_TOKEN}});if(!r.ok)throw new Error('ClickUp '+r.status);const j=await r.json();out.push(...j.tasks);if(j.last_page||j.tasks.length<100)break}return out}
const iso=ms=>ms?new Date(+ms-3*36e5).toISOString().slice(0,10):undefined
const optId=f=>{if(typeof f.value==='string')return f.value;const o=(f.type_config?.options||[]).find(x=>x.orderindex===f.value);return o?.id}
function client(t){const r={id:t.id,name:t.name.trim(),st:t.status.status,subt:(t.subtasks||[]).length,chk:(t.checklists||[]).map(c=>({n:c.name,r:c.resolved,u:c.unresolved}))}
 for(const f of t.custom_fields||[]){const p=f.id.slice(0,8);if(f.value==null||f.value==='')continue
  if(p==='b97245df'){const g=/instagram\.com\/([\w.]+)/.exec(f.value)||/@?([\w.]{3,30})\s*$/.exec(f.value);if(g)r.ig=`https://www.instagram.com/${g[1]}/`;continue}
  if(p==='49c1fd63'){const g=String(f.value).match(/\d{6,}/g);if(g)r.cm=g[g.length-1];continue}
  if(F.opts[p]){const v=F.opts[p].o[String(optId(f)).slice(0,8)];if(v)r[F.opts[p].k]=v}
  else if(F.keep[p]){const k=F.keep[p]
   if(k==='verba'||k==='serv'){const l=(f.value||[]).map(id=>(f.type_config?.options||[]).find(o=>o.id===id)?.label).filter(Boolean);r[k]=k==='verba'?l[0]:l}
   else r[k]=['ini','sai','vig'].includes(k)?iso(f.value):f.value}}
 const a=r.ata||'';r.ata=a.slice(0,6000);const m=/(\d{1,2})\/(\d{1,2})/.exec(a.slice(0,60));if(m){const y=new Date().getFullYear();let d=`${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;if(d>new Date().toISOString().slice(0,10))d=`${y-1}${d.slice(4)}`;r.ataD=d}
 return r}
export async function sync(){if(!process.env.CLICKUP_TOKEN)throw new Error('CLICKUP_TOKEN ausente')
 const old=await seed(),c=(await pages(LIST,['clientes - ativos','entradas | mês','saídas | mês','cliente - suspensão | adm'])).map(client)
 const d=(await pages(GOS,['demandas de reunião'])).map(t=>{const f=(t.custom_fields||[]).find(x=>x.id.startsWith(REL)),v=(f?.value||[])[0];return{id:t.id,c:typeof v==='string'?v:v?.id,n:t.name,due:iso(t.due_date)||null}}).filter(x=>x.c)
 const prev=Object.fromEntries(old.c.map(x=>[x.id,x]));c.forEach(x=>{const o=prev[x.id];if(o){x.conv=o.conv;x.cpc=o.cpc;if(!x.cm)x.cm=o.cm}})
 const s={c,d,m:old.m,ref:new Date(Date.now()-3*36e5).toISOString().slice(0,16).replace('T',' ')};await R('SET','seed',JSON.stringify(s));return{clientes:c.length,demandas:d.length}}
