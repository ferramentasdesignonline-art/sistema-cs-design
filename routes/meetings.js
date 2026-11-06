import {guard,hgetall,R,send} from '../lib/core.js'
export default async function(req,res){if(!guard(req,res))return;const id=new URL(req.url,'http://x').searchParams.get('id')
 if(id)return send(res,200,{transcript:await R('GET','tr:'+id)||''});const h=await hgetall('st:reunioes');send(res,200,{results:Object.values(h).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,60)})}
