"use client";
import {useDataMode} from "../operations/data-mode-provider";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { defaultDepartments } from "@/lib/settings/defaults";
import { useSettings } from "../settings/settings-provider";
import { employees } from "@/lib/demo/data";
import type { EmployeeDepartment } from "@/lib/employees/themes";
import type { EmployeeWorkSignal, WorkState } from "@/lib/employees/status-adapter";

type DemoEmployee = {
  id: string; name: string; visible:boolean; active:boolean; customColor?:string; department: EmployeeDepartment; signal: EmployeeWorkSignal;
  setDepartment: (department: EmployeeDepartment) => void; setWorkState: (state: WorkState) => void;
};
const Context = createContext<DemoEmployee | null>(null);
export function EmployeeDemoProvider({ children }: { children: ReactNode }) {
  const {personal}=useDataMode();
  const {config}=useSettings();
  const profile=config.employees[employees[0].id],dept=config.departments[profile.departmentId];
  const customColor=profile.color??(dept.color!==defaultDepartments[profile.departmentId].color||profile.departmentId!=="executive"?dept.color:undefined);
  const [department, setDepartment] = useState<EmployeeDepartment>("headquarters");
  const [signal, setSignal] = useState<EmployeeWorkSignal>({ source: "demo", state: "NONE" });
  const setWorkState = useCallback((state: WorkState) => {if(!personal)setSignal({ source: "demo", state });}, [personal]);
  return <Context.Provider value={{ id: employees[0].id, name: profile.name, visible:profile.visible, active:profile.active, customColor, department, signal:personal?{source:"demo",state:"NONE"}:signal, setDepartment, setWorkState }}>{children}</Context.Provider>;
}
export function useDemoEmployee() {
  const context = useContext(Context);
  if (!context) throw new Error("EmployeeDemoProvider가 필요합니다.");
  return context;
}
