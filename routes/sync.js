import {guard,send} from '../lib/core.js'
import {sync} from '../lib/sync.js'
export default async function(req,res){if(!guard(req,res))return;try{send(res,200,await sync())}catch(e){send(res,502,{error:e.message})}}
