import test from 'node:test';
import assert from 'node:assert/strict';
import { initialAssets } from '../lib/demo/data.ts';
import { projectBuildings, worldPlots, staffThemes } from '../lib/three-world/model.ts';
test('3D projection preserves asset IDs, plot IDs, stage and all five templates without mutating DEMO data', () => {
  const before = JSON.stringify(initialAssets), buildings = projectBuildings(initialAssets);
  assert.equal(buildings.length, 5); assert.equal(new Set(buildings.map(b => b.kind)).size, 5);
  for (const b of buildings) { assert.equal(b.assetId, b.asset.id); assert.equal(b.plotId, b.asset.plotId); assert.equal(b.stage, b.asset.stage); assert.equal(b.interior, b.kind); }
  assert.equal(JSON.stringify(initialAssets), before); assert.equal(worldPlots.length, 12); assert.equal(new Set(worldPlots.map(p => p.id)).size, 12);
  assert.equal(Object.keys(staffThemes).length, 8);
});
import { officeConfig, officeStaff, officeRoute, walkableTile, tileWorld, advance3D } from '../lib/three-world/office.ts';
test('all five office templates have navigable seats, corridors and explicit stairs between HQ floors', () => {
  for (const kind of ['hq','revenue','development','marketing','operations'] as const) {
    const config=officeConfig(kind);
    for (const employee of officeStaff(config)) for (const goal of [employee.desk,employee.meeting,employee.rest]) {
      const route=officeRoute(employee.start,goal,config); assert.ok(route,`${kind} ${employee.id}`);
      assert.deepEqual(advance3D(tileWorld(employee.start),route,1000).position,tileWorld(goal));
      for (const p of route) { if(p.stair) continue; assert.ok(walkableTile({x:Math.round((p.position[0]+6)*2),y:Math.round((p.position[2]+3.5)*2),floor:p.floor},config)); }
    }
    if(kind==='hq') { const route=officeRoute({x:6,y:8,floor:1},{x:12,y:8,floor:0},config)!; assert.ok(route.filter(p=>p.stair).length>=12); const result=advance3D(tileWorld({x:6,y:8,floor:1}),route,1000); assert.deepEqual(result.position,tileWorld({x:12,y:8,floor:0})); assert.equal(result.remaining.length,0); }
    assert.equal(officeRoute({x:4,y:4,floor:0},{x:4,y:8,floor:0},config),null);
  }
});
import { createSession, indoorRuntime, orderIndoor, stepIndoor, outdoorRuntime } from '../lib/three-world/simulation.ts';
test('DEMO simulation queues orders during movement, traverses stairs, and preserves work state in one session',()=>{
  const session=createSession(), config=officeConfig('hq'), actor=indoorRuntime('leo','studio-hq',config,session);
  const original=[...actor.position];stepIndoor(actor,.1,true);assert.deepEqual(actor.position,original);assert.equal(actor.workState,'NONE');
  orderIndoor(actor,{seq:1,action:'MEETING'},'leo',config); assert.equal(actor.lastOrder,0);
  let sawStairs=false;
  for(let i=0;i<2400;i++) {if(actor.queued)orderIndoor(actor,actor.queued,'leo',config);stepIndoor(actor,1/60);if(actor.position[0]<-6.1)sawStairs=true;if(actor.position[0]>=-6)assert.ok(walkableTile({x:Math.round((actor.position[0]+6)*2),y:Math.round((actor.position[2]+3.5)*2),floor:actor.floor},config));}
  assert.equal(sawStairs,true);assert.equal(actor.workState,'MEETING');assert.equal(actor.floor,0);assert.equal(actor.activity,'MEETING');assert.equal(indoorRuntime('leo','studio-hq',config,session),actor);
  orderIndoor(actor,{seq:2,action:'REST'},'leo',config);for(let i=0;i<600;i++)stepIndoor(actor,1/60);assert.equal(actor.activity,'IDLE');assert.equal(actor.workState,'NONE');
});
test('outdoor HQ route terminates at the existing asset entrance with no artificial AI work',()=>{
  const session=createSession(),hq=projectBuildings(initialAssets)[0],actor=outdoorRuntime('aria',0,hq,session);
  const end=advance3D(actor.position,actor.route,1000);assert.deepEqual(end.position,hq.entrance);assert.equal(actor.workState,'NONE');
});
test('every indoor employee desk destination matches a rendered chair and workstation on that floor',()=>{
  for(const kind of ['hq','revenue','development','marketing','operations'] as const){
    const config=officeConfig(kind), chairs=config.rooms.filter(r=>r.purpose!=='meeting').flatMap(r=>(r.stationXs??[0]).map(x=>({x:r.x+x,floor:r.floor})));
    for(const p of officeStaff(config)){const world=tileWorld(p.desk);assert.ok(chairs.some(c=>Math.abs(c.x-world[0])<.001&&c.floor===p.desk.floor),`${kind} ${p.id} has a real seat`);}
    assert.equal(new Set(officeStaff(config).map(p=>JSON.stringify(p.desk))).size,officeStaff(config).length);
  }
});
