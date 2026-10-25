import type { Metadata } from "next";
import { LabView } from "@/components/city/three-lab/lab-view";
export const metadata: Metadata = { title: "3D 스카이시티 실험실" };
export default async function ThreeLabPage({ searchParams }: { searchParams: Promise<{ inside?: string }> }) { const query = await searchParams; return <LabView insideAssetId={typeof query.inside === "string" ? query.inside : undefined}/>; }
