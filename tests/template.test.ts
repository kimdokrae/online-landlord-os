import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectWelcome,validateWelcome,onboardingKey,localWorkspaceKeys,newWelcome} from '../lib/template/onboarding.ts';
import {exportWorkspace,restoreWorkspace,validateBackup} from '../lib/template/backup.ts';
import {publicSettings,publicAssets} from '../lib/public-demo/preset.ts';
import {emptyDiscovery} from '../lib/automation/model.ts';
import {emptyState} from '../lib/operations/model.ts';
test('first run is pending only for an empty local workspace; prior or corrupt data never triggers automatic reset',()=>{
 const m=new Map<string,string>(),s={getItem:(k:string)=>m.get(k)??null};
 assert.equal(inspectWelcome(s).auto,true);m.set(localWorkspaceKeys.settings,'invalid-but-existing');assert.equal(inspectWelcome(s).auto,false);
 m.set(onboardingKey,JSON.stringify({...newWelcome(),choice:'company',step:2}));assert.equal(inspectWelcome(s).progress.step,2);
 m.set(onboardingKey,'corrupt');assert.throws(()=>inspectWelcome(s));assert.equal(m.get(localWorkspaceKeys.settings),'invalid-but-existing');
 assert.throws(()=>validateWelcome({...newWelcome(),step:4}));assert.throws(()=>validateWelcome({...newWelcome(),version:2}));assert.throws(()=>validateWelcome({...newWelcome(),secret:'not-allowed'}));
});
function fixture(){const m=new Map<string,string>([[localWorkspaceKeys.settings,JSON.stringify(publicSettings())],[localWorkspaceKeys.assets,JSON.stringify({version:1,assets:publicAssets()})],[localWorkspaceKeys.discovery,JSON.stringify(emptyDiscovery())],[localWorkspaceKeys.operations,JSON.stringify(emptyState('local-template'))],[onboardingKey,JSON.stringify({...newWelcome(),status:'completed',choice:'demo'})]]);return {m,store:{getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>{m.set(k,v);},removeItem:(k:string)=>{m.delete(k);}}};}
test('private backup roundtrip preserves exact original keys and never contains unrelated credential storage',()=>{
 const {m,store}=fixture();m.set('unrelated-private-key','do-not-export');const raw=exportWorkspace(store),original=new Map(m);assert.ok(!raw.includes('do-not-export'));m.set(localWorkspaceKeys.settings,JSON.stringify({...publicSettings(),company:{...publicSettings().company,name:'changed'}}));restoreWorkspace(raw,store);assert.deepEqual(m,original);
 for(const bad of [{...JSON.parse(raw),version:2},{...JSON.parse(raw),secret:'x'},{...JSON.parse(raw),slots:{...JSON.parse(raw).slots,settings:'invalid'}}]){assert.throws(()=>restoreWorkspace(JSON.stringify(bad),store));assert.deepEqual(m,original);}
 assert.equal(validateBackup(JSON.parse(raw)).kind,'private-local-workspace');
});
test('private restore validates all slots before writes, and rolls back a partial storage failure',()=>{
 const {m,store}=fixture(),original=new Map(m),b=JSON.parse(exportWorkspace(store));b.slots.settings=JSON.stringify({...publicSettings(),company:{...publicSettings().company,name:'new'}});let failed=false;
 const faulty={...store,setItem:(k:string,v:string)=>{if(k===localWorkspaceKeys.operations&&!failed){failed=true;throw Error('quota');}store.setItem(k,v);}};
 assert.throws(()=>restoreWorkspace(JSON.stringify(b),faulty),/원복/);assert.deepEqual(m,original);
});

test('unfinished choice marker does not force a wizard after the user configured their company directly',()=>{
 const m=new Map<string,string>([[onboardingKey,JSON.stringify(newWelcome())],[localWorkspaceKeys.settings,JSON.stringify(publicSettings())]]),storage={getItem:(k:string)=>m.get(k)??null};const original=m.get(onboardingKey);assert.equal(inspectWelcome(storage).auto,false);assert.equal(inspectWelcome(storage).existing,true);assert.equal(m.get(onboardingKey),original);m.set(onboardingKey,JSON.stringify({...newWelcome(),choice:'company',step:2}));assert.equal(inspectWelcome(storage).auto,true);
});
