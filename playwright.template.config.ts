import {defineConfig,devices} from '@playwright/test';
const local=process.env.TEMPLATE_BASE_URL??'http://127.0.0.1:3003',external=!!process.env.TEMPLATE_BASE_URL;
export default defineConfig({testDir:'./tests/template-e2e',outputDir:'template-test-results',fullyParallel:false,reporter:'list',timeout:180000,
 use:{...devices['Desktop Chrome'],trace:'retain-on-failure',launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
 projects:[{name:'local',testMatch:/local.spec.ts/,use:{baseURL:local}},{name:'public',testMatch:/public.spec.ts/,use:{baseURL:'http://127.0.0.1:3001'}}],
 webServer:external?undefined:[{command:'npm run dev:local',url:local+'/city',reuseExistingServer:true},{command:'npm run dev:public',url:'http://127.0.0.1:3001/city',reuseExistingServer:true}],
});
