import type { CSSProperties } from "react";

const paths: Record<string, React.ReactNode> = {
  city: <><path d="m3 8 9-5 9 5-9 5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
  hq: <><path d="M4 21V7l8-4 8 4v14M2 21h20M9 21v-5h6v5"/><path d="M8 8h1m6 0h1M8 12h1m6 0h1"/></>,
  office: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/></>,
  boardroom: <><path d="M4 4h16v12H4zM8 21l4-5 4 5M8 8h8m-8 4h5"/></>,
  tasks: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 11l2 2 4-4m-6 8h6"/></>,
  reports: <><path d="M5 3h10l4 4v14H5zM14 3v5h5M9 12h6m-6 4h6"/></>,
  finance: <><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-6 4h6v4h-6z"/></>,
  archive: <><path d="M4 9h16v12H4zM3 3h18v6H3zM9 13h6"/></>,
  settings: <><path d="m10 3-1 3-3 1-3 3 2 3v4l4 1 3 3 3-2 4-1 1-4 1-3-3-3-4-1-1-2Z"/><circle cx="12" cy="12" r="3"/></>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
};
export function Icon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name] || paths.city}</svg>;
}
