"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {useDataMode} from '../operations/data-mode-provider';
import {publicKeys} from '@/lib/public-demo/preset';
import {kpiDefaults,parsePreferences,type KpiPreferences} from '@/lib/public-demo/kpi-preferences';
export {kpiDefaults,type KpiPreferences} from '@/lib/public-demo/kpi-preferences';
type Context={enabled:boolean;mode:"demo"|"public-demo"|"local-template";days:7|30;setDays:(d:7|30)=>void;tick:number;revision:number;playing:boolean;toggle:()=>void;reset:()=>void;advance:()=>void;cards:KpiPreferences;setCards:(c:KpiPreferences)=>void;saveCards:()=>void;notice:string};
const Context=createContext<Context|null>(null);
export function PublicDemoProvider({enabled,mode="demo",children}:{enabled:boolean;mode?:"demo"|"public-demo"|"local-template";children:ReactNode}){
 const {personal}=useDataMode();
 const [days,setDays]=useState<7|30>(30),[tick,setTick]=useState(0),[revision,setRevision]=useState(0),[playing,setPlaying]=useState(false),[cards,setCards]=useState(kpiDefaults),[notice,setNotice]=useState('');
 useEffect(()=>{if(!enabled)return;try{const raw=localStorage.getItem((mode==='local-template'?'online-landlord-os:local-template:v1:dashboard':publicKeys.dashboard));if(raw)setCards(parsePreferences(raw));}catch{setNotice('KPI 설정을 읽지 못했습니다. 기존 저장값은 유지합니다.');}},[enabled,mode]);
 useEffect(()=>{if(!enabled||!playing||personal)return;const id=setInterval(()=>{if(!document.hidden)setTick(t=>t+1);},1000);return()=>clearInterval(id);},[enabled,playing,personal]);
 useEffect(()=>{if(personal)setPlaying(false);},[personal]);
 return <Context.Provider value={{enabled,mode,days,setDays,tick,revision,playing:playing&&!personal,toggle:()=>{if(!personal)setPlaying(v=>!v);},reset:()=>{setPlaying(false);setTick(0);setRevision(v=>v+1);},advance:()=>{if(!personal)setTick(t=>(Math.floor(t/12)+1)*12);},cards,setCards,saveCards:()=>{try{const raw=JSON.stringify({version:1,cards});parsePreferences(raw);localStorage.setItem((mode==='local-template'?'online-landlord-os:local-template:v1:dashboard':publicKeys.dashboard),raw);setNotice('KPI 설정을 저장했습니다.');}catch(e){setNotice(e instanceof Error?e.message:'KPI 설정을 저장하지 못했습니다.');}},notice}}>{children}</Context.Provider>;
}
export const usePublicDemo=()=>useContext(Context);
