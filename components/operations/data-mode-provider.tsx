"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {BrowserOperationsRepository} from '@/lib/operations/repository';
import {emptyState,type ConnectionState} from '@/lib/operations/model';

type Store={state:ConnectionState;ready:boolean;error:string;save:(next:ConnectionState)=>boolean};
const StoreContext=createContext<Store|null>(null);
/** The deployment mode comes from RootLayout, never from browser settings. */
export function DataModeProvider({mode,children}:{mode:'demo'|'public-demo'|'local-template';children:ReactNode}){
 const repository=useMemo(()=>new BrowserOperationsRepository(mode==='local-template'?mode:'public-demo'),[mode]);
 const [state,setState]=useState(()=>emptyState(mode==='local-template'?mode:'public-demo')),[ready,setReady]=useState(false),[error,setError]=useState('');
 const writable=useRef(false);
 useEffect(()=>{try{const value=mode==='demo'?null:repository.load();if(value)setState(value);writable.current=mode!=='demo';}catch(e){setError(e instanceof Error?e.message:'저장 자료를 읽지 못했습니다. 원본을 보호합니다.');}setReady(true);},[mode,repository]);
 const save=useCallback((next:ConnectionState)=>{try{if(!writable.current)throw Error('저장 원본을 보호하고 있습니다. 읽기 실패를 해결한 뒤 다시 시도해 주세요.');const value=repository.save(next);setState(value);setError('');return true;}catch(e){setError(e instanceof Error?e.message:'저장 실패');return false;}},[repository]);
 const personal=mode==='local-template'&&state.source==='connected';
 return <StoreContext.Provider value={{state,ready,error,save}}><ModeContext.Provider value={{personal,ready,canUsePersonal:mode==='local-template',sourceLabel:personal?sourceLabel(state):'DEMO',copy:text=>personal?personalCopy(text):text}}>{mode==='local-template'&&!ready?<p role="status">저장된 데이터 모드를 불러오는 중…</p>:children}</ModeContext.Provider></StoreContext.Provider>;
}
const defaultMode={personal:false,ready:false,canUsePersonal:false,sourceLabel:'DEMO',copy:(text:string)=>text};
const ModeContext=createContext(defaultMode);
export const useDataMode=()=>useContext(ModeContext);
export function useConnectionStore(){const value=useContext(StoreContext);if(!value)throw Error('DataModeProvider가 필요합니다.');return value;}
function sourceLabel(s:ConnectionState){const kinds=new Set(s.batches.filter(b=>b.connected).map(b=>b.kind));return `내 데이터 · ${kinds.size===2?'CSV + 직접 입력':kinds.has('csv')?'CSV':kinds.has('manual')?'직접 입력':'데이터 미연결'}`;}
/** Display only: the original company settings and imported JSON are never rewritten. */
function personalCopy(text:string){return text
 .replace('같은 시뮬레이션에서 나온 업무 기록입니다. 실제 AI 실행은 없습니다.','내 자료의 갱신 기록입니다. 실제 업무 실행은 미연결입니다.')
 .replace('새싹 직원의 가상 업무와 진행 상태를 확인하세요.','직원 프로필을 확인하세요. 실제 업무는 미연결입니다.')
 .replace(/PUBLIC DEMO|DEMO MODE|DEMO|SIMULATION/gi,'')
 .replace(/시뮬레이션|가상 업무/g,'업무 미연결').replace(/데모 프로필/g,'직원 프로필').replace(/데모 대표/g,'대표').replace(/데모|가상/g,'').trim();}
