import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const [mode,command,...extra]=process.argv.slice(2),modes=['demo','public-demo','local-template'];
if(!modes.includes(mode)||!['dev','build','start'].includes(command)){console.error('지원하지 않는 실행 명령입니다.');process.exit(1);}
if(Number(process.versions.node.split('.')[0])!==24){console.error('Node.js 24를 설치한 뒤 다시 실행해 주세요.');process.exit(1);}
const require=createRequire(import.meta.url),cwd=fileURLToPath(new URL('../',import.meta.url));
let cli;try{cli=require.resolve('next/dist/bin/next');}catch{console.error('의존성이 없습니다. 이 폴더에서 npm ci를 먼저 실행하세요.');process.exit(1);}
const port=mode==='local-template'?'3003':mode==='public-demo'?'3001':'3000';
const args=[cli,command,...(command==='build'?[]:['--hostname','127.0.0.1',...(!extra.includes('--port')?['--port',port]:[])]),...extra];
const child=spawn(process.execPath,args,{cwd,env:{...process.env,APP_MODE:mode},stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('error',e=>{console.error('실행 실패:',e.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??0;});
