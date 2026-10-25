import {parseSettingsJSON} from '../settings/validation.ts';
import {parseStoredAssets} from '../demo/state.ts';
import {parseDiscovery} from '../automation/validation.ts';
import {validateState} from '../operations/model.ts';
import {parsePreferences} from '../public-demo/kpi-preferences.ts';
import {localWorkspaceKeys,onboardingKey,validateWelcome} from './onboarding.ts';
const keys={...localWorkspaceKeys,welcome:onboardingKey};
type Slot=keyof typeof keys;
export type WorkspaceBackup={version:1;kind:'private-local-workspace';createdAt:string;slots:Record<Slot,string|null>};
function check(slot:Slot,raw:string|null){if(raw===null)return;if(typeof raw!=='string'||raw.length>10000000)throw Error('백업 자료 크기 또는 형식을 확인하세요.');
 switch(slot){case 'settings':parseSettingsJSON(raw);break;case 'assets':if(!parseStoredAssets(raw))throw Error('건물 자료가 손상되었습니다.');break;case 'discovery':parseDiscovery(raw);break;case 'dashboard':parsePreferences(raw);break;case 'operations':validateState(JSON.parse(raw),'local-template');break;case 'welcome':validateWelcome(JSON.parse(raw));}
}
export function validateBackup(input:unknown):WorkspaceBackup{const v=input as WorkspaceBackup;if(!v||Object.keys(v).sort().join()!==['version','kind','createdAt','slots'].sort().join()||v.version!==1||v.kind!=='private-local-workspace'||typeof v.createdAt!=='string'||!Number.isFinite(Date.parse(v.createdAt))||!v.slots||Object.keys(v.slots).sort().join()!==Object.keys(keys).sort().join())throw Error('지원하지 않는 백업입니다. 기존 자료는 유지합니다.');
 for(const slot of Object.keys(keys) as Slot[])check(slot,v.slots[slot]);return structuredClone(v);}
export function exportWorkspace(storage:Pick<Storage,'getItem'>){return JSON.stringify(validateBackup({version:1,kind:'private-local-workspace',createdAt:new Date().toISOString(),slots:Object.fromEntries(Object.entries(keys).map(([slot,key])=>[slot,storage.getItem(key)]))}),null,2);}
export function restoreWorkspace(raw:string,storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>){if(raw.length>20000000)throw Error('백업은 20MB 이하로 선택하세요.');const v=validateBackup(JSON.parse(raw)),old=Object.fromEntries(Object.values(keys).map(key=>[key,storage.getItem(key)])),changed:string[]=[];
 try{for(const [slot,key] of Object.entries(keys)){changed.push(key);const value=v.slots[slot as Slot];if(value===null)storage.removeItem(key);else storage.setItem(key,value);}}
 catch{let rollbackFailed=false;for(const key of changed.reverse())try{const value=old[key];if(value===null)storage.removeItem(key);else storage.setItem(key,value);}catch{rollbackFailed=true;}throw Error(rollbackFailed?'복원과 일부 원복이 실패했습니다. 브라우저를 닫지 말고 현재 백업을 별도 보관한 뒤 도움을 요청하세요.':'복원을 취소하고 기존 자료를 원복했습니다. 저장 용량을 확인하세요.');}
}
