import {currencies,metrics,parseAmount,rowKey,validDate,type Currency,type Entry,type Metric} from './model.ts';
export type Mapping = Record<'date'|'businessId'|'metric'|'amount'|'currency',string>;
export const defaultMapping:Mapping={date:'date',businessId:'businessId',metric:'metric',amount:'amount',currency:'currency'};
/** RFC4180-style quoted cells, BOM, CRLF and escaped quotes; bounded before parsing. No eval/formula execution. */
export function parseCsv(text:string):string[][]{
 if(text.length>1000000||text.includes('\0'))throw Error('CSV는 1MB 이하의 텍스트 파일이어야 합니다.');
 text=text.replace(/^\uFEFF/,'');const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}
 else if(c==='"'){if(cell||closed)throw Error('CSV 따옴표 형식이 잘못되었습니다.');quoted=true;}
 else if(c===','||c==='\n'||c==='\r'){row.push(cell.trim());cell='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(Boolean))rows.push(row);row=[];}}
 else{if(closed)throw Error('닫는 따옴표 뒤에 구분자가 필요합니다.');cell+=c;}
 if(rows.length>5001||cell.length>1000||row.length>50)throw Error('CSV는 5,000행·50열·셀 1,000자 이하로 제한됩니다.');}
 if(quoted)throw Error('닫히지 않은 CSV 따옴표가 있습니다.');row.push(cell.trim());if(row.some(Boolean))rows.push(row);
 if(rows.length<2||rows.length>5001||rows[0].length>50||rows[0].some(h=>!h)||new Set(rows[0]).size!==rows[0].length||rows.some(r=>r.length!==rows[0].length||r.some(c=>c.length>1000)))throw Error('CSV 헤더·열 수·데이터 행을 확인해 주세요.');return rows;
}
export function mapCsv(rows:string[][],mapping:Mapping,businessIds:string[]):Omit<Entry,'id'>[]{
 const indices=Object.values(mapping).map(h=>rows[0].indexOf(h));if(indices.some(i=>i<0)||new Set(indices).size!==5)throw Error('날짜·사업 ID·지표·금액·통화에 서로 다른 열을 연결해 주세요.');
 const seen=new Set<string>();return rows.slice(1).map((cells,i)=>{const get=(key:keyof Mapping)=>cells[rows[0].indexOf(mapping[key])];const date=get('date'),businessId=get('businessId'),metric=get('metric') as Metric,currency=get('currency') as Currency;
  if(!validDate(date))throw Error(`${i+2}행: 날짜 형식 또는 실제 일자가 잘못되었습니다.`);if(!businessIds.includes(businessId))throw Error(`${i+2}행: 등록되지 않은 사업 ID입니다.`);if(!Object.hasOwn(metrics,metric)||!currencies.includes(currency))throw Error(`${i+2}행: 지표 또는 통화를 확인해 주세요.`);
  const entry={date,businessId,metric,currency,minor:parseAmount(get('amount'),currency)},key=rowKey(entry);if(seen.has(key))throw Error(`${i+2}행: 동일 일자·사업·지표·통화 중복입니다.`);seen.add(key);return entry;});
}
