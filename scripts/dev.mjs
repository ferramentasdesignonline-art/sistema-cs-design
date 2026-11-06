import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url'
process.env.DEV='1';process.env.SESSION_SECRET||='d'.repeat(40)
const{hashPass}=await import('../lib/core.js');process.env.USERS_JSON||=JSON.stringify([{u:'thiago',n:'Thiago',r:'cs',h:hashPass('senha-de-teste')}])
const cw=process.cwd();http.createServer(async(q,s)=>{let u=new URL(q.url,'http://x').pathname;if(u==='/'){u='/api/app';q.url='/api/main?p=app'}if(u==='/login')u='/login.html';if(u.startsWith('/agendar'))u='/agendar.html'
 try{if(u.startsWith('/api/')){const m=await import(pathToFileURL(path.join(cw,'api/main.js')));return await m.default(q,s)}
 const f=path.join(cw,'public',u);if(!fs.existsSync(f)){s.statusCode=404;return s.end()}s.setHeader('content-type','text/html; charset=utf-8');s.end(fs.readFileSync(f))}catch(e){console.error(e);s.statusCode=500;s.end(String(e))}}).listen(+process.env.PORT||3100,()=>console.log('ok'))
