import {defineConfig,devices} from '@playwright/test';
const local=process.env.FINAL_LOCAL_URL??'http://127.0.0.1:3003';
const publicUrl=process.env.FINAL_PUBLIC_URL??'http://127.0.0.1:3001';
process.env.PUBLIC_DEMO_BASE_URL=publicUrl;
const external=!!process.env.FINAL_LOCAL_URL&&!!process.env.FINAL_PUBLIC_URL;
export default defineConfig({
 testDir:'./tests',outputDir:'final-audit-test-results',fullyParallel:false,workers:1,reporter:'list',timeout:180000,
 use:{...devices['Desktop Chrome'],trace:'retain-on-failure',launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
 projects:[
  {name:'template-local',testMatch:'**/template-e2e/*local.spec.ts',use:{baseURL:local}},
  {name:'template-public',testMatch:'**/template-e2e/*public.spec.ts',use:{baseURL:publicUrl}},
  {name:'operations-local',testMatch:['**/operations-e2e/local.spec.ts','**/operations-e2e/data-mode-local.spec.ts'],use:{baseURL:local}},
  {name:'operations-public',testMatch:['**/operations-e2e/public.spec.ts','**/operations-e2e/data-mode-public.spec.ts'],use:{baseURL:publicUrl}},
  {name:'public-demo',testMatch:'**/public-e2e/*.spec.ts',use:{baseURL:publicUrl}},
 ],
 webServer:external?undefined:[
  {command:'npm run dev:local',url:local+'/city',reuseExistingServer:true},
  {command:'npm run dev:public',url:publicUrl+'/city',reuseExistingServer:true},
 ],
});
