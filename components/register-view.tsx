"use client";
import {useDataMode} from "./operations/data-mode-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { assetTypes, type AssetType } from "@/lib/domain";
import { islands, plots } from "@/lib/demo/data";
import { usePresentation } from "@/components/settings/settings-provider";
import { PageHeading, Badge } from "./ui";
import { Icon } from "./icon";
import { Building } from "./city/building";
export function RegisterView({ worldV2 = false }: { worldV2?: boolean }) {
  const {personal}=useDataMode();
  const suffix = worldV2 ? "?preview=world-v2" : "";
  const { assets, addAsset, ready, config } = usePresentation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("웹사이트");
  const [plotId, setPlotId] = useState("");
  const [error, setError] = useState("");
  const available = plots.filter(p => !assets.some(a => a.plotId === p.id));
  useEffect(() => { const requested = new URLSearchParams(window.location.search).get("plot"); if (requested) setPlotId(requested); }, []);
  const selectedPlot = available.some(p => p.id === plotId) ? plotId : available[0]?.id || "";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { const id = addAsset({ name, type, plotId: selectedPlot }); router.push(`/assets/${id}${suffix}`); }
    catch (err) { setError(err instanceof Error ? err.message : "등록하지 못했습니다."); }
  }
  return <><Link href={`/city${suffix}`} className="back-link">← 스카이시티로 돌아가기</Link><PageHeading/><div className="register-layout"><section className="panel padded"><Badge>{personal?"건물 등록":"DEMO 건물 등록"}</Badge><h2>어떤 사업을 시작할까요?</h2><p className="muted">이름과 부지를 고르면 나머지는 한 층씩 쌓아갈 수 있어요.</p><form onSubmit={submit} className="register-form"><label htmlFor="asset-name">건물 이름 <span>최대 40자</span></label><input id="asset-name" name="name" placeholder="예: 작은 여행 스튜디오" value={name} onChange={e => setName(e.target.value)} maxLength={40} required autoComplete="off" disabled={!ready}/><label htmlFor="asset-type">사업 유형</label><select id="asset-type" value={type} onChange={e => setType(e.target.value as AssetType)}>{assetTypes.filter(t => t !== "본사").map(t => <option key={t}>{t}</option>)}</select><label htmlFor="asset-plot">빈 부지 선택</label><select id="asset-plot" value={selectedPlot} onChange={e => setPlotId(e.target.value)} disabled={!ready || !available.length}>{available.length ? available.map(p => <option key={p.id} value={p.id}>{config.districts[p.islandId].name} · 부지 {p.position + 1}</option>) : <option>사용 가능한 빈 부지가 없습니다</option>}</select>{error && <p role="alert" className="form-error">{error}</p>}{!available.length && <p role="status" className="muted">{personal?"모든 부지가 사용 중입니다.":"모든 데모 부지가 사용 중입니다."} 이번 버전은 12개 부지를 지원합니다.</p>}<p className="form-note">등록 정보는 이 브라우저에만 저장됩니다. 실제 도메인 구매·배포·외부 연결은 발생하지 않습니다. 이름에 민감정보를 입력하지 마세요.</p><div className="form-actions"><Link href={`/city${suffix}`} className="button secondary">취소</Link><button type="submit" className="button" disabled={!ready || !available.length}>{personal?"건물 등록":"데모 건물 등록"} <Icon name="plus" size={16}/></button></div></form></section><div className="registration-preview"><span className="eyebrow">YOUR NEXT CHAPTER</span><div className="registration-art"><Building stage={2} color="mint"/></div><h2>{name.trim() || "당신의 다음 가능성"}</h2><p>시작은 작은 부지 하나.<br/>곧 당신만의 이야기가 쌓일 거예요.</p><Badge tone="neutral">등록 후 0단계부터 시작</Badge></div></div></>;
}
