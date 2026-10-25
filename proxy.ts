import {NextResponse} from 'next/server';
import {assertLiveIntegrationsAllowed} from './lib/public-demo/policy';
/** A fail-closed gate before all API/webhook routes, including future adapters. */
export function proxy(){
  try{assertLiveIntegrationsAllowed(process.env.APP_MODE);}catch{
    return NextResponse.json({error:'DEMO_EXTERNAL_ACCESS_DISABLED',message:'공개 체험은 가상 데이터만 사용합니다.'},{status:403,headers:{'Cache-Control':'no-store'}});
  }
  return NextResponse.next();
}
export const config={matcher:['/api/:path*','/hooks/:path*']};
