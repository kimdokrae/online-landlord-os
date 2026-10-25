"use client";
import {inspectWelcome} from "@/lib/template/onboarding";
import {useTemplate} from "@/components/template/template-provider";
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useSettings} from '@/components/settings/settings-provider';
export default function Home(){const setup=useTemplate();const {config,ready}=useSettings(),router=useRouter();useEffect(()=>{if(ready&&setup.ready){let auto=setup.auto;try{if(auto)auto=inspectWelcome(localStorage).auto;}catch{auto=false;}router.replace(auto?'/welcome':config.company.startRoute);}},[ready,setup.ready,setup.auto,config.company.startRoute,router]);return <p role="status">회사 시작 화면을 준비합니다…</p>;}
