"use client";
import {useDataMode} from "../operations/data-mode-provider";
import { useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { usePresentation } from "../settings/settings-provider";
import { interiorV2 } from "@/lib/world-v2";
import { departmentZones, interiorStaff } from "@/lib/office/world-v2-layout";
import { employeeThemes } from "@/lib/employees/themes";
import { EmployeeCharacter } from "../employees/employee-character";
import styles from "./office-v2.module.css";

type Zone = typeof departmentZones[number];
export function DepartmentZone({ zone, selected, onSelect }: { zone: Zone; selected: boolean; onSelect: () => void }) {
  return <button className={styles.zone} style={{ left: `${zone.x / 10}%`, top: `${zone.y / 7.5}%`, width: `${zone.width / 10}%`, height: `${zone.height / 7.5}%`, "--zone-color": employeeThemes[zone.department].body } as CSSProperties} aria-label={`${zone.label} 부서 선택`} aria-pressed={selected} onClick={onSelect}><span>{zone.label}</span></button>;
}
export function OfficeV2Scene({ selectedZoneId, onSelectZone, overlayRoot }: { selectedZoneId: string | null; onSelectZone: (zone: Zone | null) => void; overlayRoot: RefObject<HTMLDivElement | null> }) {
  const {personal}=useDataMode();
  const {employees}=usePresentation();
  const [staffId, setStaffId] = useState<string | null>(null);
  const zone = departmentZones.find(item => item.id === selectedZoneId);
  const staff = employees.find(item => item.id === staffId);
  return <>
    <img className={styles.plate} src={interiorV2} width="1448" height="1086" alt="구름 위 중앙 본사 내부. 네 층의 사무 공간과 중앙 로비" draggable={false}/>
    {departmentZones.map(item => <DepartmentZone key={item.id} zone={item} selected={selectedZoneId === item.id} onSelect={() => { setStaffId(null); onSelectZone(item); }}/>) }
    {interiorStaff.map(slot => { const person = employees.find(item => item.id === slot.employeeId)!; return <button key={person.id} className={styles.staff} style={{ display:person.visible?undefined:"none", left: `${slot.x / 10}%`, top: `${slot.y / 7.5}%` }} aria-label={`${person.name} 실내 직원 선택`} data-employee-id={person.id} onClick={() => { setStaffId(person.id); onSelectZone(null); }}><EmployeeCharacter department={slot.department} activity={personal?"IDLE":slot.activity}/><span>{person.name}</span></button>; })}
    {(zone || staff) && overlayRoot.current && createPortal(<section className={styles.info} aria-label={staff ? "배치 직원 업무 정보" : "선택한 부서 정보"} onClick={event => event.stopPropagation()}><button aria-label="실내 선택 정보 닫기" onClick={() => { onSelectZone(null); setStaffId(null); }}>×</button><strong>{staff?.name ?? zone?.label}</strong><p>{staff ? `${staff.role} · ${staff.status}` : zone?.description}</p><small>{staff ? `${employeeThemes[interiorStaff.find(slot => slot.employeeId === staff.id)!.department].label} · ` : ""}{personal?"업무 미연결":"DEMO · 실제 업무 연결 없음"}</small></section>, overlayRoot.current)}
  </>;
}
