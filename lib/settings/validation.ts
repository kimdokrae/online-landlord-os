import {defaultSettings,menuIds,pageIds,icons,departmentIds,employeeIds,internalRoutes,type OfficeSettings} from './defaults.ts';
import { plots,islands } from '../demo/data.ts';
type Obj=Record<string,unknown>;
const fail=(message:string):never=>{throw new Error(message);};
function object(v:unknown,keys:readonly string[],label:string):Obj {if(!v||typeof v!=='object'||Array.isArray(v))return fail(`${label}: 객체가 필요합니다.`);const obj=v as Obj;if(Object.keys(obj).length!==keys.length||keys.some(k=>!Object.hasOwn(obj,k))||Object.keys(obj).some(k=>!keys.includes(k)))return fail(`${label}: 허용되지 않거나 누락된 항목이 있습니다.`);return obj;}
function record(v:unknown,label:string,max=100):Obj {if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length>max)return fail(`${label}: 항목 형식을 확인해 주세요.`);for(const k of Object.keys(v))id(k);return v as Obj;}
function exactRecord(v:unknown,keys:string[],label:string):Obj {return object(v,keys,label);}
function str(v:unknown,label:string,max=300,empty=true):string {if(typeof v!=='string'||v.length>max||(!empty&&!v.trim())||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))return fail(`${label}: ${empty?'0':'1'}~${max}자의 텍스트가 필요합니다.`);return v;}
function bool(v:unknown):boolean {if(typeof v!=='boolean')return fail('표시·활성 값은 true 또는 false여야 합니다.');return v;}
function num(v:unknown,max=10000):number {if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)return fail('숫자 범위를 확인해 주세요.');return v;}
function order(v:unknown):number {const n=num(v,1000);if(!Number.isInteger(n))return fail('순서는 정수여야 합니다.');return n;}
function one<T extends string>(v:unknown,values:readonly T[],label:string):T {if(typeof v!=='string'||!values.includes(v as T))return fail(`${label}: 허용되지 않는 값입니다.`);return v as T;}
const id=(v:unknown)=>{const s=str(v,'고유 ID',100,false);if(!/^[a-zA-Z0-9][a-zA-Z0-9:_-]*$/.test(s)||['constructor','prototype','__proto__'].includes(s))return fail('고유 ID 형식이 올바르지 않습니다.');return s;};
export function color(v:unknown):string {if(typeof v!=='string'||!/^#[\da-f]{6}$/i.test(v))return fail('색상은 #RRGGBB 형식이어야 합니다.');return v;}
function strings(v:unknown,label:string):string[] {if(!Array.isArray(v)||v.length>24)return fail(`${label}: 최대 24개까지 입력할 수 있습니다.`);return [...new Set(v.map(x=>str(x,label,100).trim()).filter(Boolean))];}
export function safeMenuRoute(v:unknown):string {
 const s=str(v,'메뉴 주소',500,false);if(internalRoutes.includes(s as typeof internalRoutes[number]))return s;
 if(/[\s\\\u0000-\u001f]/.test(s))return fail('메뉴 주소에 공백이나 제어 문자를 사용할 수 없습니다.');
 let u:URL;try{u=new URL(s);}catch{return fail('존재하는 내부 경로나 https 외부 주소를 입력해 주세요.');}
 const host=u.hostname.toLowerCase();if(u.protocol!=='https:'||u.username||u.password||u.port||!host.includes('.')||host.includes(':')||/^\d+(\.\d+){3}$/.test(host)||/(^|\.)(localhost|local|internal|test|invalid)$/.test(host)||!/^([a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,63}$/.test(host))return fail('외부 메뉴는 인증정보·IP·로컬 주소가 없는 https 도메인만 허용합니다.');
 return u.href;
}
/** Additive STEP 9 compatibility: only the complete pre-discovery menu/page pair is extended. */
function upgradeDiscovery(value:unknown):unknown {
 if(!value||typeof value!=='object'||Array.isArray(value))return value;
 const v=value as Record<string,unknown>;
 if(v.version!==1||!Array.isArray(v.menus)||!v.pages||typeof v.pages!=='object'||Array.isArray(v.pages))return value;
 const pages=v.pages as Record<string,unknown>;
 if(v.menus.some(m=>m&&typeof m==='object'&&(m as Record<string,unknown>).id==='automation-lab')||Object.hasOwn(pages,'automation-lab'))return value;
 // Require the exact old built-in set, not a deleted field in a newer config.
 if(!menuIds.filter(id=>id!=='automation-lab').every(id=>(v.menus as Record<string,unknown>[]).some(m=>m?.id===id&&!m.custom)))return value;
 const defaults=defaultSettings();
 const maxOrder=Math.max(0,...v.menus.map(m=>typeof m?.order==='number'&&Number.isFinite(m.order)?m.order:0));
 return {...v,menus:[...v.menus,{...defaults.menus.find(m=>m.id==='automation-lab')!,order:Math.min(1000,maxOrder+1)}],pages:{...pages,'automation-lab':defaults.pages['automation-lab']}};
}
export function validateSettings(value:unknown):OfficeSettings {
 value=upgradeDiscovery(value);
 const root=object(value,Object.keys(defaultSettings()),'설정');if(root.version!==1)return fail('지원하지 않는 설정 버전입니다. 기존 설정은 유지됩니다.');if(root.workspaceId!=='demo-workspace')return fail('현재 버전은 DEMO Workspace 설정만 지원합니다.');
 const c=object(root.company,['name','logo','owner','description','slogan','cityName','themeColor','startRoute'],'회사');const logo=str(c.logo,'로고',200000);if(logo&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(logo))return fail('로고는 PNG/JPEG/WebP 데이터만 허용합니다.');
 if(logo&&!(/^data:image\/png;base64,iVBORw0KGgo/.test(logo)||/^data:image\/jpeg;base64,\/9j\//.test(logo)||/^data:image\/webp;base64,UklGR/.test(logo)))return fail('로고 파일의 형식이 올바르지 않습니다.');
 if(!Array.isArray(root.menus)||root.menus.length<menuIds.length||root.menus.length>menuIds.length+20)return fail('메뉴 수가 올바르지 않습니다.');const seen=new Set<string>();
 const menus=root.menus.map(v=>{const m=object(v,['id','route','name','description','icon','visible','order','custom'],'메뉴'),key=id(m.id),custom=bool(m.custom);if(seen.has(key))return fail('중복 메뉴 ID입니다.');seen.add(key);if(custom?!/^custom-[a-zA-Z0-9-]+$/.test(key):!menuIds.includes(key as typeof menuIds[number]))return fail('기본 메뉴 ID는 변경할 수 없습니다.');const route=safeMenuRoute(m.route);if(!custom&&route!==`/${key}`)return fail('기본 메뉴 경로는 변경할 수 없습니다.');return{id:key,route,name:str(m.name,'메뉴 이름',40,false),description:str(m.description,'메뉴 설명'),icon:one(m.icon,icons,'아이콘'),visible:bool(m.visible),order:order(m.order),custom};});
 if(menuIds.some(key=>!menus.some(m=>m.id===key&&!m.custom)))return fail('기본 메뉴를 삭제할 수 없습니다.');
 const pages=Object.fromEntries(Object.entries(exactRecord(root.pages,pageIds,'페이지')).map(([k,v])=>{const p=object(v,['title','subtitle','description','empty','emptyDescription'],'페이지 문구');return[k,{title:str(p.title,'페이지 제목',100,false),subtitle:str(p.subtitle,'부제목',150),description:str(p.description,'페이지 설명',600),empty:str(p.empty,'빈 상태 문구',200),emptyDescription:str(p.emptyDescription,'빈 상태 설명',600)}];}));
 const districts=Object.fromEntries(Object.entries(exactRecord(root.districts,islands.map(i=>i.id),'지구')).map(([k,v])=>{const d=object(v,['name','description'],'지구');return[k,{name:str(d.name,'지구 이름',60,false),description:str(d.description,'지구 설명')}];}));
 const buildings=Object.fromEntries(Object.entries(record(root.buildings,'건물',100)).map(([k,v])=>{const b=object(v,['name','description','type','linkedAssetId'],'건물');return[k,{name:str(b.name,'건물 이름',60,false),description:str(b.description,'건물 설명',600),type:str(b.type,'건물 유형',60,false),linkedAssetId:b.linkedAssetId===null?null:id(b.linkedAssetId)}];}));
 const plotSettings=Object.fromEntries(Object.entries(exactRecord(root.plots,plots.map(p=>p.id),'부지')).map(([k,v])=>{const p=object(v,['name','visible'],'부지');return[k,{name:str(p.name,'부지 이름',60,false),visible:bool(p.visible)}];}));
 const departments=Object.fromEntries(Object.entries(exactRecord(root.departments,departmentIds,'부서')).map(([k,v])=>{const d=object(v,['name','description','color','taskTypes','order'],'부서');return[k,{name:str(d.name,'부서명',60,false),description:str(d.description,'부서 설명',600),color:color(d.color),taskTypes:strings(d.taskTypes,'업무 유형'),order:order(d.order)}];}));
 const employees=Object.fromEntries(Object.entries(exactRecord(root.employees,employeeIds,'직원')).map(([k,v])=>{const e=object(v,['name','role','departmentId','taskDescription','color','visible','active','cardDescription'],'직원');return[k,{name:str(e.name,'직원 이름',60,false),role:str(e.role,'직책',80,false),departmentId:one(e.departmentId,departmentIds,'소속 부서'),taskDescription:str(e.taskDescription,'담당 업무',600),color:e.color===null?null:color(e.color),visible:bool(e.visible),active:bool(e.active),cardDescription:str(e.cardDescription,'직원 설명',600)}];}));
 const execution=Object.fromEntries(Object.entries(exactRecord(root.execution,employeeIds,'연동 준비')).map(([k,v])=>{const e=object(v,['authority','provider','assetIds','taskTypes','status','permissions','approvalRequired','costLimit'],'연동 메타데이터');if(e.authority!=='metadata-only')return fail('클라이언트 설정으로 실제 실행 권한을 부여할 수 없습니다.');const permissions=strings(e.permissions,'희망 권한').map(x=>one(x,['read','draft','execute','publish'] as const,'권한 메타데이터'));return[k,{authority:'metadata-only' as const,provider:one(e.provider,['none','n8n','codex','ai-api'] as const,'제공자'),assetIds:strings(e.assetIds,'담당 자산').map(id),taskTypes:strings(e.taskTypes,'업무 유형'),status:one(e.status,['idle','running','waiting','failed'] as const,'업무 상태 메타데이터'),permissions,approvalRequired:bool(e.approvalRequired),costLimit:num(e.costLimit,100000)}];}));
 return {version:1,workspaceId:'demo-workspace',company:{name:str(c.name,'회사명',60,false),logo,owner:str(c.owner,'대표 이름',60,false),description:str(c.description,'회사 설명',600),slogan:str(c.slogan,'슬로건',200),cityName:str(c.cityName,'도시 이름',60,false),themeColor:color(c.themeColor),startRoute:one(c.startRoute,internalRoutes,'시작 화면')},menus,pages,districts,buildings,plots:plotSettings,departments,employees,execution};
}
export function parseSettingsJSON(raw:string):OfficeSettings {if(raw.length>700000)throw new Error('설정 파일이 너무 큽니다.');let value:unknown;try{value=JSON.parse(raw);}catch{throw new Error('올바른 JSON 파일이 아닙니다. 기존 설정은 유지됩니다.');}return validateSettings(value);}
export const exportSettingsJSON=(config:OfficeSettings)=>JSON.stringify(validateSettings(config),null,2);
