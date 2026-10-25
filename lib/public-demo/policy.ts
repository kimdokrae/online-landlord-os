/** Server callers must pass the trusted server mode, never a client preference. */
export function assertLiveIntegrationsAllowed(mode:string|undefined):void {
  if(mode!=='private')throw new Error('외부 운영 서비스 접근이 차단된 DEMO 모드입니다.');
}
