import {defineConfig,devices} from '@playwright/test';
const baseURL=process.env.PUBLIC_DEMO_BASE_URL??'http://127.0.0.1:3001';
export default defineConfig({testDir:'./tests/public-e2e',outputDir:'./public-test-results',fullyParallel:false,reporter:'list',timeout:120000,
 use:{baseURL,...devices['Desktop Chrome'],trace:'retain-on-failure',launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
 webServer:{command:'APP_MODE=public-demo npm run dev -- --port 3001',url:`${baseURL}/city`,reuseExistingServer:true,timeout:120000},
});
