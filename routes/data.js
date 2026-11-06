import {allState,bookToken,guard,seed,send} from '../lib/core.js'
export default async function(req,res){const s=guard(req,res);if(!s)return
 const d=await seed(),host=`https://${req.headers.host}`;d.c.forEach(c=>c.link=`${host}/agendar/${bookToken(c.id)}`)
 send(res,200,{seed:d,state:await allState(),user:{n:s.n,r:s.r}})}
