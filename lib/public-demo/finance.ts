/** Fixed fictional KRW ledger. No provider, secrets, clock, random values or I/O. */
export const demoAsOf = '2026-10-20';
export const businessIds = ['studio-hq','cloud-letter','paper-garden','tiny-tools','orbit-note'] as const;
export type BusinessId = typeof businessIds[number];
export type DailyBusiness = {
  date:string; assetId:BusinessId; source:'DEMO'; currency:'KRW';
  grossSales:number; refunds:number; adEstimate:number; cost:number|null; paidOut:number;
  visits:number; orders:number; paidOrders:number; shipped:number; pendingPayments:number;
  pendingShipping:number; inquiries:number; contentMade:number; published:number; impressions:number;
  plans:number; developing:number; tested:number; updates:number; fixesRequired:number;
};
export const ledger:DailyBusiness[] = Array.from({length:30},(_,i)=>{
  const date=new Date(Date.UTC(2026,8,21+i)).toISOString().slice(0,10);
  return businessIds.map((assetId,b)=>{
    const web=b===2,shop=b===3,dev=b===4,marketing=b===1;
    const orders=shop?9+i%7:dev?2+i%4:web?1+i%3:0;
    return {date,assetId,source:'DEMO' as const,currency:'KRW' as const,
      grossSales:orders*(shop?36000:dev?19000:12000),refunds:shop&&i%6===0?36000:0,
      adEstimate:web?7000+i*270+(i%4)*900:0,
      cost:marketing?null:shop?orders*16000:dev?12000:web?2500:4000,
      paidOut:i===24?(web?180000:shop?310000:dev?90000:0):0,
      visits:web?1250+i*48:shop?260+i*9:dev?140+i*6:0,orders,
      paidOrders:Math.max(0,orders-(i%3===0?1:0)),shipped:shop?Math.max(0,orders-2):0,
      pendingPayments:orders?i%3:0,pendingShipping:shop?2+i%2:0,inquiries:shop?1+i%4:0,
      contentMade:marketing?2+i%3:0,published:marketing?1+i%3:0,impressions:marketing?3800+i*210:0,
      plans:dev?2:0,developing:dev?2+i%2:0,tested:dev?3+i%4:0,updates:dev?1+i%2:0,fixesRequired:dev?i%3:0};
  });
}).flat();
export function summarizeFinance(rows:readonly DailyBusiness[]) {
  const sum=(key:'grossSales'|'refunds'|'adEstimate'|'paidOut')=>rows.reduce((n,r)=>n+r[key],0);
  const grossSales=sum('grossSales'),refunds=sum('refunds'),netSales=grossSales-refunds;
  const adEstimate=sum('adEstimate'),knownCosts=rows.reduce((n,r)=>n+(r.cost??0),0);
  const costsComplete=rows.length>0&&rows.every(r=>r.cost!==null);
  return {grossSales,refunds,netSales,adEstimate,knownCosts,paidOut:sum('paidOut'),costsComplete,
    // Payments settle receivables. They are NEVER added to revenue/profit.
    netProfit:costsComplete?netSales+adEstimate-knownCosts:null};
}
export function periodRows(days:7|30,assetId?:string) {
  const start=new Date(Date.UTC(2026,9,20-(days-1))).toISOString().slice(0,10);
  return ledger.filter(r=>r.date>=start&&(!assetId||r.assetId===assetId));
}
export function monthlyRows(assetId?:string){return ledger.filter(r=>r.date.startsWith('2026-10-')&&(!assetId||r.assetId===assetId));}
export function seriesFor(days:7|30){const rows=periodRows(days);return [...new Set(rows.map(r=>r.date))].map(date=>({date,...summarizeFinance(rows.filter(r=>r.date===date))}));}
export function latestOperations(assetId?:string){return ledger.filter(r=>r.date===demoAsOf&&(!assetId||r.assetId===assetId));}
