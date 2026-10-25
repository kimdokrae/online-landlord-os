import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const lock=JSON.parse(readFileSync('package-lock.json','utf8')),rows=[],notices=[];
for(const [location,p] of Object.entries(lock.packages)){if(!location)continue;const name=location.split('node_modules/').at(-1),files=existsSync(location)?readdirSync(location).filter(f=>/^(licen[cs]e|copying|notice)(\.|$)/i.test(f)):[];
 const found=[];for(const file of files){const full=path.join(location,file);try{const text=readFileSync(full,'utf8');if(text.length>1000000)throw Error('License file too large');found.push({file,sha256:createHash('sha256').update(text).digest('hex')});notices.push('\n===== '+name+' '+p.version+' / '+file+' =====\n'+text);}catch(e){if(e.code!=='EISDIR')throw e;}}
 rows.push({name,version:p.version,license:p.license??'UNKNOWN',optional:!!p.optional,installed:existsSync(location),notices:found});
}
const compiled='node_modules/next/dist/compiled';
if(existsSync(compiled))for(const name of readdirSync(compiled)){const dir=path.join(compiled,name);try{for(const file of readdirSync(dir).filter(f=>/^(license|notice)(\.|$)/i.test(f)))notices.push('\n===== Next.js bundled '+name+' / '+file+' =====\n'+readFileSync(path.join(dir,file),'utf8'));}catch(e){if(e.code!=='ENOTDIR')throw e;}}
mkdirSync('docs',{recursive:true});
writeFileSync('docs/dependency-license-inventory.json',JSON.stringify({formatVersion:1,source:'package-lock.json; installed license/notice files; no legal clearance implied',packages:rows},null,2)+'\n');
writeFileSync('docs/third-party-notices.txt','Third-party notices. Project code: MIT License, Copyright (c) 2026 kimdokrae; see root LICENSE. These dependencies retain their own licenses. Optional uninstalled platforms are listed in dependency-license-inventory.json.\n'+notices.join('\n'));
console.log('License inventory: '+rows.length+' locked packages, '+notices.length+' installed notices. Dependency licenses remain separate from the root MIT LICENSE.');
