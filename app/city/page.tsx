import { CityView } from "@/components/city/city-view";
import {legacyAssetsAvailable} from '@/lib/template/legacy-assets';
import {LegacyAssetNotice} from '@/components/template/legacy-asset-notice';
export default async function CityPage({ searchParams }: { searchParams: Promise<{ preview?: string; view?: string; inside?: string }> }) {
  const query=await searchParams;
  const worldV2=query.preview==='world-v2';
  if((worldV2||query.view==='legacy')&&!legacyAssetsAvailable(worldV2?'world-v2':'stable'))return <LegacyAssetNotice/>;
  return <CityView worldV2={worldV2} main3D={!worldV2&&query.view!=='legacy'} insideAssetId={typeof query.inside==='string'?query.inside:undefined}/>;
}
