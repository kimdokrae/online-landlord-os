import { company, employees, initialAssets, islands, plots } from '../demo/data.ts';
import { staffThemes } from '../three-world/model.ts';
export const menuIds = ['city','hq','office','boardroom','tasks','reports','finance','archive','settings','automation-lab'] as const;
export const internalRoutes = [...menuIds.map(id=>`/${id}`),'/city/3d-lab'] as const;
export const icons = ['city','hq','office','boardroom','tasks','reports','finance','archive','settings','spark'] as const;
export const departmentIds = Object.keys(staffThemes) as (keyof typeof staffThemes)[];
export const employeeIds = employees.map(e=>e.id);
export type Menu = {id:string;route:string;name:string;description:string;icon:string;visible:boolean;order:number;custom:boolean};
export type PageCopy = {title:string;subtitle:string;description:string;empty:string;emptyDescription:string};
export type BuildingProfile={name:string;description:string;type:string;linkedAssetId:string|null};
export type DepartmentProfile={name:string;description:string;color:string;taskTypes:string[];order:number};
export type EmployeeProfile={name:string;role:string;departmentId:string;taskDescription:string;color:string|null;visible:boolean;active:boolean;cardDescription:string};
export type ExecutionPreference={authority:'metadata-only';provider:'none'|'n8n'|'codex'|'ai-api';assetIds:string[];taskTypes:string[];status:'idle'|'running'|'waiting'|'failed';permissions:('read'|'draft'|'execute'|'publish')[];approvalRequired:boolean;costLimit:number};
export type OfficeSettings={version:1;workspaceId:'demo-workspace';company:{name:string;logo:string;owner:string;description:string;slogan:string;cityName:string;themeColor:string;startRoute:string};menus:Menu[];pages:Record<string,PageCopy>;districts:Record<string,{name:string;description:string}>;buildings:Record<string,BuildingProfile>;plots:Record<string,{name:string;visible:boolean}>;departments:Record<string,DepartmentProfile>;employees:Record<string,EmployeeProfile>;execution:Record<string,ExecutionPreference>};
const names=['스카이시티','중앙 본사','직원 오피스','전략회의실','업무센터','보고센터','금고','기록보관소','설정','자동화 발굴실'];
const page=(title:string,subtitle:string,description:string,empty='아직 표시할 내용이 없습니다',emptyDescription='설정과 DEMO 데이터를 확인해 주세요.'):PageCopy=>({title,subtitle,description,empty,emptyDescription});
export const pageDefaults:Record<string,PageCopy>={
 'automation-lab':page('자동화 발굴실','DISCOVER BETTER WAYS TO WORK','업무를 기록하고, 근거를 살펴 자동화 도입 계획을 준비하세요.','아직 등록한 업무가 없습니다','직접 업무를 등록하거나 선택적으로 DEMO 예제를 불러오세요.'),
 city:page('나의 스카이시티','YOUR BUSINESS, A LITTLE WORLD','아이디어를 심고, 자산을 쌓고. 당신의 사업이 자라는 풍경입니다.'),
 hq:page('중앙 본사','THE BIG PICTURE','도시의 오늘을 살피고, 다음 성장을 준비하는 대표의 공간입니다.'),
 office:page('직원 오피스','MEET YOUR LITTLE TEAM','혼자 꾸는 큰 꿈을, 함께 만들어갈 가상의 동료들을 만나보세요.'),
 boardroom:page('전략회의실','A ROOM FOR BIG IDEAS','차근차근 만들어가는 온라인 건물주 OS의 다음 공간입니다.','다음 전략을 위한 자리를 준비하고 있어요','다양한 관점의 자문과 의사결정 기록을 위한 공간입니다. 이번 단계에서는 회의나 모델을 실행하지 않습니다.'),
 tasks:page('업무센터','FROM IDEAS TO ACTION','차근차근 만들어가는 온라인 건물주 OS의 다음 공간입니다.','업무가 이어질 공간입니다','업무 생성·배정·실행·검수 흐름은 다음 단계에서 연결됩니다. 본사에서 샘플 업무 현황을 확인할 수 있습니다.'),
 reports:page('보고센터','STORIES OF PROGRESS','차근차근 만들어가는 온라인 건물주 OS의 다음 공간입니다.','도시의 변화가 보고서가 되는 곳','실행 근거와 성과를 모으는 보고서 기능은 아직 준비 중입니다.'),
 finance:page('금고','A CLEAR VIEW OF VALUE','차근차근 만들어가는 온라인 건물주 OS의 다음 공간입니다.','사업의 가치를 차곡차곡 기록할 곳','수익 원천 연결과 자산별 귀속은 다음 단계입니다. 현재 도시와 본사의 금액은 모두 가상 샘플입니다.'),
 archive:page('기록보관소','EVERY STEP LEAVES A TRACE','차근차근 만들어가는 온라인 건물주 OS의 다음 공간입니다.','도시가 쌓아갈 기록을 기다립니다','업무 실행·승인·변경 이력의 감사 기록은 아직 제공되지 않습니다.'),
 settings:page('설정','MAKE THIS WORLD YOURS','회사와 도시, 동료들의 이름을 바꾸고 나만의 오피스를 구성하세요.'),
 city3d:page('작은 세계, 진짜 공간','SKY CITY · A LITTLE SPATIAL EXPERIMENT','함께 자라는 건물과 새싹 직원, 구름 위의 작은 회사.'),
 asset:page('{name}','ASSET OVERVIEW · DEMO','{description}'),employee:page('{name}','DEMO TEAM MEMBER','{description}'),
 interior:page('중앙 본사 오피스','INSIDE YOUR LITTLE COMPANY · DEMO','작은 복도를 따라, 오늘의 아이디어가 자라는 자리로.'),
 register:page('새로운 건물 심기','A NEW POSSIBILITY · DEMO','아직 작은 아이디어라도 좋아요. 당신의 도시에 첫 부지를 마련하세요.'),
};
export const pageIds=Object.keys(pageDefaults);
export const defaultDepartments={...Object.fromEntries(departmentIds.map((id,order)=>[id,{name:staffThemes[id].label,description:'가상의 부서입니다.',color:staffThemes[id].color,taskTypes:[],order}]))} as Record<string,DepartmentProfile>;
defaultDepartments.executive.name='대표실';defaultDepartments.development.name='개발팀';defaultDepartments.marketing.name='마케팅·콘텐츠팀';defaultDepartments.finance.name='재무·운영팀';
export function defaultSettings():OfficeSettings {
 return {version:1,workspaceId:'demo-workspace',company:{name:company.name,logo:'',owner:'데모 대표',description:'나만의 작은 사업 도시',slogan:'작게 시작해서, 한 층씩 성장하세요.',cityName:'구름 위의 작은 마을',themeColor:'#34634e',startRoute:'/city'},menus:menuIds.map((id,order)=>({id,route:`/${id}`,name:names[order],description:pageDefaults[id].description,icon:id==='automation-lab'?'spark':id,visible:true,order,custom:false})),pages:structuredClone(pageDefaults),districts:Object.fromEntries(islands.map(i=>[i.id,{name:i.name,description:i.caption}])),buildings:Object.fromEntries(initialAssets.map(a=>[a.id,{name:a.name,description:a.description,type:a.type,linkedAssetId:a.id}])),plots:Object.fromEntries(plots.map(p=>[p.id,{name:`부지 ${p.id}`,visible:true}])),departments:structuredClone(defaultDepartments),employees:Object.fromEntries(employees.map((e,i)=>[e.id,{name:e.name,role:e.role,departmentId:['executive','development','content','marketing'][i],taskDescription:e.description,color:null,visible:true,active:true,cardDescription:e.description}])),execution:Object.fromEntries(employees.map(e=>[e.id,{authority:'metadata-only',provider:'none',assetIds:initialAssets.filter(a=>a.employeeId===e.id).map(a=>a.id),taskTypes:[],status:'idle',permissions:[],approvalRequired:true,costLimit:0}]))};
}
export function pageForPath(path:string):string {
 if(path==='/city/3d-lab')return 'city3d';if(/^\/assets\/[^/]+\/office$/.test(path))return 'interior';if(path.startsWith('/assets/'))return 'asset';if(path.startsWith('/agents/'))return 'employee';if(path==='/plots/new')return 'register';return path.split('/')[1]||'city';
}
export const renderCopy=(value:string,entity?:{name?:string;description?:string})=>value.replace(/\{(name|description)\}/g,(_,key:'name'|'description')=>entity?.[key]??'');
