"use client";
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {emptyDiscovery,type DiscoveryData} from '@/lib/automation/model';
import {LocalDiscoveryRepository,type DiscoveryRepository} from '@/lib/automation/repository';
import {parseDiscovery,validateDiscovery} from '@/lib/automation/validation';
type Context={data:DiscoveryData;ready:boolean;busy:boolean;error:string;notice:string;change:(fn:(current:DiscoveryData)=>DiscoveryData)=>Promise<boolean>;importJSON:(raw:string)=>Promise<boolean>};
const Context=createContext<Context|null>(null);
export function DiscoveryProvider({children,repository,storageName}:{children:ReactNode;repository?:DiscoveryRepository;storageName?:string}) {
  const [data,setData]=useState(emptyDiscovery),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const current=useRef(data),repo=useRef<DiscoveryRepository|null>(repository??null),loading=useRef(true),pending=useRef(false);
  useEffect(()=>{let alive=true;try{repo.current??=new LocalDiscoveryRepository(window.localStorage,storageName);repo.current.load().then(value=>{if(!alive)return;if(value){current.current=value;setData(value);}loading.current=false;setReady(true);}).catch(e=>{if(alive){loading.current=false;setReady(true);setError(`업무 데이터 불러오기 실패. 원본은 유지합니다. ${e instanceof Error?e.message:''}`);}});}catch{loading.current=false;setReady(true);setError('저장소를 사용할 수 없습니다. 원본을 덮어쓰지 않습니다.');}return()=>{alive=false;};},[]);
  async function change(fn:(d:DiscoveryData)=>DiscoveryData) {
    if(pending.current||loading.current)return false;
    pending.current=true;setBusy(true);
    try{const next=validateDiscovery(fn(current.current));if(!repo.current)throw Error('저장소를 사용할 수 없습니다.');await repo.current.save(next);current.current=next;setData(next);setError('');setNotice('업무 데이터를 저장했습니다. 실제 실행은 발생하지 않습니다.');return true;}
    catch(e){setError(`저장 실패: ${e instanceof Error?e.message:'입력값을 확인하세요.'}`);setNotice('');return false;}
    finally{pending.current=false;setBusy(false);}
  }
  return <Context.Provider value={{data,ready,busy,error,notice,change,importJSON:raw=>change(()=>parseDiscovery(raw))}}>{children}</Context.Provider>;
}
export const useDiscovery=()=>{const context=useContext(Context);if(!context)throw Error('DiscoveryProvider가 필요합니다.');return context;};
