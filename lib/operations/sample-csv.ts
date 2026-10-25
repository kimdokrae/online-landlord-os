import {ledger} from '../public-demo/finance.ts';
import {metrics,type Entry} from './model.ts';
/** Same ledger as the original demo charts; missing cost stays missing, zero stays zero. */
export function sampleEntries():Omit<Entry,'id'>[]{return ledger.flatMap(row=>Object.keys(metrics).flatMap(key=>{
 const metric=key as keyof typeof metrics,value=row[metric];
 return value===null?[]:[{date:row.date,businessId:row.assetId,metric,minor:value,currency:row.currency}];
}));}
export const csvHeader='date,businessId,metric,amount,currency';
export function sampleCsv(){return '\uFEFF'+csvHeader+'\r\n'+sampleEntries().map(e=>[e.date,e.businessId,e.metric,e.minor,e.currency].join(',')).join('\r\n')+'\r\n';}
export const blankCsv=()=> '\uFEFF'+csvHeader+'\r\n';
