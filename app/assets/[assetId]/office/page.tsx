import { OfficeWorld } from "@/components/office/office-world";
import {legacyAssetsAvailable} from '@/lib/template/legacy-assets';
import {LegacyAssetNotice} from '@/components/template/legacy-asset-notice';
export default async function InteriorPage({ params, searchParams }: { params: Promise<{ assetId: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { assetId } = await params;
  const worldV2=(await searchParams).preview === 'world-v2';
  if(worldV2&&!legacyAssetsAvailable('interior'))return <LegacyAssetNotice assetId={assetId}/>;
  return <OfficeWorld assetId={assetId} worldV2={worldV2}/>;
}
