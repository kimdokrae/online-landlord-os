"use client";
import {useDataMode} from './operations/data-mode-provider';
import { stages, type Asset } from "@/lib/domain";
import { useDemo } from "./demo-provider";
export function StageControl({ asset }: { asset: Asset }) {
  const {personal}=useDataMode();
  const { setStage, ready } = useDemo();
  return <div className="stage-control"><label htmlFor={`stage-${asset.id}`}>{personal?"건설 단계":"데모 건설 단계"} <span>{asset.stage} / 5층</span></label>
    <select id={`stage-${asset.id}`} value={asset.stage} disabled={!ready} onChange={e => setStage(asset.id, Number(e.target.value))}>{stages.map((stage, index) => <option value={index} key={stage}>{index}단계 · {stage}</option>)}</select>
    <small>{personal?"선택한 단계에 따라 건물 층수가 달라집니다.":"샘플 단계를 바꾸면 블록 수가 달라집니다."}</small>
  </div>;
}
