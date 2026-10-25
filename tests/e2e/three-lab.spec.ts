import { test, expect, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import type { LabTelemetry } from "../../components/city/three-lab/lab-types";
test.use({ launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });
test.describe.configure({ mode: "serial" });
test.setTimeout(120000);
const lab = (page: Page) => page.getByRole("region", { name: "3D 스카이시티 실험", exact: true });
async function stats(page: Page): Promise<LabTelemetry> { return JSON.parse((await lab(page).getAttribute("data-scene-stats"))!); }
async function openLab(page: Page, query = "") {
  await page.goto(`/city/3d-lab${query}`); await expect(lab(page)).toHaveAttribute("data-ready", "true", { timeout: 60000 }); await expect.poll(async () => (await stats(page)).calls).toBeGreaterThan(0); await lab(page).scrollIntoViewIfNeeded();
}
async function hit(page: Page, id: string) {
  const s = await stats(page); const canvas = (await lab(page).locator("canvas").boundingBox())!;
  expect(s.anchors[id], `anchor ${id}`).toBeTruthy();
  await page.mouse.click(canvas.x + s.anchors[id].x * canvas.width, canvas.y + s.anchors[id].y * canvas.height);
}
test("A: expanded real geometry city has five asset-linked building kinds and no image/model requests", async ({ page }, info) => {
  const errors: string[] = [], requests: string[] = []; page.on("pageerror", e => errors.push(e.message)); page.on("request", r => requests.push(r.url()));
  await page.setViewportSize({ width: 1440, height: 1100 }); await openLab(page);
  const s = await stats(page); expect(s.camera.kind).toBe("OrthographicCamera"); expect(s.renderer).toContain("WebGL 2"); expect(s.meshes).toBeGreaterThan(100); expect(s.shadows).toBe(true); expect(s.imageMaps).toBe(0);
  expect(s.buildings).toHaveLength(5); expect(new Set(s.buildings!.map(b => b.kind)).size).toBe(5); expect(s.buildings!.find(b => b.assetId === "studio-hq")?.plotId).toBe("hq-0");
  expect(requests.filter(url => /\.(png|jpe?g|webp|svg|glb|gltf|fbx|obj|hdr)(\?|$)/i.test(url))).toEqual([]); expect(requests.every(url => ["127.0.0.1", "localhost"].includes(new URL(url).hostname))).toBe(true);
  await expect(lab(page).locator("canvas")).toHaveCount(1); await expect(lab(page).locator("img, svg")).toHaveCount(0);
  await hit(page, "asset:studio-hq"); await expect(page.getByRole("complementary", { name: "3D 선택 정보" })).toContainText("스튜디오 본사"); expect(errors).toEqual([]);
  await writeFile(info.outputPath("step8-city-stats.json"), JSON.stringify(s, null, 2)); await lab(page).screenshot({ path: info.outputPath("step8-city.png") });
});
test("A: empty plot registration and construction share persisted DEMO state with existing pages", async ({ page }) => {
  await openLab(page); const modules=(await stats(page)).floorModules; await hit(page,"plot:build-1"); await page.getByLabel("건물 이름", { exact: true }).fill("테스트 연구동"); await page.getByRole("button", { name: "데모 건물 등록", exact: true }).click();
  await expect.poll(async () => (await stats(page)).buildings?.length).toBe(6);
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "3D 층 추가", exact: true }).click();
  await expect(page.getByLabel("3D 모듈 층수")).toHaveText("3"); await expect.poll(async()=>(await stats(page)).floorModules).toBe(modules+3);
  const b = (await stats(page)).buildings!.find(b => b.plotId === "build-1")!; await expect.poll(async () => (await stats(page)).buildings!.find(v => v.assetId === b.assetId)?.stage).toBe(3);
  await page.reload(); await expect(lab(page)).toHaveAttribute("data-ready", "true", { timeout: 60000 }); await page.getByRole("button", { name: "테스트 연구동 선택", exact: true }).click(); await expect(page.getByLabel("3D 모듈 층수")).toHaveText("3");
  await page.getByRole("link", { name: "운영 현황 보기", exact: false }).click(); await expect(page).toHaveURL(new RegExp(`/assets/${b.assetId}`)); await expect(page.getByRole("heading", { name: "테스트 연구동", exact: true })).toBeVisible();
});
test("B: HQ entry opens actual two-floor geometry, room focus, floor filter and browser return", async ({ page }, info) => {
  await page.setViewportSize({width:1440,height:1100}); await openLab(page); await page.getByRole('button',{name:'스튜디오 본사 선택',exact:true}).click();
  await page.getByRole('button',{name:'건물 내부 입장',exact:true}).click(); await expect(page).toHaveURL(/inside=studio-hq/); await expect.poll(async()=> (await stats(page)).mode).toBe('studio-hq');
  const s=await stats(page); expect(s.meshes).toBeGreaterThan(150); expect(s.imageMaps).toBe(0); expect(Object.keys(s.anchors).filter(k=>k.startsWith('room:'))).toHaveLength(5);
  await writeFile(info.outputPath('step8-office-stats.json'),JSON.stringify(s,null,2)); await lab(page).screenshot({path:info.outputPath('step8-hq.png')});
  await page.getByRole('button',{name:'개발팀 확대',exact:true}).click(); await expect.poll(async()=> (await stats(page)).camera.target[1]).toBeGreaterThan(3.5); await expect.poll(async()=>Object.keys((await stats(page)).anchors).filter(k=>k.startsWith('room:')).length).toBe(2);
  await page.getByRole('button',{name:'실내 전체 보기',exact:true}).click(); await expect.poll(async()=>Object.keys((await stats(page)).anchors).filter(k=>k.startsWith('room:')).length).toBe(5);
  await page.reload(); await expect(lab(page)).toHaveAttribute('data-ready','true',{timeout:60000}); await expect.poll(async()=> (await stats(page)).mode).toBe('studio-hq');
  await page.getByRole('link',{name:'3D 도시로 돌아가기',exact:false}).click(); await expect(page).toHaveURL('/city/3d-lab'); await expect.poll(async()=> (await stats(page)).mode).toBe('city');
  await page.goBack(); await expect.poll(async()=> (await stats(page)).mode).toBe('studio-hq');
});
test("B: all other asset kinds reuse real interior templates linked to their original IDs", async ({page},info)=>{
  for (const id of ['paper-garden','orbit-note','cloud-letter','tiny-tools']) {
    await openLab(page,`?inside=${id}`); const s=await stats(page); expect(s.mode).toBe(id); expect(Object.keys(s.anchors).filter(k=>k.startsWith('room:'))).toHaveLength(3); expect(s.imageMaps).toBe(0); await expect.poll(async()=> (await stats(page)).staff?.filter(s=>s.activity==='WORKING').length,{timeout:30000}).toBe(3); if(id==='tiny-tools') await lab(page).screenshot({path:info.outputPath('step8-operations-office.png')});
  }
});
test("C: four themed sprouts walk actual city paths, pause and retain semantic task state",async({page},info)=>{
  await page.setViewportSize({width:1440,height:1100}); await openLab(page); await expect.poll(async()=> (await stats(page)).staff?.length).toBe(4);
  const before=(await stats(page)).staff!; expect(new Set(before.map(s=>s.department)).size).toBe(4); expect(before.every(s=>s.workState==='NONE')).toBe(true);
  await expect.poll(async()=> (await stats(page)).staff![1].x).not.toBe(before[1].x);
  await page.getByRole('button',{name:'산책 일시정지',exact:true}).click(); await expect.poll(async()=> (await stats(page)).employee.walking).toBe(false);
  const stopped=(await stats(page)).staff!; await page.waitForTimeout(500); expect((await stats(page)).staff!.map(s=>[s.x,s.y,s.z])).toEqual(stopped.map(s=>[s.x,s.y,s.z]));
  await hit(page,'employee:leo'); await expect(page.getByRole('complementary',{name:'3D 선택 정보'})).toContainText('레오'); await expect(page.getByRole('complementary',{name:'3D 선택 정보'})).toContainText('실제 AI 실행 없음');
  await page.getByRole('button',{name:'3D 선택 닫기',exact:true}).click(); await lab(page).screenshot({path:info.outputPath('step8-city-staff.png')});
});
test("C: office employees reach desks, type, navigate stairs to meetings and rest, with info and return state",async({page},info)=>{
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message)); await page.setViewportSize({width:1440,height:1100}); await openLab(page,'?inside=studio-hq');
  await expect.poll(async()=> (await stats(page)).staff?.filter(s=>s.activity==='WORKING').length,{timeout:45000}).toBe(4);
  expect((await stats(page)).staff!.every(s=>s.walkable)).toBe(true);
  await page.getByRole('button',{name:'레오 직원 선택',exact:true}).click(); await page.getByRole('button',{name:'직원 가까이 보기',exact:true}).click(); await expect.poll(async()=>Math.abs((await stats(page)).camera.zoom-(await stats(page)).fit!*3.5)).toBeLessThan(.1);
  await page.getByRole('button',{name:'3D 선택 닫기',exact:true}).click();await hit(page,'employee:leo');await expect(page.getByRole('complementary',{name:'3D 선택 정보'})).toContainText('레오');
  await lab(page).screenshot({path:info.outputPath('step8-office-working.png')});
  await page.getByRole('button',{name:'회의 요청',exact:true}).click(); await expect.poll(async()=> (await stats(page)).staff!.find(s=>s.id==='leo')?.activity).toBe('WALKING');
  await page.getByRole('button',{name:'실내 전체 보기',exact:true}).click();
  await expect.poll(async()=> (await stats(page)).staff!.find(s=>s.id==='leo')?.activity,{timeout:60000}).toBe('MEETING');
  const meeting=(await stats(page)).staff!.find(s=>s.id==='leo')!; expect(meeting.floor).toBe(0); expect(meeting.walkable).toBe(true);
  await page.getByRole('button',{name:'휴식 요청',exact:true}).click(); await expect.poll(async()=> (await stats(page)).staff!.find(s=>s.id==='leo')?.activity,{timeout:30000}).toBe('IDLE');
  await expect(page.getByRole('complementary',{name:'3D 선택 정보'})).toContainText('실행 중인 업무 없음');
  await page.getByRole('button',{name:'책상에서 업무',exact:true}).click(); await expect.poll(async()=> (await stats(page)).staff!.find(s=>s.id==='leo')?.activity,{timeout:60000}).toBe('WORKING');
  await page.getByRole('link',{name:'3D 도시로 돌아가기',exact:false}).click(); await expect.poll(async()=> (await stats(page)).mode).toBe('city');
  await page.getByRole('button',{name:'레오 직원 선택',exact:true}).click(); await expect(page.getByRole('complementary',{name:'3D 선택 정보'})).toContainText('업무 시작 예시'); expect(errors).toEqual([]);
});
test("camera rotates real projection, zooms, pans, focuses and restores city pose after interior visit",async({page},info)=>{
  await page.setViewportSize({width:1440,height:1100});await openLab(page);await page.getByRole('button',{name:'산책 일시정지',exact:true}).click();
  const before=await stats(page);
  await page.getByRole('button',{name:'3D 왼쪽 회전',exact:true}).click();await expect.poll(async()=>Math.abs((await stats(page)).camera.position[0]-before.camera.position[0])).toBeGreaterThan(3);
  expect((await stats(page)).anchors['asset:studio-hq'].x).not.toBe(before.anchors['asset:studio-hq'].x);
  await lab(page).screenshot({path:info.outputPath('step8-city-rotated.png')});
  const canvas=(await lab(page).locator('canvas').boundingBox())!,x=canvas.x+canvas.width*.35,y=canvas.y+canvas.height*.6;
  const zoom=(await stats(page)).camera.zoom;await page.mouse.move(x,y);await page.mouse.wheel(0,-120);await expect.poll(async()=> (await stats(page)).camera.zoom).toBeGreaterThan(zoom);
  const target=(await stats(page)).camera.target;await page.keyboard.down('Shift');await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+50,y-20,{steps:8});await page.mouse.up();await page.keyboard.up('Shift');await expect.poll(async()=> (await stats(page)).camera.target).not.toEqual(target);
  await page.getByRole('button',{name:'3D 시점 초기화',exact:true}).click();await expect.poll(async()=> (await stats(page)).camera.zoom).toBeCloseTo(before.camera.zoom,0);
  await hit(page,'asset:studio-hq');await page.getByRole('button',{name:'건물 내부 입장',exact:true}).click();await expect.poll(async()=> (await stats(page)).mode).toBe('studio-hq');
  await page.getByRole('button',{name:'개발팀 확대',exact:true}).click();await expect.poll(async()=> (await stats(page)).camera.target[1]).toBeGreaterThan(3.5);
  await expect.poll(async()=>{const s=await stats(page);return Math.abs(s.camera.zoom-s.fit!*2.1*10/6.7);}).toBeLessThan(.1);
  const interior=(await stats(page)).camera.zoom;await page.getByRole('button',{name:'3D 축소',exact:true}).click();await expect.poll(async()=> (await stats(page)).camera.zoom).toBeLessThan(interior);
  await page.getByRole('link',{name:'3D 도시로 돌아가기',exact:false}).click();await expect.poll(async()=> (await stats(page)).mode).toBe('city');await expect(page.getByRole('complementary',{name:'3D 선택 정보'})).toContainText('스튜디오 본사');
  await expect.poll(async()=> (await stats(page)).camera.zoom).toBeCloseTo(before.camera.zoom,0);
  for(let i=0;i<3;i++)expect((await stats(page)).camera.target[i]).toBeCloseTo(before.camera.target[i],1);
});
test("mobile city and office controls fit, touch orbit works and existing worlds remain available",async({page},info)=>{
  await page.setViewportSize({width:320,height:844});await openLab(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for(const name of ['3D 왼쪽 회전','3D 오른쪽 회전','3D 확대','3D 축소','3D 시점 초기화']) {const box=(await page.getByRole('button',{name,exact:true}).boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(320);}
  await lab(page).screenshot({path:info.outputPath('step8-city-mobile.png')});
  await page.setViewportSize({width:390,height:844});await openLab(page,'?inside=studio-hq');await page.getByRole('button',{name:'개발팀 확대',exact:true}).click();await expect.poll(async()=> (await stats(page)).camera.target[1]).toBeGreaterThan(3.5);
  await page.getByRole('button',{name:'3D 선택 닫기',exact:true}).click();await lab(page).screenshot({path:info.outputPath('step8-office-mobile.png')});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const canvas=(await lab(page).locator('canvas').boundingBox())!,prior=(await stats(page)).camera.position;
  const cdp=await page.context().newCDPSession(page);const x=canvas.x+canvas.width*.4,y=Math.max(160,canvas.y+canvas.height*.4);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+40,y:y+15}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(async()=> (await stats(page)).camera.position).not.toEqual(prior);const priorZoom=(await stats(page)).camera.zoom;await page.getByRole('button',{name:'3D 축소',exact:true}).click();await page.getByRole('button',{name:'3D 축소',exact:true}).click();await expect.poll(async()=> (await stats(page)).camera.zoom).toBeLessThan(priorZoom*.8);
  const oldZoom=(await stats(page)).camera.zoom,box=(await lab(page).locator('canvas').boundingBox())!,cx=box.x+box.width*.5,cy=Math.min(780,Math.max(160,box.y+box.height*.5));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-25,y:cy},{x:cx+25,y:cy}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-55,y:cy},{x:cx+55,y:cy}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(async()=> (await stats(page)).camera.zoom).toBeGreaterThan(oldZoom);await cdp.detach();
  await page.getByRole('link',{name:'V2 도시로 돌아가기',exact:false}).click();await expect(page.locator('[data-world-version="world-v2"]')).toBeVisible();await page.goto('/city?view=legacy');await expect(page.locator('[data-world-version="stable"]')).toBeVisible();await expect(page.locator('canvas')).toHaveCount(0);
});
test("outdoor HQ employee reaches the asset entrance then enters without starting a real task",async({page})=>{
  await openLab(page);await expect.poll(async()=> (await stats(page)).staff?.find(s=>s.id==='aria')?.activity,{timeout:75000}).toBe('INSIDE');
  const a=(await stats(page)).staff!.find(s=>s.id==='aria')!;expect(a.assetId).toBe('studio-hq');expect(a.workState).toBe('NONE');expect(a.x).toBeCloseTo(0);expect(a.z).toBeCloseTo(-2.05);expect(a.source).toBe('demo');
});
