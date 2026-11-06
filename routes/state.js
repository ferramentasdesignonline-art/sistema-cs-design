import {body,COLS,guard,hdel,hset,send} from '../lib/core.js'
export default async function(req,res){if(!guard(req,res))return;if(req.method!=='POST')return send(res,405,{})
 const{col,id,data}=await body(req);if(!COLS.includes(col)||!/^[\w.:-]{1,120}$/.test(id||''))return send(res,400,{error:'inválido'})
 if(data===null)await hdel(col,id);else{if(JSON.stringify(data).length>20000)return send(res,413,{});await hset(col,id,data)}send(res,200,{ok:true})}
