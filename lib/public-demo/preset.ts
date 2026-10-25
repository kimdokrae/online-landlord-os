import { initialAssets } from '../demo/data.ts';
import { defaultSettings } from '../settings/defaults.ts';
export const publicKeys={assets:'online-landlord-os:public-demo:v1:assets',settings:'online-landlord-os:public-demo:v1:settings',discovery:'online-landlord-os:public-demo:v1:discovery',dashboard:'online-landlord-os:public-demo:v1:dashboard'};
export const businessProfiles:Record<string,{name:string;description:string;stage:number}>={
 'studio-hq':{name:'중앙본부',description:'매출과 보고를 살피고, 가상 승인과 전략회의를 진행하는 대표의 공간.',stage:5},
 'cloud-letter':{name:'마케팅 팀',description:'콘텐츠 기획부터 이미지·영상 제작, 검수와 성과 회고까지.',stage:5},
 'paper-garden':{name:'웹사이트 운영',description:'방문 흐름과 광고 추정수익, 결제 전환과 운영 점검을 살펴요.',stage:5},
 'tiny-tools':{name:'쇼핑몰 운영',description:'가상 주문·매출·배송·환불·고객 문의를 관리하는 작은 상점.',stage:3},
 'orbit-note':{name:'서비스 개발',description:'기획·개발·테스트·업데이트를 한 층씩 완성하는 제품 공방.',stage:3},
};
export const publicAssets=()=>initialAssets.map(a=>({...structuredClone(a),name:businessProfiles[a.id].name,description:businessProfiles[a.id].description,stage:businessProfiles[a.id].stage,revenue:0}));
export function publicSettings(){const c=defaultSettings();
 c.company={...c.company,name:'새싹 컴퍼니',cityName:'나의 첫 사업 도시',owner:'데모 대표',description:'다섯 개의 작은 사업, 하나의 도시',slogan:'내 사업이 자라는 작은 세계'};
 for(const [id,p] of Object.entries(businessProfiles))c.buildings[id]={...c.buildings[id],name:p.name,description:p.description,type:p.name};
 c.pages.city={...c.pages.city,title:'나의 사업 도시',subtitle:'BUILD YOUR OWN LITTLE EMPIRE',description:'작은 사업을 짓고, 동료와 키우고. 오늘은 어떤 가능성이 자랄까요?'};
 c.pages.hq={...c.pages.hq,title:'대표의 경영 노트',description:'다섯 사업의 흐름과 오늘 확인할 일을 한눈에 살펴보세요.'};
 c.pages.finance={...c.pages.finance,title:'우리 도시의 금고',description:'매출과 환불, 추정수익과 지급액을 구분하는 가상 경영 장부.'};
 c.pages.tasks={...c.pages.tasks,description:'새싹 직원의 가상 업무와 진행 상태를 확인하세요.'};
 c.pages.reports={...c.pages.reports,description:'같은 시뮬레이션에서 나온 업무 기록입니다. 실제 AI 실행은 없습니다.'};
 c.employees.leo.role='개발·운영 엔지니어';c.employees.leo.taskDescription='서비스 개발과 작은 상점의 운영을 돕는 가상 동료입니다.';
 c.employees.milo.role='웹사이트 운영 매니저';c.employees.milo.taskDescription='방문 흐름과 추정수익, 운영 점검을 살피는 가상 동료입니다.';
 c.employees.nova.role='마케팅 매니저';c.employees.nova.taskDescription='콘텐츠 기획과 제작, 검수와 회고를 맡는 가상 동료입니다.';
 return c;
}
