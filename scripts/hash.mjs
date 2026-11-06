import {hashPass} from '../lib/core.js'
const p=process.argv[2];if(!p||p.length<10){console.error('Use: npm run hash -- "senha com 10+ caracteres"');process.exit(1)}console.log(hashPass(p))
