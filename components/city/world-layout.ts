/** Presentation coordinates on one shared terrain plate; domain island/plot IDs stay intact. */
export const plotPositions: Record<string, { x: number; y: number; width: number; height: number }> = {
  "hq-0": { x: 484, y: 223, width: 228, height: 263 },
  "hq-1": { x: 623, y: 206, width: 114, height: 137 },
  "hq-2": { x: 358, y: 218, width: 114, height: 137 },
  "revenue-0": { x: 224, y: 302, width: 150, height: 173 },
  "revenue-1": { x: 292, y: 376, width: 136, height: 157 },
  "revenue-2": { x: 132, y: 373, width: 118, height: 140 },
  "build-0": { x: 759, y: 310, width: 173, height: 200 },
  "build-1": { x: 873, y: 354, width: 118, height: 139 },
  "build-2": { x: 644, y: 325, width: 110, height: 131 },
  "marketing-0": { x: 724, y: 456, width: 151, height: 174 },
  "marketing-1": { x: 553, y: 525, width: 119, height: 139 },
  "marketing-2": { x: 851, y: 539, width: 113, height: 134 },
};
export const districtLabels = {
  hq: { x: 564, y: 83, name: "중앙 본사" },
  revenue: { x: 5, y: 265, name: "수익 자산 구역" },
  build: { x: 785, y: 145, name: "개발 건설 구역" },
  marketing: { x: 756, y: 481, name: "마케팅 구역" },
};
