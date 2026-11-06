import {allState,cronOk,R,send} from '../../lib/core.js'
export default async function(req,res){if(!cronOk(req))return send(res,401,{})
 const k='bk:'+new Date().toISOString().slice(0,10);await R('SET',k,JSON.stringify(await allState()),'EX',60*60*24*35);send(res,200,{ok:k})}
