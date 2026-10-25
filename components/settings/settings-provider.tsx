"use client";
import {useDataMode} from '../operations/data-mode-provider';
import {usePublicDemo} from "../public-demo/public-provider";
import {workflowFrame,simulationLabels,employeeBusinesses} from "@/lib/public-demo/workflows";
import {createContext,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {defaultSettings,type OfficeSettings} from '@/lib/settings/defaults';
import {LocalSettingsRepository,type SettingsRepository} from '@/lib/settings/repository';
import {validateSettings,parseSettingsJSON,exportSettingsJSON} from '@/lib/settings/validation';
import {employees as originalEmployees} from '@/lib/demo/data';
import {useDemo} from '@/components/demo-provider';
type Context={config:OfficeSettings;ready:boolean;dirty:boolean;notice:string;error:string;update:(change:(current:OfficeSettings)=>OfficeSettings)=>void;save:()=>Promise<boolean>;importJSON:(raw:string)=>Promise<boolean>;restore:(menusOnly?:boolean)=>Promise<boolean>;exportJSON:()=>string};
const SettingsContext=createContext<Context|null>(null);
export function SettingsProvider({children,repository,initial,storageName}:{children:ReactNode;repository?:SettingsRepository;initial?:OfficeSettings;storageName?:string}){
 const defaults=()=>structuredClone(initial??defaultSettings());
 const [config,setConfig]=useState(defaults),[saved,setSaved]=useState(()=>JSON.stringify(defaults())),[ready,setReady]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState('');
 const repo=useRef<SettingsRepository|null>(repository??null),current=useRef(config);current.current=config;
 useEffect(()=>{let alive=true;try{repo.current??=new LocalSettingsRepository(window.localStorage,storageName);repo.current.load().then(value=>{if(!alive)return;if(value){current.current=value;setConfig(value);setSaved(JSON.stringify(value));}setReady(true);}).catch(e=>{if(alive){setError(`저장된 설정을 불러오지 못했습니다. 원본은 유지합니다. ${e instanceof Error?e.message:''}`);setReady(true);}});}catch{setReady(true);setError('브라우저 저장소에 접근할 수 없습니다. 변경 내용은 미리보기에서만 유지됩니다.');}return()=>{alive=false;};},[]);
 const update=(change:(v:OfficeSettings)=>OfficeSettings)=>{setConfig(old=>{const next=change(old);current.current=next;return next;});setNotice('미리보기에 반영했습니다. 저장하면 새로고침 후에도 유지됩니다.');};
 async function persist(next:OfficeSettings){try{if(!ready)throw new Error('설정을 불러오는 중입니다.');const valid=validateSettings(next);if(!repo.current)throw new Error('로컬 저장소를 사용할 수 없습니다.');await repo.current.save(valid);current.current=valid;setConfig(valid);setSaved(JSON.stringify(valid));setError('');setNotice('설정을 저장했습니다.');return true;}catch(e){setNotice('');setError(`저장 실패: ${e instanceof Error?e.message:'저장소를 확인해 주세요.'}`);return false;}}
 return <SettingsContext.Provider value={{config,ready,dirty:JSON.stringify(config)!==saved,notice,error,update,save:()=>persist(current.current),importJSON:async raw=>{try{return await persist(parseSettingsJSON(raw));}catch(e){setError(`가져오기 실패: ${e instanceof Error?e.message:''}`);setNotice('');return false;}},restore:menusOnly=>persist(menusOnly?{...current.current,menus:defaults().menus}:defaults()),exportJSON:()=>exportSettingsJSON(current.current)}}>{children}</SettingsContext.Provider>;
}
export function useSettings(){const v=useContext(SettingsContext);if(!v)throw new Error('SettingsProvider가 필요합니다.');return v;}
export function usePresentation(){
 const {personal}=useDataMode();
 const demo=useDemo(),{config}=useSettings(),publicDemo=usePublicDemo();
 const assets=useMemo(()=>demo.assets.map(a=>{const p=config.buildings[a.id];return p?{...a,name:p.name||a.name,description:p.description}:a;}),[demo.assets,config.buildings]);
 const employees=useMemo(()=>originalEmployees.map(e=>{const p=config.employees[e.id];return {...e,status:personal?"업무 미연결":publicDemo?.enabled?`${p.active?simulationLabels[workflowFrame(employeeBusinesses[e.id],publicDemo.tick).phase.state]:"비활성 · 대기"} · SIMULATION`:e.status,name:p.name||e.name,role:p.role||e.role,description:p.cardDescription,initial:Array.from(p.name||e.name)[0],departmentId:p.departmentId,bodyColor:p.color??config.departments[p.departmentId].color,visible:p.visible,active:p.active};}),[personal,config.employees,config.departments,publicDemo?.enabled,publicDemo?.tick]);
 return {...demo,assets,employees,config};
}
