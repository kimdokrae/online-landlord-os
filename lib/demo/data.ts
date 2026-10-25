import type { Asset, Employee, Plot, Task, IslandId } from "../domain.ts";

export const company = { name: "구름 위 스튜디오", mode: "DEMO" };
export const islands: { id: IslandId; name: string; english: string; caption: string; color: string }[] = [
  { id: "hq", name: "중앙 본사섬", english: "HEADQUARTERS", caption: "모든 가능성이 시작되는 곳", color: "mint" },
  { id: "revenue", name: "수익 자산섬", english: "REVENUE DISTRICT", caption: "작은 자산이 만드는 꾸준한 성장", color: "peach" },
  { id: "build", name: "개발 건설섬", english: "BUILD DISTRICT", caption: "다음 아이디어를 한 층씩", color: "lavender" },
  { id: "marketing", name: "마케팅섬", english: "MARKETING DISTRICT", caption: "세상과 연결되는 이야기", color: "blue" },
];
export const plots: Plot[] = islands.flatMap((island) => [0, 1, 2].map(position => ({ id: `${island.id}-${position}`, islandId: island.id, position })));
export const employees: Employee[] = [
  { id: "aria", name: "아리아", initial: "A", role: "경영 매니저", status: "보고 정리 예시", color: "mint", description: "자산별 현황과 우선순위를 정리하는 데모 직원입니다." },
  { id: "leo", name: "레오", initial: "L", role: "개발 엔지니어", status: "개발 진행 예시", color: "lavender", description: "개발 마일스톤과 결과물을 관리하는 데모 직원입니다." },
  { id: "milo", name: "마일로", initial: "M", role: "콘텐츠 에디터", status: "검수 대기 예시", color: "peach", description: "콘텐츠 기획과 검수 흐름을 보여주는 데모 직원입니다." },
  { id: "nova", name: "노바", initial: "N", role: "그로스 리서처", status: "대기 예시", color: "blue", description: "채널 성장과 유입 KPI를 살펴보는 데모 직원입니다." },
];
export const initialAssets: Asset[] = [
  { id: "studio-hq", plotId: "hq-0", name: "스튜디오 본사", type: "본사", stage: 5, color: "mint", description: "작은 아이디어가 모여 큰 그림을 그리는 우리 회사의 중심입니다.", employeeId: "aria", revenue: 0, kpi: { label: "주간 업무 정리", value: 8, target: 10, unit: "건" } },
  { id: "paper-garden", plotId: "revenue-0", name: "페이퍼 가든", type: "웹사이트", stage: 5, color: "peach", description: "일상의 유용한 정보를 전하는 가상의 라이프스타일 웹사이트입니다.", employeeId: "milo", revenue: 284000, kpi: { label: "월간 방문", value: 7200, target: 10000, unit: "회" } },
  { id: "tiny-tools", plotId: "revenue-1", name: "타이니 툴즈", type: "앱", stage: 5, color: "mint", description: "작은 불편을 해결하는 가상의 온라인 도구 모음입니다.", employeeId: "leo", revenue: 156000, kpi: { label: "월간 사용자", value: 420, target: 1000, unit: "명" } },
  { id: "orbit-note", plotId: "build-0", name: "오빗 노트", type: "앱", stage: 3, color: "lavender", description: "아이디어를 담고 연결하는 가상의 노트 앱을 건설하고 있습니다.", employeeId: "leo", revenue: 0, kpi: { label: "핵심 기능 구현", value: 3, target: 5, unit: "개" } },
  { id: "cloud-letter", plotId: "marketing-0", name: "클라우드 레터", type: "SNS", stage: 4, color: "blue", description: "스튜디오의 이야기를 세상에 전하는 가상의 콘텐츠 채널입니다.", employeeId: "nova", revenue: 0, kpi: { label: "구독자", value: 640, target: 1000, unit: "명" } },
];
export const tasks: Task[] = [
  { id: "task-1", assetId: "orbit-note", employeeId: "leo", title: "노트 편집 화면 프로토타입", status: "진행 예시", time: "데모 시나리오 01" },
  { id: "task-2", assetId: "paper-garden", employeeId: "milo", title: "다음 콘텐츠 기획안 검토", status: "검수 대기", time: "데모 시나리오 02" },
  { id: "task-3", assetId: "cloud-letter", employeeId: "nova", title: "채널 성장 리포트 초안", status: "검수 대기", time: "데모 시나리오 03" },
  { id: "task-4", assetId: "studio-hq", employeeId: "aria", title: "이번 주 자산 현황 정리", status: "완료 예시", time: "데모 시나리오 04" },
];
