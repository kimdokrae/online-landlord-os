"use client";
import {useDataMode} from "../operations/data-mode-provider";
import { useEffect, type RefObject } from "react";
import { createPortal } from "react-dom";
import { worldV2Spawn, worldV2Walk } from "@/lib/world-v2";
import { gardenSpawn, gardenWalk } from "@/lib/employees/city-navigation";
import { employeeAnimation } from "@/lib/employees/status-adapter";
import { useDemoEmployee } from "./employee-provider";
import { useEmployeeMovement } from "./use-employee-movement";
import { EmployeeCharacter } from "./employee-character";
import { EmployeeInspector } from "./employee-inspector";
import styles from "./employee.module.css";

export function CityEmployee({ overlayRoot, open, onOpen, onClose, immersive, worldV2 = false }: { worldV2?: boolean; overlayRoot: RefObject<HTMLDivElement | null>; open: boolean; onOpen: () => void; onClose: () => void; immersive: boolean }) {
  const {personal}=useDataMode();
  const employee = useDemoEmployee();
  const spawn = worldV2 ? worldV2Spawn : gardenSpawn;
  const route = worldV2 ? worldV2Walk : gardenWalk;
  const movement = useEmployeeMovement(spawn, 46);
  const { move, setPaused } = movement;
  useEffect(() => { move(route); }, [move, route]);
  useEffect(() => { setPaused(!employee.active||employee.signal.state !== "NONE"); }, [employee.signal.state, employee.active, setPaused]);
  const activity = employeeAnimation(employee.signal, movement.walking);
  function restart() { employee.setWorkState("NONE"); movement.reset(spawn); setPaused(false); move(route); }
  return <>
    <button type="button" className={styles.cityActor} style={{ display:employee.visible?undefined:"none", left: movement.position.x, top: movement.position.y, zIndex: Math.round(movement.position.y) }} aria-label={`${employee.name} 직원 선택`} onClick={event => { event.stopPropagation(); onOpen(); }} data-employee-id={employee.id} data-scene-employee="city" data-x={movement.position.x} data-y={movement.position.y} data-motion={activity}>
      <EmployeeCharacter bodyColor={employee.customColor} department={employee.department} activity={activity} facing={movement.facing}/><span>{employee.name}{personal?"":" · DEMO"}</span>
    </button>
    {open && overlayRoot.current && createPortal(<div className={styles.cityCard} data-immersive={immersive}><EmployeeInspector activity={activity} onClose={onClose} onStateChange={state => setPaused(state !== "NONE")}><div className={styles.actions}><button onClick={() => { employee.setWorkState("NONE"); setPaused(!movement.paused); }}>{movement.paused ? "산책 계속" : "산책 일시정지"}</button><button onClick={restart}>산책 다시 시작</button></div><span className={styles.travelNote}>정원길 → 본사 입구 · 도착 후 대기<br/>이동은 장식 시뮬레이션이며 실제 업무 실행이 아닙니다.</span></EmployeeInspector></div>, overlayRoot.current)}
  </>;
}
