import { memo } from "react";
import { furniture, isWall, OFFICE } from "@/lib/office/layout";

/** Original floor plan and furniture. Reference project code and graphics are not imported. */
export const OfficeScene = memo(function OfficeScene() {
  const tile = OFFICE.tile;
  const walls = Array.from({ length: OFFICE.rows }, (_, y) => Array.from({ length: OFFICE.columns }, (_, x) => ({ x, y }))).flat().filter(p => isWall(p.x, p.y));
  return <svg viewBox={`0 0 ${OFFICE.width} ${OFFICE.height}`} width="768" height="576" aria-hidden="true">
    <defs><pattern id="office-wood" width="64" height="32" patternUnits="userSpaceOnUse"><rect width="64" height="32" fill="#f3e9d4"/><path d="M0 31h64M0 0v31m32-31v31" stroke="#e8dcc2" strokeWidth=".8"/><path d="M5 7h14m25 14h12" stroke="#ebdfc5" strokeWidth="1.3" strokeLinecap="round"/></pattern><linearGradient id="office-wall" x2="0" y2="1"><stop stopColor="#d5e3ce"/><stop offset="1" stopColor="#b5c9ae"/></linearGradient></defs>
    <rect width="768" height="576" rx="15" fill="url(#office-wood)"/>
    <rect x="32" y="32" width="288" height="224" fill="#e7eddd"/><rect x="448" y="32" width="288" height="224" fill="#f2e6e3"/>
    <rect x="32" y="352" width="288" height="192" fill="#eee6ec"/><rect x="448" y="352" width="288" height="192" fill="#e2ebed"/>
    <path d="M368 40v491M45 304h683" stroke="#fff8e5" strokeWidth="24" opacity=".45"/>
    <rect x="339" y="450" width="63" height="87" rx="13" fill="#c4d2b0" stroke="#aebf98" strokeWidth="2"/><path d="M350 469h39m-39 8h39m-39 42h39" stroke="#e5ead6" strokeWidth="2"/>
    {walls.map(p => <g key={`${p.x}-${p.y}`}><rect x={p.x * tile} y={p.y * tile} width={tile} height={tile} fill="#bbc9ad"/><rect x={p.x * tile} y={p.y * tile} width={tile} height="23" fill="url(#office-wall)"/><path d={`M${p.x * tile} ${p.y * tile + 1}h32`} stroke="#edf0dd" strokeWidth="2"/></g>)}
    <g fill="#fff5dc" stroke="#a4baa4" strokeWidth="3"><rect x="82" y="9" width="152" height="16" rx="4"/><rect x="493" y="9" width="167" height="16" rx="4"/></g>
    <g stroke="#b8cebe" strokeWidth="3"><path d="M120 11v12m38-12v12m38-12v12M535 11v12m42-12v12m42-12v12"/></g>
    <g><rect x="345" y="9" width="47" height="46" rx="5" fill="#b19c81"/><rect x="350" y="15" width="36" height="34" rx="3" fill="#cdbd9a"/><circle cx="379" cy="34" r="2" fill="#f4e3ad"/><text x="368" y="75" textAnchor="middle" fill="#8e9e7e" fontSize="10">대표실 입구</text></g>
    <g fontFamily="inherit" textAnchor="middle"><text x="178" y="63" fontSize="15" fill="#87a07c">본부 · 운영</text><text x="589" y="63" fontSize="15" fill="#b3919b">작은 회의실</text><text x="176" y="382" fontSize="15" fill="#a893ae">콘텐츠 라운지</text><text x="590" y="382" fontSize="15" fill="#89a2ad">개발 스튜디오</text><text x="369" y="563" fontSize="10" fill="#91a07b">LOBBY · ENTRANCE</text></g>
    {furniture.map(item => {
      const x = item.x * tile; const y = item.y * tile; const w = item.width * tile; const h = item.height * tile;
      return <g key={item.id} data-furniture={item.id} transform={`translate(${x} ${y})`}>
        <rect x="3" y="6" width={w} height={h} rx="8" fill="#776d5714"/>
        {item.kind === "desk" ? <>
          <rect width={w} height={h} rx="7" fill="#be9d78"/><rect width={w} height={h - 8} rx="7" fill="#debc94" stroke="#c9a780" strokeWidth="1.5"/>
          <rect x={w / 2 - 20} y="8" width="40" height="26" rx="4" fill="#657a72"/><rect x={w / 2 - 16} y="12" width="32" height="17" rx="2" fill="#c5dfd8"/><path d={`M${w / 2 - 10} 18h17m-17 5h10`} stroke="#f0f2da" strokeWidth="2"/><path d={`M${w / 2} 33v6m-9 0h18`} stroke="#6e8176" strokeWidth="3"/>
          <rect x={w / 2 - 16} y="44" width="32" height="8" rx="3" fill="#f1e4cd"/><rect x="8" y="10" width="9" height="12" rx="2" fill="#e7e7bc"/><circle cx={w - 13} cy="39" r="5" fill="#fff2d5"/>
        </> : item.kind === "meeting" ? <><rect width={w} height={h} rx="27" fill="#bcaa91"/><rect width={w} height={h - 8} rx="27" fill="#e3ceac" stroke="#d2ba98" strokeWidth="2"/><ellipse cx={w / 2} cy="40" rx="14" ry="10" fill="#c3d0a6"/><path d={`M${w / 2} 42v-19m0 7-8-5m8 1 8-6`} stroke="#8da979" strokeWidth="3"/><rect x="24" y="32" width="18" height="24" rx="3" fill="#fbf1d8"/><rect x={w - 43} y="36" width="18" height="24" rx="3" fill="#eddcce"/></> : item.kind === "sofa" ? <><rect y="2" width={w} height={h - 2} rx="15" fill="#baa3bc"/><rect x="8" y="10" width={w - 16} height={h - 23} rx="10" fill="#d4bed4"/><path d={`M${w / 2} 13v28`} stroke="#bda5bf"/><rect x="7" y="7" width="22" height="26" rx="8" fill="#e8d2df"/><rect x={w - 29} y="7" width="22" height="26" rx="8" fill="#c7b6cf"/></> : item.kind === "shelf" ? <><rect width={w} height={h} rx="4" fill="#c4ac8a"/><path d={`M0 25h${w}M0 56h${w}M0 85h${w}`} stroke="#a98e6e" strokeWidth="4"/>{[0,1,2].map(i => <g key={i} transform={`translate(5 ${i * 31 + 4})`}><rect width="6" height="19" fill="#a6bb9e"/><rect x="8" width="7" height="19" fill="#d7bcbe"/><rect x="16" y="3" width="5" height="16" fill="#f2dfb0"/></g>)}</> : <><ellipse cx="16" cy="24" rx="13" ry="7" fill="#c9b68e"/><path d="M7 16h18l-3 13H10Z" fill="#d8c5a3"/><circle cx="12" cy="12" r="10" fill="#9cba90"/><circle cx="21" cy="9" r="8" fill="#b2c99e"/><path d="M16 21V9" stroke="#809e76" strokeWidth="2"/></>}
      </g>;
    })}
    <g fill="#cad6c1" stroke="#afc0a5" strokeWidth="2"><rect x="164" y="198" width="24" height="23" rx="8"/><rect x="551" y="454" width="25" height="23" rx="8"/></g>
    <g fill="#d7c1c7" stroke="#c0a8b2" strokeWidth="2">{[17,19].map(x => <rect key={x} x={x * tile + 4} y="202" width="24" height="20" rx="7"/>)}</g>
  </svg>;
});
