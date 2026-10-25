"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {useDataMode} from '../operations/data-mode-provider';
import {inspectWelcome,onboardingKey,newWelcome,validateWelcome,type WelcomeState} from '@/lib/template/onboarding';
type Context={ready:boolean;auto:boolean;existing:boolean;progress:WelcomeState;error:string;save:(value:WelcomeState)=>boolean};
const Context=createContext<Context|null>(null);
export function TemplateProvider({children}:{children:ReactNode}){
 const {canUsePersonal}=useDataMode(),[ready,setReady]=useState(false),[auto,setAuto]=useState(false),[existing,setExisting]=useState(false),[progress,setProgress]=useState(newWelcome),[error,setError]=useState(''),[protectedSource,setProtected]=useState(false);
 useEffect(()=>{if(!canUsePersonal){setReady(true);return;}try{const value=inspectWelcome(localStorage);setExisting(value.existing);setProgress(value.progress);setAuto(value.auto);if(value.auto&&localStorage.getItem(onboardingKey)===null)localStorage.setItem(onboardingKey,JSON.stringify(value.progress));}catch(e){setProtected(true);setAuto(false);setError(e instanceof Error?e.message:'시작 안내를 저장하지 못했습니다. 기존 자료는 유지합니다.');}setReady(true);},[canUsePersonal]);
 const save=(value:WelcomeState)=>{try{if(!canUsePersonal||protectedSource||!ready)throw Error('시작 안내를 저장할 수 없습니다. 원본 자료는 유지합니다.');const valid=validateWelcome(value);localStorage.setItem(onboardingKey,JSON.stringify(valid));setProgress(valid);setAuto(valid.status==='pending');setError('');return true;}catch(e){setError(e instanceof Error?e.message:'시작 안내 저장 실패');return false;}};
 return <Context.Provider value={{ready,auto,existing,progress,error,save}}>{canUsePersonal&&!ready?<p role='status'>처음 실행 여부를 확인합니다…</p>:children}</Context.Provider>;
}
export function useTemplate(){const c=useContext(Context);if(!c)throw Error('TemplateProvider가 필요합니다.');return c;}
