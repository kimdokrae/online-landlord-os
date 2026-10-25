import {test,expect} from '@playwright/test';
test('public server disallows personal mode even when browser source is changed, all operational APIs blocked',async({page,request})=>{
 await page.goto('/settings');await page.getByRole('tab',{name:'데이터 모드',exact:true}).click();await expect(page.getByRole('button',{name:'체험 모드 OFF · 내 데이터',exact:true})).toBeDisabled();await expect(page.getByTestId('data-mode')).toContainText('체험 모드 ON');
 await page.getByRole('button',{name:'체험 모드 ON',exact:true}).click();await page.evaluate(()=>{const k='online-landlord-os:public-demo:operations:v1',s=JSON.parse(localStorage.getItem(k)??'null');if(s){s.source='connected';localStorage.setItem(k,JSON.stringify(s));}});await page.reload();await page.getByRole('tab',{name:'데이터 모드',exact:true}).click();await expect(page.getByRole('button',{name:'체험 모드 OFF · 내 데이터',exact:true})).toBeDisabled();await page.goto('/finance');await expect(page.getByText('DEMO MODE',{exact:true})).toBeVisible();
 for(const path of ['/api/finance','/api/private/revenue','/hooks/report']){expect((await request.get(path)).status()).toBe(403);expect((await request.post(path,{data:{source:'connected'}})).status()).toBe(403);}
});

test('public CSV guide downloads the fictional ledger and never instructs personal data entry',async({page})=>{
 await page.goto('/settings/data');await page.getByRole('button',{name:'연결 안내·CSV 양식',exact:true}).click();const guide=page.getByRole('region',{name:'가상 자료 형식 안내'});await expect(guide).toContainText('실제 개인 정보와 매출은 입력하지 마세요');await expect(guide).not.toContainText('본인 자료로');await expect(guide).not.toContainText('체험 모드 OFF를 선택');const download=page.waitForEvent('download');await guide.getByRole('button',{name:'샘플 CSV 다운로드',exact:true}).click();const d=await download;expect(d.suggestedFilename()).toBe('skycity-sample-finance.csv');expect(await d.failure()).toBeNull();await expect(page.getByRole('button',{name:'체험 모드 OFF · 내 데이터',exact:true})).toBeDisabled();
});
