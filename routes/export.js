import {allState,guard,send} from '../lib/core.js'
export default async function(req,res){const s=guard(req,res);if(!s)return;res.setHeader('content-disposition',`attachment; filename=central-backup.json`);send(res,200,await allState())}
