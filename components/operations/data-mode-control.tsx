"use client";
import Link from 'next/link';
import {useConnectionStore,useDataMode} from './data-mode-provider';
import styles from './operations.module.css';
export function DataModeControl({showError=true}:{showError?:boolean}){
 const {state,ready,error,save}=useConnectionStore(),{personal,canUsePersonal,sourceLabel}=useDataMode();
 return <section className={styles.card} aria-label='데이터 모드 관리'>
  <h2>데이터 모드</h2><p>현재 표시: <strong data-testid='data-mode'>{personal?sourceLabel:'체험 모드 ON · DEMO'}</strong></p>
  <div className={styles.toolbar}><button className='button secondary' disabled={!ready} aria-pressed={!personal} onClick={()=>save({...state,source:'demo'})}>체험 모드 ON</button>
  <button className='button' disabled={!ready||!canUsePersonal} aria-pressed={personal} onClick={()=>save({...state,source:'connected'})}>체험 모드 OFF · 내 데이터</button></div>
  <p>{canUsePersonal?'내 데이터 모드에서는 연결한 CSV·직접 입력만 조회합니다. 체험 자료와 합산하지 않으며 가상 직원 업무는 중지됩니다. 전환해도 회사 설정과 양쪽 자료는 보존합니다.':'공개 환경은 가상 자료 전용입니다. 개인 데이터 모드는 서버 실행 설정으로 제한됩니다. 개인정보를 입력하지 마세요.'}</p>
  <Link href='/settings/data'>자료 연결과 CSV 양식 보기 ↗</Link>{showError&&error&&<p role='alert'>{error}</p>}
 </section>;
}
