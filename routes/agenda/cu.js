import {body,guard,send} from '../../lib/core.js'
import {setReu} from '../../lib/agenda.js'
export default async function(req,res){if(!guard(req,res))return;if(req.method!=='POST')return send(res,405,{})
 const{cid,d,h,old}=await body(req);if(!/^\w{6,20}$/.test(cid||'')||(d&&(!/^\d{4}-\d\d-\d\d$/.test(d)||!/^\d\d:\d\d$/.test(h||'')))||(old&&!/^\d{4}-\d\d-\d\d \d\d:\d\d$/.test(old)))return send(res,400,{error:'inválido'})
 try{const cu=await setReu(cid,d||null,h||null,old||null);send(res,200,{ok:true,clickup:cu})}catch(e){send(res,500,{error:e.message})}}
