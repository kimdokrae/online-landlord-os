import { RegisterView } from "@/components/register-view";
export default async function NewPlotPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) { return <RegisterView worldV2={(await searchParams).preview === "world-v2"}/>; }
