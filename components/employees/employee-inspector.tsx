"use client";
import {useDataMode} from "../operations/data-mode-provider";
import { employeeThemes, type EmployeeDepartment } from "@/lib/employees/themes";
import { activityLabels, workStates, workLabels, type EmployeeActivity, type WorkState } from "@/lib/employees/status-adapter";
import { useDemoEmployee } from "./employee-provider";
import { EmployeeCharacter } from "./employee-character";
import styles from "./employee.module.css";

export function EmployeeInspector({ activity, onClose, onStateChange, children }: { activity: EmployeeActivity; onClose: () => void; onStateChange?: (state: WorkState) => void; children?: React.ReactNode }) {
  const {personal}=useDataMode();
  const employee = useDemoEmployee();
  return <section className={styles.inspector} aria-label="직원 상세 카드">
    <button className={styles.close} aria-label="직원 카드 닫기" onClick={onClose}>×</button>
    <div className={styles.inspectorHeader}><EmployeeCharacter bodyColor={employee.customColor} department={employee.department} activity={activity}/><div><span className={styles.demo}>{personal?"업무 미연결":"DEMO CHARACTER"}</span><h3>{employee.name}</h3><p>{employeeThemes[employee.department].label} · {activityLabels[activity]}</p></div></div>
    <p className={styles.notice}>{personal?"장식용 캐릭터입니다.":"브라우저 DEMO 시뮬레이션입니다."}<br/>실제 AI 업무·모델은 연결되지 않았습니다.</p>
    <dl className={styles.facts}><div><dt>화면 동작</dt><dd>{activity} · {activityLabels[activity]}</dd></div><div><dt>업무 신호</dt><dd>{personal?"업무 미연결":`${employee.signal.state} · DEMO`}</dd></div></dl>
    <label>직원 부서<select aria-label="직원 부서" value={employee.department} onChange={e => employee.setDepartment(e.target.value as EmployeeDepartment)}>{Object.entries(employeeThemes).map(([id, theme]) => <option key={id} value={id}>{theme.label}</option>)}</select></label>
    {!personal&&<label>데모 업무 상태<select aria-label="데모 업무 상태" value={employee.signal.state} onChange={e => { const state = e.target.value as WorkState; employee.setWorkState(state); onStateChange?.(state); }}>{workStates.map(state => <option key={state} value={state}>{workLabels[state]}</option>)}</select></label>}
    {children}
  </section>;
}
