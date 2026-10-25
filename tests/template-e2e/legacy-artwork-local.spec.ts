import {test,expect} from '@playwright/test';
import {existsSync} from 'node:fs';

test('unverified artwork stays usable in owner project but missing release artwork shows a 3D navigation notice',async({page})=>{
 const variants=[{url:'/city?view=legacy',files:['public/skycity/garden-terrain.webp']},{url:'/city?preview=world-v2',files:['public/skycity/world-v2/terrain.webp','public/skycity/world-v2/edge-mask.svg']},{url:'/assets/studio-hq/office?preview=world-v2',files:['public/skycity/world-v2/interior.webp']}];
 for(const variant of variants){await page.goto(variant.url);const notice=page.getByRole('region',{name:'레거시 에셋 제외 안내'});if(variant.files.every(f=>existsSync(f))){await expect(notice).toHaveCount(0);await expect(page.locator('img[src^="/skycity/"]').first()).toBeVisible();}else{await expect(notice).toBeVisible();await expect(page.locator('img[src^="/skycity/"]')).toHaveCount(0);await notice.getByRole('link').click();await expect(page.locator('[data-world-version="3d"]')).toHaveAttribute('data-ready','true',{timeout:60000});if(variant.url.includes('/office'))await expect(page).toHaveURL(/inside=studio-hq/);}}
});
