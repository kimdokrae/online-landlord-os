import { EmployeeDetail } from "@/components/office-view";
export default async function AgentPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return <EmployeeDetail agentId={agentId}/>;
}
