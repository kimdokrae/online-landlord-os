import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests/operations-e2e',outputDir:'./operations-test-results',fullyParallel:false,reporter:'list',timeout:120000,
 use:{...devices['Desktop Chrome'],trace:'retain-on-failure',launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
 projects:[{name:'public',testMatch:/public\.spec\.ts/,use:{baseURL:'http://127.0.0.1:3001'}},{name:'local',testMatch:/local\.spec\.ts/,use:{baseURL:'http://127.0.0.1:3003'}}],
 webServer:[{command:'npm run dev:public',url:'http://127.0.0.1:3001/city',reuseExistingServer:true,timeout:120000},{command:'npm run dev:local',url:'http://127.0.0.1:3003/city',reuseExistingServer:true,timeout:120000}],
});
