import {test,expect} from '@playwright/test';
test('public first-run guidance offers virtual experience only and API restrictions remain enforced',async({page,request})=>{
 await page.goto('/welcome');await expect(page.getByRole('button',{name:'내 회사 만들기',exact:true})).toBeDisabled();await expect(page.locator('main')).toContainText('공개 웹 체험은 가상 자료 전용');await page.getByRole('button',{name:'데모 회사 체험하기',exact:true}).click();await expect(page).toHaveURL(/\/city$/);await expect(page.locator('[data-kpi=periodSales]')).toContainText('₩15,457,000');expect((await request.get('/api/private/revenue')).status()).toBe(403);
});
