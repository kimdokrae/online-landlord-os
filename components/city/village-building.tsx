import { memo, useId } from "react";
import { floorCount, type IslandId } from "@/lib/domain";

const palettes: Record<string, { wall: string; side: string; roof: string; trim: string }> = {
  mint: { wall: "#ffedc6", side: "#cfbb91", roof: "#6e9e88", trim: "#456e5a" },
  peach: { wall: "#fff0cb", side: "#d8b69b", roof: "#d48e7e", trim: "#a86158" },
  lavender: { wall: "#f1e2cf", side: "#cbbbac", roof: "#af9ac5", trim: "#7c6d93" },
  blue: { wall: "#fff0d2", side: "#cfceba", roof: "#9caac6", trim: "#707e9c" },
};

function Window({ x, y, glass, trim, side = false, compact = false }: { x: number; y: number; glass: string; trim: string; side?: boolean; compact?: boolean }) {
  return <g transform={`translate(${x} ${y}) skewY(${side ? -28 : 9}) scale(1 ${compact ? .75 : 1})`}>
    <rect x="-3" y="-2" width="22" height="23" rx="3" fill={trim} opacity=".2"/>
    <path d="M0 18V5q0-7 8-7t8 7v13Z" fill={glass} stroke="#fff4d8" strokeWidth="2.5"/>
    <path d="M8-1v18M0 6h16" stroke="#fff5d9" strokeWidth="1.8"/>
    <path d="m2 3 4-3M2 10l3-3" stroke="#fffce9" strokeWidth="2" opacity=".6"/>
    <path d="M-2 20h20" stroke={trim} strokeWidth="3" strokeLinecap="round"/>
  </g>;
}

