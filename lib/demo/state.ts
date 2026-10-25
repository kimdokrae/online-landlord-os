import { assetTypes, type Asset, type AssetType } from "../domain.ts";
import { employees, plots } from "./data.ts";

export const storageKey = "online-landlord-os:demo:v1";
const colors = ["mint", "peach", "lavender", "blue"];
export function parseStoredAssets(raw: string): Asset[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1 || !("assets" in value) || !Array.isArray(value.assets) || value.assets.length > plots.length) return null;
    const ids = new Set<string>(); const occupied = new Set<string>();
    const result: Asset[] = [];
    for (const a of value.assets) {
      if (!a || typeof a !== "object" || typeof a.id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(a.id) || ids.has(a.id) || !plots.some(p => p.id === a.plotId) || occupied.has(a.plotId) || typeof a.name !== "string" || !a.name.trim() || a.name.length > 40 || !assetTypes.includes(a.type) || !Number.isInteger(a.stage) || a.stage < 0 || a.stage > 5 || !colors.includes(a.color) || typeof a.description !== "string" || a.description.length > 300 || !(a.employeeId === null || employees.some(e => e.id === a.employeeId)) || !Number.isFinite(a.revenue) || a.revenue < 0 || !a.kpi || typeof a.kpi.label !== "string" || a.kpi.label.length > 60 || !Number.isFinite(a.kpi.value) || a.kpi.value < 0 || !Number.isFinite(a.kpi.target) || a.kpi.target <= 0 || typeof a.kpi.unit !== "string" || a.kpi.unit.length > 10) return null;
      ids.add(a.id); occupied.add(a.plotId);
      // Whitelist fields: never restore arbitrary stored properties.
      result.push({ id: a.id, plotId: a.plotId, name: a.name, type: a.type, stage: a.stage, color: a.color, description: a.description, employeeId: a.employeeId, revenue: a.revenue, kpi: { label: a.kpi.label, value: a.kpi.value, target: a.kpi.target, unit: a.kpi.unit } });
    }
    return result;
  } catch { return null; }
}
export function changeStage(assets: Asset[], id: string, stage: number): Asset[] {
  if (!Number.isInteger(stage) || stage < 0 || stage > 5) throw new Error("건설 단계가 올바르지 않습니다.");
  return assets.map(asset => asset.id === id ? { ...asset, stage } : asset);
}
export function registerAsset(assets: Asset[], input: { id: string; name: string; plotId: string; type: AssetType }): Asset[] {
  const name = input.name.trim();
  const plot = plots.find(p => p.id === input.plotId);
  if (!name || name.length > 40) throw new Error("건물 이름을 1~40자로 입력해 주세요.");
  if (!plot || assets.some(a => a.plotId === plot.id)) throw new Error("이 부지는 사용할 수 없습니다. 다른 빈 부지를 선택해 주세요.");
  if (!assetTypes.includes(input.type) || assets.some(a => a.id === input.id) || !/^[a-zA-Z0-9-]{1,80}$/.test(input.id)) throw new Error("건물 정보가 올바르지 않습니다.");
  return [...assets, { id: input.id, name, plotId: plot.id, type: input.type, stage: 0, color: colors[plots.indexOf(plot) % 4], description: "직접 등록한 DEMO 건물입니다. 건설 단계를 바꿔 도시의 변화를 살펴보세요.", employeeId: null, revenue: 0, kpi: { label: "샘플 마일스톤", value: 0, target: 5, unit: "개" } }];
}
