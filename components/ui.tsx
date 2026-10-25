"use client";
import {useDataMode} from './operations/data-mode-provider';
import {usePathname} from "next/navigation";
import {useSettings} from "./settings/settings-provider";
import {pageForPath,renderCopy} from "@/lib/settings/defaults";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icon";
export function PageHeading({ pageId, entity, action }: {pageId?:string;entity?:{name?:string;description?:string};action?:ReactNode}) {
 const {copy}=useDataMode();
 const {config}=useSettings(),path=usePathname(),page=config.pages[pageId??pageForPath(path)]??config.pages.city;
 return <div className="page-heading"><div><div className="eyebrow">{renderCopy(copy(page.subtitle),entity)}</div><h1>{renderCopy(copy(page.title),entity)}<span className="heading-dot">.</span></h1><p>{renderCopy(copy(page.description),entity)}</p></div>{action}</div>;
}
export function Badge({ children, tone = "mint" }: { children: ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint: string; icon: string }) {
  return <div className="stat"><div className="stat-top"><span>{label}</span><Icon name={icon} size={18}/></div><strong>{value}</strong><small>{hint}</small></div>;
}
export function EmptyState({ title, description, pageId }: { title?: string; description?: string; pageId?:string }) {
  const {personal,copy:text}=useDataMode();
  const {config}=useSettings(); const copy=pageId?config.pages[pageId]:null; title=copy?.empty??title; description=copy?.emptyDescription??description;
  return <section className="empty-state"><span className="empty-icon"><Icon name="city" size={38}/></span><Badge tone="neutral">다음 개발 단계</Badge><h2>{text(title??'')}</h2><p>{text(description??'')}</p><Link href="/city" className="button secondary">{personal?"도시 둘러보기":"데모 도시 둘러보기"} <Icon name="arrow" size={16}/></Link></section>;
}
