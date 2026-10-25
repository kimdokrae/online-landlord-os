"use client";
import {useDataMode} from './operations/data-mode-provider';
import {useOperations} from "./operations/operations-provider";
import {usePublicDemo} from "./public-demo/public-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type CSSProperties } from "react";
import { useSettings } from "./settings/settings-provider";
import { accentForeground } from "@/lib/settings/presentation";
import { safeMenuRoute } from "@/lib/settings/validation";
import { pageForPath, renderCopy } from "@/lib/settings/defaults";
import type { ReactNode } from "react";

import { useDemo } from "./demo-provider";
import { Icon } from "./icon";

export function Shell({ children }: { children: ReactNode }) {
  const {personal,sourceLabel}=useDataMode();
  const demo=usePublicDemo(), publicDemo=demo?.enabled, operations=useOperations();
  const pathname = usePathname();
  const {config}=useSettings(),company=config.company;
  const menus=[...config.menus].sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
  useEffect(()=>{const page=config.pages[pageForPath(pathname)];if(pathname==='/settings/data'&&operations){document.title=`${operations.state.preferences.dataMenuName} · ${company.name}`;return;}if(page)document.title=`${renderCopy(page.title)||company.cityName} · ${company.name}`;},[pathname,config.pages,company.name,company.cityName,operations?.state.preferences.dataMenuName]);
  const { storageWarning } = useDemo();
  const active = pathname==='/settings/data'&&operations?operations.state.preferences.dataMenuName:menus.find(m=>m.route===pathname)?.name || config.pages[pageForPath(pathname)]?.title || company.cityName;
  return <div className="app-shell" style={{"--green":company.themeColor,"--office-accent":company.themeColor,"--on-accent":accentForeground(company.themeColor),"--accent-ink":accentForeground(company.themeColor)==="#ffffff"?company.themeColor:"#253a33"} as CSSProperties}>
    <a className="skip-link" href="#main">본문으로 이동</a>
    <aside className="sidebar">
      <Link href="/city" className="brand"><span className="brand-icon"><Icon name="city" size={26}/></span><span>ONLINE<br/><strong>LANDLORD</strong><small>OPERATING SYSTEM</small></span></Link>
      <div className="workspace"><span className="workspace-avatar">{company.logo?<img src={company.logo} alt="회사 로고" width="36" height="36"/>:Array.from(company.name)[0]}</span><div><strong>{company.name}</strong><small>{company.description}</small></div>{!personal&&<span className="tiny-demo">D</span>}</div>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="주 메뉴">{menus.filter(m=>m.visible).map(m=>{let href:string;try{href=safeMenuRoute(m.route);}catch{return <span key={m.id} className="nav-link">{m.name} · 주소 확인 필요</span>;}if(publicDemo&&href.startsWith("https:"))return <span className="nav-link" key={m.id}>{m.name} · 외부 이동 제한</span>;const content=<><Icon name={m.icon}/><span>{m.name||m.id}</span>{m.id==="city"&&<span className="nav-dot"/>}</>;return href.startsWith('https:')?<a key={m.id} href={href} target="_blank" rel="noopener noreferrer" title={m.description} className="nav-link" data-menu-id={m.id}>{content}</a>:<Link key={m.id} href={href} title={m.description} data-menu-id={m.id} className={`nav-link ${pathname===href||href!=="/city/3d-lab"&&pathname.startsWith(href+'/')?'active':''} ${m.id==='settings'?'nav-settings':''}`} aria-current={pathname===href?'page':undefined}>{content}</Link>;})}</nav>
      <div className="sidebar-note"><Icon name="spark"/><strong>{company.slogan}</strong><p>당신의 가능성이<br/>도시가 되는 곳.</p></div>
      {operations&&<Link href="/settings/data" className="settings-shortcut">{operations.state.preferences.dataMenuName}</Link>}<Link href="/settings" className="settings-shortcut">회사 설정 열기</Link><Link href="/welcome" className="settings-shortcut">처음 사용 안내</Link><div className="profile"><span className="profile-avatar">{Array.from(company.owner)[0]}</span><div><strong>{personal&&company.owner==='데모 대표'?'대표':company.owner}</strong><small>{personal?'MY WORKSPACE':'DEMO WORKSPACE'}</small></div></div>
    </aside>
    <div className="main-wrap">
      <header className="topbar"><div className="breadcrumb">워크스페이스 <span>/</span> <strong>{active}</strong></div><div className="topbar-right"><span className="demo-chip"><i/> {personal?'내 데이터':'DEMO MODE'}</span><span className="topbar-description">{personal?'로컬 저장 · 업무 미연결':'샘플 데이터로 둘러보는 중'}</span><span className="mini-avatar">{Array.from(company.owner)[0]}</span></div></header>
      {!personal&&<div className="demo-banner"><Icon name="spark" size={16}/><span><strong>{publicDemo?(demo?.mode==='local-template'?"LOCAL TEMPLATE · ":"PUBLIC DEMO V1.1 · "):"데모 도시입니다."}</strong> {publicDemo?(demo?.mode==='local-template'?"입력 자료는 이 브라우저에만 저장됩니다. 직원 활동은 시뮬레이션이며 외부 연결은 없습니다.":"모든 경영 수치와 직원 활동은 가상입니다. 개인정보를 입력하지 마세요."):"기본 직원·수익은 가상 데이터입니다. 발굴실의 사용자 입력은 별도 표시하며 외부 서비스는 연결되지 않습니다."}</span></div>}
      {personal&&<div className="storage-warning" data-testid="personal-source">{sourceLabel} · 브라우저 로컬 자료 · 실제 AI 업무 미연결</div>}
      {storageWarning && <div role="status" className="storage-warning">{storageWarning}</div>}
      <main id="main" tabIndex={-1}>{children}</main>
      <footer>ONLINE LANDLORD OS <span>작은 사업의 가능성을, 한눈에.</span><span>{personal?'내 자료 · LOCAL ONLY':'DEMO · LOCAL ONLY'}</span></footer>
    </div>
  </div>;
}
