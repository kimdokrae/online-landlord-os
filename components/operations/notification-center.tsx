"use client";
import Link from 'next/link';
import {useDataMode} from './data-mode-provider';
import {useState} from 'react';
import {usePresentation} from '../settings/settings-provider';
import {useOperations} from './operations-provider';
import styles from './operations.module.css';
export function NotificationCenter(){const {personal,sourceLabel}=useDataMode();const o=useOperations(),{assets}=usePresentation();const [building,setBuilding]=useState(''),[history,setHistory]=useState(false);if(!o)return null;
 const events=(history?o.events:o.unread).filter(e=>!building||e.assetId===building);
 return <section id='owner-inbox' className={styles.center} aria-label='대표 알림센터'><div className={styles.heading}><div><small>OWNER’S INBOX · {personal?sourceLabel:'DEMO / SIMULATION'}</small><h2>{o.state.preferences.notificationTitle} <span data-testid='unread-count'>{o.unread.length}</span></h2><p>미확인 주의 항목 <b data-testid='attention-count'>{o.attention.length}</b>건 · 읽음 표시는 업무 승인이 아닙니다.</p></div><Link href='/settings/data'>{o.state.preferences.dataMenuName} ↗</Link></div><div className={styles.toolbar}><label>알림 건물<select value={building} onChange={e=>setBuilding(e.target.value)}><option value=''>전체 건물</option>{assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label><button className='button secondary' aria-pressed={history} onClick={()=>setHistory(v=>!v)}>{history?'미확인 알림 보기':'알림 이력 보기'}</button></div>
 <div className={styles.eventList}>{events.length===0?<p>표시할 알림이 없습니다.</p>:events.map(e=><article key={e.id} data-event-id={e.id} data-priority={e.priority} data-read={o.state.read.includes(e.id)}><div><small>{e.priority==='high'?'주의':e.priority==='normal'?'확인':'안내'} · {personal?sourceLabel:e.source} · {e.at}</small><strong>{assets.find(a=>a.id===e.assetId)?.name??'재무 자료'} · {e.title}</strong><span>{e.attention?'확인 필요':'정보 알림'}</span></div><div>{!o.state.read.includes(e.id)&&<button className='button secondary' onClick={()=>o.read(e.id)}>읽음 처리</button>}<Link className='button secondary' href={e.href+(e.href.includes('?')&&assets.find(a=>a.id===e.assetId)?.employeeId?`&employee=${assets.find(a=>a.id===e.assetId)!.employeeId}`:'')}>관련 화면 ↗</Link></div></article>)}</div>{o.error&&<p role='alert'>{o.error}</p>}</section>;
}
