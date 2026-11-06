import {cookie} from '../lib/core.js'
export default function(req,res){res.setHeader('set-cookie',cookie('',0));res.statusCode=302;res.setHeader('location','/login');res.end()}
