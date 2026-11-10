import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
const ROOT=process.cwd()
export const COLS=['checklist','contatos','folhas','agenda','config','feitas','dias','sup','atas','audits']
const secret=()=>{const s=process.env.SESSION_SECRET;if(!s||s.length<32)throw new Error('SESSION_SECRET ausente');return s}
const hmac=(t,n=64)=>crypto.createHmac('sha256',secret()).update(t).digest('hex').slice(0,n)
const eq=(a,b)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y)}
export const hashPass=(p,salt=crypto.randomBytes(16).toString('hex'))=>`scrypt$${salt}$${crypto.scryptSync(p,salt,32).toString('hex')}`
export const checkPass=(p,h)=>{const[,salt]=String(h).split('$');return !!salt&&eq(hashPass(p,salt),h)}
export const users=()=>{try{return JSON.parse(process.env.USERS_JSON||'[]')}catch{return[]}}
export function sign(u){const b=Buffer.from(JSON.stringify({u:u.u,n:u.n,r:u.r,e:Date.now()+12*36e5})).toString('base64url');return b+'.'+hmac(b)}
export function session(req){const m=/(?:^|;\s*)cdo=([^;]+)/.exec(req.headers.cookie||'');if(!m)return null;const[b,s]=m[1].split('.');if(!b||!s||!eq(hmac(b),s))return null;try{const j=JSON.parse(Buffer.from(b,'base64url'));return j.e>Date.now()?j:null}catch{return null}}
export const cookie=(v,age)=>`cdo=${v}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${process.env.DEV?'':'; Secure'}`
export function send(res,code,obj){res.statusCode=code;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store');res.end(JSON.stringify(obj))}
export function guard(req,res){const s=session(req);if(!s){send(res,401,{error:'login'});return null}return s}
export async function body(req){if(req.body&&typeof req.body==='object')return req.body;if(typeof req.body==='string')return JSON.parse(req.body||'{}');let d='';for await(const c of req)d+=c;return d?JSON.parse(d):{}}
export const ip=req=>String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'').split(',')[0].trim()
/* Redis REST (Upstash). Sem variáveis, usa memória: só para desenvolvimento. */
const mem=new Map()
export async function R(...cmd){const U=process.env.KV_REST_API_URL,T=process.env.KV_REST_API_TOKEN
 if(!U){if(!process.env.DEV)throw new Error('Banco não configurado');const[c,k,...a]=cmd,C=c.toUpperCase()
  if(C==='GET')return mem.get(k)??null
  if(C==='MGET')return[k,...a].map(x=>mem.get(x)??null)
  if(C==='SET'){if(a.includes('NX')&&mem.has(k))return null;mem.set(k,a[0]);return'OK'}
  if(C==='DEL'){mem.delete(k);return 1}
  if(C==='INCR'){const v=(+mem.get(k)||0)+1;mem.set(k,v);return v}
  if(C==='EXPIRE')return 1
  if(C==='HSET'){const h=mem.get(k)||{};for(let i=0;i<a.length;i+=2)h[a[i]]=a[i+1];mem.set(k,h);return 1}
  if(C==='HDEL'){const h=mem.get(k)||{};delete h[a[0]];mem.set(k,h);return 1}
  if(C==='HGETALL'){const h=mem.get(k)||{};return Object.entries(h).flat()}
  throw new Error('cmd '+c)}
 const r=await fetch(U,{method:'POST',headers:{authorization:`Bearer ${T}`,'content-type':'application/json'},body:JSON.stringify(cmd)});const j=await r.json();if(j.error)throw new Error(j.error);return j.result}
export async function hgetall(k){const a=await R('HGETALL',k)||[],o={};for(let i=0;i<a.length;i+=2)o[a[i]]=JSON.parse(a[i+1]);return o}
export async function allState(){const v=await Promise.all(COLS.map(c=>hgetall('st:'+c)));return Object.fromEntries(COLS.map((c,i)=>[c,v[i]]))}
export const hset=(c,id,v)=>R('HSET','st:'+c,id,JSON.stringify(v))
export const hdel=(c,id)=>R('HDEL','st:'+c,id)
export const readPrivate=f=>fs.readFileSync(path.join(ROOT,'private',f),'utf8')
export async function seed(){const s=await R('GET','seed');return s?(typeof s==='string'?JSON.parse(s):s):JSON.parse(readPrivate('seed.json'))}
export const bookToken=id=>Buffer.from(id).toString('base64url')+'.'+hmac('book:'+id,16)
export function readToken(t){const[b,s]=String(t).split('.');if(!b||!s)return null;const id=Buffer.from(b,'base64url').toString();return eq(hmac('book:'+id,16),s)?id:null}
export const cronOk=req=>{const c=process.env.CRON_SECRET;return !!c&&req.headers.authorization===`Bearer ${c}`}
