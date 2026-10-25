"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Asset, AssetType } from "@/lib/domain";
import { initialAssets } from "@/lib/demo/data";
import { changeStage, parseStoredAssets, registerAsset, storageKey } from "@/lib/demo/state";

type DemoContext = {
  assets: Asset[]; ready: boolean; storageWarning: string;
  setStage: (id: string, stage: number) => void;
  addAsset: (input: { name: string; plotId: string; type: AssetType }) => string;
};
const Context = createContext<DemoContext | null>(null);
export function DemoProvider({ children, initial = initialAssets, storageName = storageKey }: { children: ReactNode; initial?: Asset[]; storageName?: string }) {
  const [assets, setAssets] = useState<Asset[]>(initial);
  const current = useRef(assets);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");
  const [canPersist, setCanPersist] = useState(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageName);
      if (raw !== null) {
        const restored = parseStoredAssets(raw);
        if (restored) { current.current = restored; setAssets(restored); }
        else { setCanPersist(false); setStorageWarning("저장된 데모 정보의 형식이 달라 기본 샘플을 표시합니다. 기존 저장값은 덮어쓰지 않습니다."); }
      }
    } catch { setCanPersist(false); setStorageWarning("브라우저 저장소를 사용할 수 없습니다. 이번 화면에서만 변경 내용이 유지됩니다."); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !canPersist) return;
    try { localStorage.setItem(storageName, JSON.stringify({ version: 1, assets })); }
    catch { setStorageWarning("데모 정보를 저장하지 못했습니다. 새로고침하면 변경 내용이 사라질 수 있습니다."); }
  }, [assets, ready, canPersist]);
  function update(next: Asset[]) { current.current = next; setAssets(next); }
  return <Context.Provider value={{ assets, ready, storageWarning,
    setStage: (id, stage) => { if (ready) update(changeStage(current.current, id, stage)); },
    addAsset: (input) => {
      if (!ready) throw new Error("데모 정보를 불러오는 중입니다.");
      const id = `demo-${crypto.randomUUID()}`;
      update(registerAsset(current.current, { ...input, id }));
      return id;
    },
  }}>{children}</Context.Provider>;
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("DemoProvider가 필요합니다.");
  return value;
}
