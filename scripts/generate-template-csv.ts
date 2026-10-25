import {writeFileSync} from 'node:fs';
import {sampleCsv,blankCsv} from '../lib/operations/sample-csv.ts';
const check=process.argv.includes('--check');
const {readFileSync}=await import('node:fs');
for(const [file,body] of [['skycity-sample-finance.csv',sampleCsv()],['my-finance-template.csv',blankCsv()]]){
 const path=new URL(`../public/templates/${file}`,import.meta.url);
 if(check){if(readFileSync(path,'utf8')!==body)throw Error(`${file}: 원장과 일치하지 않습니다.`);}else writeFileSync(path,body);
}
console.log(check?'CSV 원장 동일성 확인 완료':'체험 원장 CSV와 빈 양식 생성 완료');
