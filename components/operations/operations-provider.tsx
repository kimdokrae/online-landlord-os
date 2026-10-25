"use client";
import {createContext,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {usePublicDemo} from '../public-demo/public-provider';
import {usePresentation} from '../settings/settings-provider';
import {useConnectionStore,useDataMode} from './data-mode-provider';
import {activeEntries,type ConnectionState,type Entry,type Batch} from '@/lib/operations/model';
import {demoEvents,simulationEvent,financialChangeEvents,type OfficeEvent} from '@/lib/operations/events';
type Context={state:ConnectionState;ready:boolean;error:string;save:(next:ConnectionState)=>boolean;entries:Entry[];events:OfficeEvent[];unread:OfficeEvent[];attention:OfficeEvent[];read:(id:string)=>void;usingConnected:boolean;currency:string;setCurrency:(v:string)=>void;updatedAt:string|null;addBatch:(batch:Batch,replaceId?:string)=>boolean};
const Context=createContext<Context|null>(null);
export function OperationsProvider({mode,children}:{mode:ConnectionState['mode'];children:ReactNode}){
 const demo=usePublicDemo()!,{assets,config}=usePresentation();
 const {state,ready,error,save}=useConnectionStore(),{personal}=useDataMode();
 const [currency,setCurrency]=useState('KRW');
 const current=useRef(state),run=useRef(''),lastStep=useRef(-1);current.current=state;
 useEffect(()=>{run.current=crypto.randomUUID();lastStep.current=-1;},[demo.revision]);
 useEffect(()=>{if(!ready||!demo.enabled||personal)return;const step=Math.floor(demo.tick/12);if(step===lastStep.current)return;lastStep.current=step;if(step===0)return;
  const refs=assets.filter(a=>{return !a.employeeId||config.employees[a.employeeId]?.active;}).map(a=>({assetId:a.id,tick:step*12,run:run.current})).filter(e=>simulationEvent(e.assetId,e.tick,e.run));
  const old=current.current,known=new Set(old.events.map(e=>`${e.run}:${e.assetId}:${e.tick}`));const additions=refs.filter(e=>!known.has(`${e.run}:${e.assetId}:${e.tick}`));if(additions.length)save({...old,events:[...old.events,...additions].slice(-500)});
 },[demo.tick,demo.revision,demo.enabled,personal,ready,assets,config.employees,save]);
 const usingConnected=state.source==='connected',entries=useMemo(()=>activeEntries(state),[state.batches]);
 const events=useMemo(()=>{
  const imported:OfficeEvent[]=state.batches.filter(b=>b.connected).flatMap(b=>[...new Set(b.entries.map(e=>e.businessId))].map(businessId=>({id:`batch:${b.id}:${b.updatedAt}:${businessId}`,assetId:state.businesses.find(x=>x.id===businessId)?.buildingId??'',kind:'data',priority:'low',title:`${b.entries.filter(e=>e.businessId===businessId).length}개 재무 기록 갱신`,href:'/finance',source:mode==='public-demo'?'DEMO':'LOCAL',at:b.updatedAt,attention:false})));
  const simulations=(personal?[]:state.events).map(e=>simulationEvent(e.assetId,e.tick,e.run)).filter((e):e is OfficeEvent=>e!==null);
  // Retain history; only the current phase can require action. Completed/older phases are history.
  return [...(usingConnected?[...imported,...financialChangeEvents(entries,state.businesses,mode==='public-demo'?'DEMO':'LOCAL')]:demoEvents()),...simulations.map(e=>({...e,attention:e.attention&&e.id===simulationEvent(e.assetId,demo.tick,run.current)?.id}))].reverse();
 },[state.batches,state.businesses,state.events,entries,usingConnected,demo.tick,mode,personal]);
 const unread=events.filter(e=>!state.read.includes(e.id)),attention=unread.filter(e=>e.attention);
 const updatedAt=state.batches.filter(b=>b.connected).map(b=>b.updatedAt).sort().at(-1)??null;
 return <Context.Provider value={{state,ready,error,save,entries,events,unread,attention,usingConnected,currency,setCurrency,updatedAt,read:id=>{const s=current.current;if(!s.read.includes(id))save({...s,read:[...s.read,id].slice(-10000)});},addBatch:(batch,replaceId)=>{const s=current.current;return save({...s,source:s.source,batches:[...s.batches.filter(b=>b.id!==replaceId),batch]});}}}>{children}</Context.Provider>;
}
export const useOperations=()=>useContext(Context);
