export const workStates = ["NONE", "RUNNING", "MEETING", "COMPLETED", "AWAITING_APPROVAL", "FAILED"] as const;
export type WorkState = typeof workStates[number];
export type EmployeeActivity = "IDLE" | "WALKING" | "WORKING" | "MEETING" | "REPORTING" | "ERROR" | "WAITING_APPROVAL";
export type EmployeeWorkSignal = { source: "demo" | "integration"; state: WorkState; runId?: string };
export const workLabels: Record<WorkState, string> = {
  NONE: "실행 중인 업무 없음", RUNNING: "업무 시작 예시", MEETING: "회의 예시",
  COMPLETED: "업무 완료·보고 예시", AWAITING_APPROVAL: "승인 대기 예시", FAILED: "실패 예시",
};
export const activityLabels: Record<EmployeeActivity, string> = {
  IDLE: "대기", WALKING: "걷기", WORKING: "업무 모션", MEETING: "회의 모션",
  REPORTING: "보고 모션", ERROR: "오류 모션", WAITING_APPROVAL: "승인 대기 모션",
};
/** A pure presentation adapter; contains no model invocation, credentials, polling or network. */
export function workActivity(signal: EmployeeWorkSignal): Exclude<EmployeeActivity, "WALKING"> {
  const mapping = { NONE: "IDLE", RUNNING: "WORKING", MEETING: "MEETING", COMPLETED: "REPORTING", AWAITING_APPROVAL: "WAITING_APPROVAL", FAILED: "ERROR" } as const;
  return mapping[signal.state];
}
export function employeeAnimation(signal: EmployeeWorkSignal, walking: boolean): EmployeeActivity {
  return walking ? "WALKING" : workActivity(signal);
}
