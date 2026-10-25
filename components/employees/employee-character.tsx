import type { CSSProperties } from "react";
import { employeeThemes, type EmployeeDepartment } from "@/lib/employees/themes";
import type { EmployeeActivity } from "@/lib/employees/status-adapter";
import styles from "./employee.module.css";

export function EmployeeCharacter({ department, activity, facing = "right", bodyColor }: { department: EmployeeDepartment; activity: EmployeeActivity; facing?: "left" | "right"; bodyColor?:string }) {
  const theme = employeeThemes[department];
  return <svg className={styles.character} viewBox="0 0 100 220" aria-hidden="true" data-activity={activity} data-department={department} data-facing={facing} style={{ "--employee-body": bodyColor??theme.body, "--employee-shade": theme.shade } as CSSProperties}>
    <ellipse className={styles.shadow} cx="50" cy="211" rx="25" ry="5" fill="#42565a" opacity=".13"/>
    <g className={styles.figure} data-part="figure">
      <g className={styles.leftLeg}><path d="M39 181q-1 17-5 23-2 6 4 6 10-2 10-26" className={styles.limb}/></g>
      <g className={styles.rightLeg}><path d="M59 182q1 16 5 22 3 7-4 7-10-4-11-27" className={styles.limb}/></g>
      <g className={styles.leftArm}><path d="M33 132q-15 8-17 34 4 6 8-5l13-22" className={styles.limb}/></g>
      <g className={styles.rightArm}><path d="M68 132q16 9 17 32-4 9-9-6l-11-21" className={styles.limb}/></g>
      <path className={styles.body} d="M50 46c-22 0-34 26-33 49 0 18 9 29 19 33-8 13-11 31-10 45 1 20 10 22 24 22s24-3 24-21c1-14-3-33-11-46 12-5 21-17 20-34C83 70 71 46 50 46Z"/>
      <path d="M56 129q13 31 7 49-2 8-17 9" fill="none" stroke="var(--employee-shade)" strokeWidth="6" strokeLinecap="round" opacity=".45"/>
      <g className={styles.antenna}><path d="M50 47q-7-15 0-27" fill="none" stroke="#344652" strokeWidth="3.5" strokeLinecap="round"/><path d="M50 23C26 10 43-2 50 10c9-13 25 1 0 13Z" className={styles.body}/></g>
      <g className={styles.face}><ellipse cx="38" cy="90" rx="3" ry="5" fill="#344652"/><ellipse cx="62" cy="90" rx="3" ry="5" fill="#344652"/><path d="M42 103q8 7 16-1" fill="none" stroke="#344652" strokeWidth="2.8" strokeLinecap="round"/><ellipse cx="30" cy="101" rx="4" ry="2.3" fill="#fff3ef" opacity=".5"/><ellipse cx="70" cy="101" rx="4" ry="2.3" fill="#fff3ef" opacity=".5"/></g>
    </g>
    <g className={styles.statusMark}><circle cx="82" cy="68" r="11" fill="#fff9e7" stroke="#a7ad95"/><text x="82" y="72" textAnchor="middle" fontSize="12" fill="#756e71">{activity === "ERROR" ? "!" : activity === "WAITING_APPROVAL" ? "…" : activity === "REPORTING" ? "✓" : activity === "MEETING" ? "··" : ""}</text></g>
  </svg>;
}
