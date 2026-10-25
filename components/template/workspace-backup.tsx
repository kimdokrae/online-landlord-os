"use client";
import {useState,type ChangeEvent} from 'react';
import {useDataMode} from '../operations/data-mode-provider';
import {exportWorkspace,restoreWorkspace} from '@/lib/template/backup';
import styles from '../operations/operations.module.css';
export function WorkspaceBackup(){const {canUsePersonal}=useDataMode(),[error,setError]=useState('');
 function download(){try{const json=exportWorkspace(localStorage),url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='my-company.local-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setError('');}catch(e){setError(e instanceof Error?e.message:'백업 실패');}}
 async function upload(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];e.target.value='';if(!file)return;try{if(file.size>20000000)throw Error('20MB 이하 백업을 선택하세요.');if(!confirm('현재 로컬 회사의 설정·건물·재무·업무 자료를 백업 파일로 교체할까요? 먼저 현재 백업을 내려받으세요. 공개용 파일이 아닙니다.'))return;restoreWorkspace(await file.text(),localStorage);window.location.assign('/');}catch(e){setError(e instanceof Error?e.message:'복원 실패');}}
 return <section className={styles.card} aria-label='개인 자료 백업'><h2>개인 자료 백업·복원</h2><p>회사·메뉴·직원 설정, 건물·단계, 수동·CSV 재무, 발굴실 기록, KPI 표시와 시작 안내를 한 파일에 보관합니다. 이 파일에는 개인 자료가 포함됩니다. AI 채팅·GitHub·템플릿 ZIP에 공유하지 마세요.</p>{canUsePersonal?<><button className='button secondary' onClick={download}>개인 백업 다운로드</button><label>개인 백업 복원<input type='file' accept='.json,application/json' onChange={upload}/></label></>:<p>개인 백업은 로컬 템플릿에서만 사용합니다.</p>}<p>자동 백업은 없습니다. 복원은 형식 검증 후 수행하며 완료하면 새로고침합니다. 다른 탭은 먼저 닫아 주세요. 브라우저 저장이 완전히 막히면 원복도 실패할 수 있으므로 기존 백업을 별도로 보관하세요.</p>{error&&<p role='alert'>{error}</p>}</section>;
}
