export const stages = ["부지 확보", "기획", "설계", "개발", "검수", "운영"] as const;
export const assetTypes = ["웹사이트", "앱", "SNS", "본사"] as const;
export type AssetType = (typeof assetTypes)[number];
export type IslandId = "hq" | "revenue" | "build" | "marketing";
export type Asset = {
  id: string; plotId: string; name: string; type: AssetType; stage: number;
  color: string; description: string; employeeId: string | null;
  revenue: number; kpi: { label: string; value: number; target: number; unit: string };
};
export type Plot = { id: string; islandId: IslandId; position: number };
export type Employee = { id: string; name: string; initial: string; role: string; status: string; color: string; description: string };
export type Task = { id: string; assetId: string; employeeId: string; title: string; status: "검수 대기" | "진행 예시" | "완료 예시"; time: string };
export const floorCount = (stage: number) => Math.max(0, Math.min(5, Math.trunc(stage)));
export const assetStatus = (stage: number) => stage === 5 ? "운영 예시" : stage === 0 ? "계획 예시" : "공사 중 예시";
export const money = (value: number) => new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(value);
