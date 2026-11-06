import {readPrivate,session} from '../lib/core.js'
export default function(req,res){if(!session(req)){res.statusCode=302;res.setHeader('location','/login');return res.end()}
 res.setHeader('content-type','text/html; charset=utf-8');res.setHeader('cache-control','no-store');res.end(readPrivate('app.html'))}
