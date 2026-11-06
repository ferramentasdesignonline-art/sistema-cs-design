import {body,checkPass,cookie,ip,R,send,sign,users} from '../lib/core.js'
export default async function(req,res){if(req.method!=='POST')return send(res,405,{})
 const k='lg:'+ip(req),n=await R('INCR',k);if(n===1)await R('EXPIRE',k,900);if(n>8)return send(res,429,{error:'Muitas tentativas. Aguarde 15 minutos.'})
 const{u,p}=await body(req),x=users().find(y=>y.u===String(u||'').trim().toLowerCase())
 if(!x||!checkPass(String(p||''),x.h))return send(res,401,{error:'Usuário ou senha incorretos'})
 await R('DEL',k);res.setHeader('set-cookie',cookie(sign(x),43200));send(res,200,{ok:true})}
