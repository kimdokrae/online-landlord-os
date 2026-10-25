import { floorCount } from "@/lib/domain";
const palette: Record<string, [string, string, string]> = {
  mint: ["#d5ece3", "#8fc4ad", "#6aa38c"], peach: ["#f8ddc3", "#e6b78b", "#cd966b"],
  lavender: ["#e5def6", "#b9aad8", "#9482b5"], blue: ["#d5e7f7", "#95bbd8", "#7199b9"],
};
// Presentation only: replace this renderer with PixiJS without changing domain state.
export function Building({ stage, color, headquarters = false }: { stage: number; color: string; headquarters?: boolean }) {
  const count = floorCount(stage);
  const [top, left, right] = palette[color] || palette.mint;
  return <svg className="building-svg" viewBox="0 0 140 190" aria-hidden="true" data-floors={count}>
    <ellipse cx="72" cy="171" rx="53" ry="12" fill="#345d4b" opacity=".12"/>
    <path d="m14 155 55-24 57 24-55 27Z" fill="#e8e6d7"/><path d="m14 155 57 25 55-25v7l-55 25-57-25Z" fill="#c5c9b8"/>
    {count === 0 && <g><path d="m35 152 35-16 35 16-35 16Z" fill="none" stroke="#809b84" strokeWidth="2" strokeDasharray="5 4"/><path d="M70 147v17m-8-12 16 7" stroke="#809b84" strokeWidth="2"/></g>}
    {Array.from({ length: count }, (_, i) => { const y = 150 - i * 24; return <g key={i} data-floor={i + 1}>
      <path d={`M31 ${y - 13} 70 ${y + 4}v23l-39-17Z`} fill={left}/>
      <path d={`M70 ${y + 4} 109 ${y - 13}v23L70 ${y + 27}Z`} fill={right}/>
      <path d={`M31 ${y - 13} 70 ${y - 30} 109 ${y - 13} 70 ${y + 4}Z`} fill={top}/>
      <path d={`m39 ${y - 3} 8 3v9l-8-3Zm16 7 8 3v9l-8-3Z`} fill="#f7faf1" opacity=".84"/>
      <path d={`m79 ${y + 7} 8-4v9l-8 4Zm15-7 8-4v9l-8 4Z`} fill="#f7faf1" opacity=".65"/>
      <path d={`m31 ${y + 10} 39 17 39-17`} fill="none" stroke="#fff" opacity=".3"/>
    </g>; })}
    {count > 0 && <g><path d={`m28 ${147 - (count - 1) * 24 - 13} 42-19 42 19-42 19Z`} fill={top}/><path d={`m28 ${134 - (count - 1) * 24} 42 19 42-19v5l-42 19-42-19Z`} fill={right}/></g>}
    {headquarters && count > 0 && <g transform={`translate(0 ${24 * (5 - count)})`}><path d="M70 20V3" stroke="#527a66" strokeWidth="2"/><path d="M71 3h17l-5 5 5 5H71Z" fill="#4d886a"/></g>}
  </svg>;
}
