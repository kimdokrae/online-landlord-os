import type {EmployeeWorkSignal} from '../employees/status-adapter.ts';
/** Connection state is independent from tool recommendations and client preferences. */
export const connections = ['n8n','Neon','Codex','AI API','AdSense','WordPress','Slack'].map(provider=>({provider,status:'NOT_CONNECTED' as const}));
export interface IntegrationReport {provider:'n8n'|'neon'|'codex'|'adsense'|'wordpress'|'slack';externalId:string;taskId:string;receivedAt:string;summary:string}
/** Reserved for trusted server TaskRun events; discovery approvals never create one. */
export interface TaskRunEvent {runId:string;taskId:string;employeeId:string;signal:EmployeeWorkSignal;verifiedByServer:true}
