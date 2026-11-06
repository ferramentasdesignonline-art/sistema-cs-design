import {body,guard,send} from '../lib/core.js'
export default async function(req,res){if(!guard(req,res))return;if(!process.env.ANTHROPIC_API_KEY)return send(res,503,{error:'ANTHROPIC_API_KEY ausente'})
 const{input,images=[]}=await body(req);let m=Array.isArray(input)?input.map(x=>({role:x.role,content:String(x.content).slice(0,130000)})):[{role:'user',content:String(input).slice(0,130000)}]
 if(images.length){const l=m[m.length-1];l.content=[...images.slice(0,6).map(i=>({type:'image',source:{type:'base64',media_type:i.m,data:i.d}})),{type:'text',text:l.content}]}
 const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model:'claude-sonnet-5-5',max_tokens:2500,messages:m})})
 if(!r.ok)return send(res,502,{error:'Claude '+r.status});const j=await r.json();send(res,200,{text:j.content.map(c=>c.text||'').join('')})}
