import {TemplateProvider} from "@/components/template/template-provider";
import {DataModeProvider} from "@/components/operations/data-mode-provider";
import {OperationsProvider} from "@/components/operations/operations-provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DiscoveryProvider } from "@/components/automation/discovery-provider";
import { SettingsProvider } from "@/components/settings/settings-provider";
import { DemoProvider } from "@/components/demo-provider";
import { Shell } from "@/components/shell";
import { EmployeeDemoProvider } from "@/components/employees/employee-provider";
import "./globals.css";
import {PublicDemoProvider} from "@/components/public-demo/public-provider";
import {publicAssets,publicSettings,publicKeys} from "@/lib/public-demo/preset";

export const metadata: Metadata = {
  title: { default: "스카이시티 · Online Landlord OS", template: "%s · Online Landlord OS" },
  description: "나만의 작은 사업 도시. 외부 서비스 없이 사용하는 온라인 건물주 OS 데모.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  const mode = process.env.APP_MODE ?? "demo";
  if (!["demo","public-demo","local-template"].includes(mode)) throw new Error("지원하는 모드는 demo, public-demo, local-template입니다.");
  const publicMode=mode!=="demo";
  const keys=mode==="local-template"?Object.fromEntries(Object.keys(publicKeys).map(k=>[k,`online-landlord-os:local-template:v1:${k}`])):publicKeys;
  const content=<EmployeeDemoProvider><Shell>{children}</Shell></EmployeeDemoProvider>;
  return <html lang="ko"><body><DataModeProvider mode={mode as "demo"|"public-demo"|"local-template"}><PublicDemoProvider enabled={publicMode} mode={mode as "demo"|"public-demo"|"local-template"}><TemplateProvider><DemoProvider initial={publicMode?publicAssets():undefined} storageName={publicMode?keys.assets:undefined}><SettingsProvider initial={publicMode?publicSettings():undefined} storageName={publicMode?keys.settings:undefined}><DiscoveryProvider storageName={publicMode?keys.discovery:undefined}>{publicMode?<OperationsProvider mode={mode as "public-demo"|"local-template"}>{content}</OperationsProvider>:content}</DiscoveryProvider></SettingsProvider></DemoProvider></TemplateProvider></PublicDemoProvider></DataModeProvider></body></html>;
}
