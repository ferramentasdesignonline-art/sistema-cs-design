import {body,R,send} from '../lib/core.js'
/* Recebe a reunião enviada pelo Zapier (gatilho do Tactiq + Webhooks). */
export default async function(req,res){if(!process.env.INGEST_TOKEN||req.headers['x-token']!==process.env.INGEST_TOKEN)return send(res,401,{})
 const b=await body(req),id=String(b.id||Date.now()),att=Array.isArray(b.attendees)?b.attendees:String(b.attendees||'').split(',').map(s=>s.trim()).filter(Boolean)
 await R('HSET','st:reunioes',id,JSON.stringify({id,title:b.title||'',date:b.date||new Date().toISOString(),attendees:att}));await R('SET','tr:'+id,String(b.transcript||''),'EX',60*60*24*60);send(res,200,{ok:true})}
