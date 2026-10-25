import {newTask,type DiscoveryTask} from './model.ts';
/** Opt-in examples only. No invented execution records or results. */
export function demoTasks():DiscoveryTask[] {
  return ['경제뉴스 키워드 정리','WordPress 초안 작성','SNS 게시물 제작','AdSense 수익 보고','신규 앱 개발·테스트','블로그 발행 결과 확인','콘텐츠 성과 기록'].map((name,i)=>({...newTask(`demo-discovery-${i+1}`),source:'DEMO',name,description:'가상 업무 예제입니다. 실제 수행 기록이나 연결된 서비스가 아닙니다.',category:['뉴스','콘텐츠','SNS','보고','개발','운영','보고'][i],assetId:['paper-garden','paper-garden','cloud-letter','studio-hq','orbit-note','paper-garden','cloud-letter'][i],departmentId:i===4?'development':'content',employeeId:i===4?'leo':'milo',frequency:4,period:'MONTH',minutes:30,inputs:'가상의 샘플 자료',outputs:'검수용 초안',tools:'미연결 도구 예시',externalPublish:i===2,ratings:{regularity:3,structured:3,integration:2,error:1,impact:1,judgment:2,maintenance:1}}));
}
