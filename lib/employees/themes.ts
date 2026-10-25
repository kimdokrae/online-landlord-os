export const employeeThemes = {
  headquarters: { label: "본부", body: "#b3dfcf", shade: "#8eb9a8" },
  development: { label: "개발", body: "#a9ceef", shade: "#83a9cc" },
  marketing: { label: "마케팅", body: "#d4b7ef", shade: "#b095cd" },
  content: { label: "콘텐츠", body: "#f0c0d5", shade: "#d39db6" },
  finance: { label: "재무", body: "#f4dfa1", shade: "#d4bc7b" },
  operations: { label: "운영", body: "#bccaac", shade: "#97ab88" },
  quality: { label: "검수", body: "#9daecb", shade: "#7a8eaf" },
  support: { label: "고객지원", body: "#f0b4a7", shade: "#ce9087" },
} as const;
export type EmployeeDepartment = keyof typeof employeeThemes;
