import { notFound } from "next/navigation";
import { SectionView } from "@/components/public-demo/section-view";
const sections=['boardroom','tasks','reports','finance','archive'];
export function generateStaticParams(){return sections.map(section=>({section}));}
export default async function SectionPage({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!sections.includes(section))notFound();return <SectionView section={section}/>;}
