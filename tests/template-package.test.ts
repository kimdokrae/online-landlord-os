import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
// @ts-expect-error Node-only release tooling is native ESM JavaScript, not application TypeScript.
import {collectFiles,checkText,crc32,zip,excludedUnverifiedAssets} from '../scripts/template-package.mjs';
import {sampleCsv,blankCsv} from '../lib/operations/sample-csv.ts';
import {legacyAssetsAvailable} from '../lib/template/legacy-assets.ts';
test('distribution CSV files exactly reproduce the live demo generator and blank header',()=>{
 assert.equal(readFileSync('public/templates/skycity-sample-finance.csv','utf8'),sampleCsv());assert.equal(readFileSync('public/templates/my-finance-template.csv','utf8'),blankCsv());
});
test('release allowlist excludes credentials, references, generated builds, private backups and histories',()=>{
 const files=collectFiles(process.cwd()) as string[];assert.ok(files.includes('LICENSE'));assert.ok(files.includes('.env.example'));assert.ok(files.includes('start-local.cmd'));assert.ok(files.includes('components/city/three-lab/lab-view.tsx'));
 for(const excluded of excludedUnverifiedAssets)assert.ok(!files.includes(excluded));
 for(const f of files){assert.ok(!/(node_modules|\.next|^\.git\/|^docs\/references|^release\/|\.release-check|\.local-backup\.json|^docs\/step)/.test(f),f);assert.ok(!f.startsWith('.env')||f==='.env.example');}
});
test('approved project license retains the 2026 kimdokrae copyright and MIT permission and warranty terms',()=>{
 const text=readFileSync('LICENSE','utf8');assert.ok(text.startsWith('MIT License\n'));assert.ok(text.includes('Copyright (c) 2026 kimdokrae'));assert.ok(text.includes('Permission is hereby granted, free of charge'));assert.ok(text.includes('THE SOFTWARE IS PROVIDED "AS IS"'));assert.equal(JSON.parse(readFileSync('package.json','utf8')).license,'MIT');assert.equal(JSON.parse(readFileSync('package-lock.json','utf8')).packages[''].license,'MIT');
});
test('legacy artwork presence checks preserve original views and require all world-v2 files',t=>{
 const root=mkdtempSync(path.join(tmpdir(),'skycity-artwork-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 assert.equal(legacyAssetsAvailable('stable',root),false);assert.equal(legacyAssetsAvailable('world-v2',root),false);assert.equal(legacyAssetsAvailable('interior',root),false);
 const dir=path.join(root,'public/skycity');mkdirSync(path.join(dir,'world-v2'),{recursive:true});writeFileSync(path.join(dir,'garden-terrain.webp'),'fixture');writeFileSync(path.join(dir,'world-v2/terrain.webp'),'fixture');writeFileSync(path.join(dir,'world-v2/interior.webp'),'fixture');
 assert.equal(legacyAssetsAvailable('stable',root),true);assert.equal(legacyAssetsAvailable('world-v2',root),false);assert.equal(legacyAssetsAvailable('interior',root),true);writeFileSync(path.join(dir,'world-v2/edge-mask.svg'),'fixture');assert.equal(legacyAssetsAvailable('world-v2',root),true);
});
test('release secret checks fail closed without including secret values in error output',()=>{
 const fake='sk-proj-'+'a'.repeat(40);assert.throws(()=>checkText('source.ts',fake),(e:unknown)=>e instanceof Error&&e.message.includes('API token')&&!e.message.includes(fake));assert.throws(()=>checkText('source.ts','postgresql:'+'//name:pass@host/db'));checkText('.env.example','APP_MODE=local-template');
});
test('ZIP writer uses standard CRC32, local/central directory headers and executable file flags',()=>{
 assert.equal(crc32(Buffer.from('123456789')),0xcbf43926);const bytes=zip([{name:'online-landlord-os/start-local.command',data:Buffer.from('hello'),executable:true}]);assert.equal(bytes.readUInt32LE(0),0x04034b50);assert.equal(bytes.readUInt32LE(bytes.length-22),0x06054b50);assert.equal(bytes.readUInt16LE(bytes.length-14),1);const central=bytes.readUInt32LE(bytes.length-6);assert.equal(bytes.readUInt32LE(central),0x02014b50);assert.equal(bytes.readUInt32LE(central+38)>>>16,0o100755);
});
