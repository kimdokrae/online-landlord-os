import { AssetDetail } from "@/components/asset-detail";
export default async function AssetPage({ params, searchParams }: { params: Promise<{ assetId: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { assetId } = await params;
  return <AssetDetail assetId={assetId} worldV2={(await searchParams).preview === "world-v2"}/>;
}