/** Layered architectural sprites; each data-floor group is one real DEMO module. */
export const VillageBuilding = memo(function VillageBuilding({ stage, color, district = "build", headquarters = false, grounded = false }: {
  stage: number; color: string; district?: IslandId; headquarters?: boolean; grounded?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const count = floorCount(stage);
  const hq = headquarters || district === "hq";
  const construction = district === "build" && count > 0 && count < 5;
  const base = palettes[color] ?? palettes.mint;
  const p = district === "marketing" ? { ...base, roof: "#a992ca", trim: "#816399" } : hq ? palettes.mint : base;
  const top = 230 - count * 17;
  const ref = (name: string) => `url(#${uid}-${name})`;
  return <svg className="building-svg" viewBox="0 0 260 300" aria-hidden="true" data-floors={count}>
    <defs>
      <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#fff8df"/><stop offset=".5" stopColor={p.wall}/><stop offset="1" stopColor="#e8d0a6"/></linearGradient>
      <linearGradient id={`${uid}-side`} x2="1" y2="1"><stop stopColor={p.side}/><stop offset="1" stopColor="#af9e86"/></linearGradient>
      <linearGradient id={`${uid}-roof`} x2=".3" y2="1"><stop stopColor={p.roof}/><stop offset="1" stopColor={p.trim}/></linearGradient>
      <linearGradient id={`${uid}-glass`} x2=".7" y2="1"><stop stopColor="#84c7cf"/><stop offset=".4" stopColor="#b7e2d6"/><stop offset="1" stopColor="#f6dda1"/></linearGradient>
      <linearGradient id={`${uid}-gold`} x2="1" y2="1"><stop stopColor="#ffe787"/><stop offset="1" stopColor="#dfa548"/></linearGradient>
    </defs>
    <ellipse cx="131" cy="274" rx="112" ry="17" fill={grounded ? "#795869" : "#625b42"} opacity={grounded ? ".22" : ".16"}/>
    <path d="M16 251q111-49 226-5v12q-106 49-226 4Z" fill={grounded ? "#d2ae91" : "#c5b492"}/>
    <ellipse cx="130" cy="247" rx="114" ry="31" fill={grounded ? "#eed7b3" : "#d4dbac"}/>
    <path d="m57 237 72-22 80 24-75 28Z" fill="#eee0b9"/>
    <path d="m67 240 63-17 67 18-63 20Z" fill="#f5e9ce"/>
    {count === 0 ? <g>
      <path d="m59 227 72-25 67 25-67 25Z" fill="#d9d4ae" stroke="#b0b38b" strokeWidth="2" strokeDasharray="7 5"/>
      <g stroke="#c39b71" strokeWidth="4"><path d="M63 229v-35m133 36v-36M63 199l133 1"/><path d="M75 200v17m16-17v17m18-17v17m18-17v17m18-17v17m18-17v17m18-17v17" strokeWidth="2"/></g>
      <path d="M103 224v-51h50v51" fill="#f5e4c1" stroke="#ad8d68" strokeWidth="3"/>
      <path d="M116 196h24m-12-12v24" stroke="#9aaa80" strokeWidth="4" strokeLinecap="round"/>
      <path d="m183 247 12-25 12 25Z" fill="#e7a17c"/><path d="M188 238h14" stroke="#ffedcd" strokeWidth="4"/>
    </g> : <>
      {hq && <g>
        <path d="m28 198 47-16 21 22v39l-31 12-37-18Z" fill={ref("wall")}/><path d="m65 214 31-10v39l-31 12Z" fill={ref("side")}/>
        <path d="m20 199 22-39 40 10 23 35-39 15Z" fill={ref("roof")}/><path d="m20 199 46 21 39-15" fill="none" stroke="#426c5a" strokeWidth="3"/>
        <Window x={36} y={211} glass={ref("glass")} trim={p.trim}/><Window x={73} y={224} glass={ref("glass")} trim={p.trim} side/>
        <path d="m164 209 36-18 31 19v35l-38 18-29-20Z" fill={ref("wall")}/><path d="m194 222 37-12v35l-37 18Z" fill={ref("side")}/>
        <path d="m155 209 29-35 27 5 28 33-44 16Z" fill={ref("roof")}/><path d="m155 209 40 19 44-16" fill="none" stroke={p.trim} strokeWidth="3"/>
        <Window x={174} y={224} glass={ref("glass")} trim={p.trim}/><Window x={205} y={231} glass={ref("glass")} trim={p.trim} side/>
        <path d="m42 165 17 4 12 14-22-4Z" fill="#f7e9c9"/><path d="M48 165v-15l11 3 8 17" fill="#faf0d5" stroke={p.trim} strokeWidth="2"/>
      </g>}
      {Array.from({ length: count }, (_, i) => {
        const y = 230 - i * 17;
        const unfinished = construction && i === count - 1;
        return <g key={i} data-floor={i + 1}>
          <path d={`M65 ${y - 20} 154 ${y - 5}v20L65 ${y}Z`} fill={unfinished ? "#d5d0c3" : ref("wall")}/>
          <path d={`M154 ${y - 5} 196 ${y - 27}v20L154 ${y + 15}Z`} fill={unfinished ? "#abaea7" : ref("side")}/>
          <path d={`m63 ${y - 1} 91 16 44-22v4l-44 23-91-16Z`} fill={unfinished ? "#b4b6ab" : "#d0bd9a"}/>
          <path d={`m65 ${y - 19} 89 15 41-22`} fill="none" stroke="#fff5d6" strokeWidth="1.4" opacity=".8"/>
          {unfinished ? <g fill="#5d7074"><path d={`M78 ${y - 21} 100 ${y - 17}v17L78 ${y - 5}Z`}/><path d={`M118 ${y - 14} 141 ${y - 10}V${y + 7}l-23-4Z`}/><path d={`m164 ${y - 12} 21-11v17l-21 11Z`}/></g> : <>
            <Window x={78} y={y - 18} glass={ref("glass")} trim={p.trim} compact/><Window x={119} y={y - 11} glass={ref("glass")} trim={p.trim} compact/><Window x={168} y={y - 9} glass={ref("glass")} trim={p.trim} side compact/>
            <path d={`m69 ${y - 8} 4 .5m33 6 7 1m31 4 5 1m9-18 5 .8`} stroke="#d7c4a0" strokeWidth="1.3"/>
          </>}
        </g>;
      })}
      {!construction && <g>
        <path d={`M54 ${top + 3} 95 ${top - 44} 167 ${top - 31} 207 ${top - 9} 156 ${top + 20}Z`} fill={ref("roof")}/>
        <path d={`M54 ${top + 3} 95 ${top - 44} 156 ${top + 20}Z`} fill={p.roof}/>
        <path d={`m54 ${top + 3} 102 17 51-29v5l-51 30-102-17Z`} fill={p.trim}/>
        {[0, 1, 2, 3, 4].map(i => <path key={i} d={`m${67 + i * 5} ${top - i * 8} 61 11 42-19`} fill="none" stroke="#d8e4cb" strokeWidth="1.4" opacity=".24"/>)}
        <path d={`m108 ${top - 24} 19 4 12 20-27-5Z`} fill="#fff0d3" stroke={p.trim} strokeWidth="2"/>
        <path d={`m105 ${top - 25} 18-13 19 23-16-4Z`} fill={p.roof} stroke={p.trim} strokeWidth="2"/>
        <path d={`M116 ${top - 21}v10l10 2v-10Z`} fill={ref("glass")} stroke="#fff4d6" strokeWidth="1.7"/>
        <path d={`M177 ${top - 21}v-24l13-6v25Z`} fill="#d9bca0"/><path d={`m174 ${top - 45} 17-7 3 5-17 7Z`} fill="#f0dfbd"/>
        {hq && <>
          <path d={`M143 ${top - 37}v-32`} stroke="#a78760" strokeWidth="2.5"/><path d={`M144 ${top - 68}q12-5 26 0l-5 14q-9-5-21 0Z`} fill="#d68063"/><path d={`m151 ${top - 65} 6 1-2 5-4-1Z`} fill="#f2d784"/>
          <path d={`m132 ${top - 21} 23-15 19 23-22 12Z`} fill="#f4e7c8" stroke={p.trim} strokeWidth="2.5"/>
          <circle cx="153" cy={top - 15} r="9" fill="#fff5d5" stroke="#bdac7d" strokeWidth="1.8"/><path d={`M153 ${top - 21}v6l4 3`} fill="none" stroke={p.trim} strokeWidth="1.8"/>
        </>}
        {district === "marketing" && <><path d={`m147 ${top - 23} 20 4 16 16-22-4Z`} fill="#d4e2ed" stroke="#9c87b4" strokeWidth="2"/><path d={`M199 ${top - 39}v-24m-8 11h16`} stroke="#a68bba" strokeWidth="3"/><circle cx="199" cy={top - 64} r="4" fill="#edbed3"/></>}
      </g>}
      <g>
        <path d="m88 242 39-10 42 10-40 14Z" fill="#c2b28d"/><path d="m85 248 44 15 43-16v6l-43 16-44-15Z" fill="#d8c8a2"/><path d="m79 255 50 18 49-18v6l-49 19-50-19Z" fill="#e6d7b1"/>
        <path d="M103 236v-28q0-18 27-13v46Z" fill={p.trim}/><path d="M108 232v-23q0-10 17-9v36Z" fill="#748a7e"/>
        <path d="m110 205 11 2v12l-11-2Z" fill="#c4ddd0"/><circle cx="122" cy="228" r="1.7" fill="#f9dea2"/>
        {hq && <><path d="m93 204 23-19 23 22-15 6Z" fill="#f3e7c9" stroke="#d1bf99" strokeWidth="2"/><path d="m94 203 30 10 16-6v6l-16 6-30-10Z" fill="#c7b58e"/><path d="M96 210v29m37-21v21" stroke="#fff3d6" strokeWidth="5"/></>}
      </g>
      {district === "revenue" && <g>
        <path d="m61 213 94 16 10-24-94-16Z" fill="#fff0ce" stroke="#dfc0a1" strokeWidth="1.5"/>
        {[0, 1, 2, 3, 4].map(i => <path key={i} d={`m${71 + i * 19} ${189 + i * 3.25} 9 1.5-10 24-9-1.5Z`} fill={p.roof}/>)}
        <path d="m61 213 94 16v5l-94-16Z" fill={p.roof}/><path d="M67 217v26m82-11v26" stroke="#c19a75" strokeWidth="2.5"/>
        <path d="M36 247v-25m-19 2 19-17 22 17Z" fill="#f6dfb8" stroke="#b9916c" strokeWidth="2"/><path d="m23 222 13-11 16 11" fill="none" stroke={p.roof} strokeWidth="4"/>
      </g>}
      {district === "marketing" && <g><path d="m159 230 44-21 21 17-46 22Z" fill="#f4d8e1"/>{[0, 1, 2].map(i => <path key={i} d={`m${166 + i * 16} ${227 - i * 7} 6-3 20 16-6 3Z`} fill="#c49ec4"/>)}<path d="M176 248v13m42-33v17" stroke="#b68baf" strokeWidth="3"/><ellipse cx="146" cy={top + 2} rx="5" ry="7" fill="#edbeda"/></g>}
      {construction && <g>
        <g stroke="#c19b6e" strokeWidth="2.2" fill="none"><path d="M61 160v81m93-65v82m43-103v79M61 179l93 17 43-24M61 211l93 17 43-24M61 160l93 98m0-82-93 65"/></g>
        <g stroke="#c48a29" strokeWidth="2.3"><path d="M213 244V37h11v207Z" fill="#efbd4e"/><path d="m213 42 11 14-11 14 11 14-11 14 11 14-11 14 11 14-11 14 11 14-11 14 11 14-11 14" fill="none"/><path d="M119 55h135v10H119Z" fill="#f4c551"/><path d="m123 55 15 10 16-10 15 10 15-10 15 10 15-10 15 10 15-10" fill="none"/><path d="m125 55 92-25 33 25" fill="none"/></g>
        <path d="M142 64v74m0 0q-7 9-12 0" stroke="#8e846c" strokeWidth="2" fill="none"/>
        <path d="m207 244 24 5-10 12-24-7Z" fill="#ad9e7f"/><path d="m26 240 21-6 16 8-23 8Z" fill="#ccab82"/><path d="m26 240 14 10v12l-14-9Z" fill="#b89572"/><path d="m40 250 23-8v12l-23 8Z" fill="#d8b58a"/>
        <path d="m175 268 7-16 7 16Z" fill="#e49e68"/><path d="M178 263h8" stroke="#fff4cf" strokeWidth="2.5"/>
      </g>}
    </>}
    <g><ellipse cx="37" cy="253" rx="15" ry="8" fill="#819c66"/><circle cx="34" cy="246" r="10" fill="#a1ba7f"/><circle cx="44" cy="249" r="7" fill="#8fac6b"/>{[0, 1, 2].map(i => <g key={i}><path d={`M${28 + i * 8} 251v-9`} stroke="#7c9a5f" strokeWidth="1.5"/><circle cx={28 + i * 8} cy={241 - i % 2 * 4} r="3" fill={district === "marketing" ? "#e9b1ce" : "#edcdb0"}/></g>)}<ellipse cx="218" cy="259" rx="15" ry="7" fill="#a4b47f"/><circle cx="217" cy="252" r="9" fill="#99ae74"/><circle cx="225" cy="256" r="6" fill="#b2bf88"/></g>
  </svg>;
});
