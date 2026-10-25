import Link from 'next/link';

export function LegacyAssetNotice({assetId}:{assetId?:string}){
 return <section className='panel' aria-label='레거시 에셋 제외 안내' style={{padding:28,margin:'20px 0'}}>
  <h1>이전 이미지 화면은 배포본에서 제외했습니다</h1>
  <p>재배포 권한이 확인되지 않은 배경·마스크를 ZIP에 포함하지 않았습니다. 회사 설정과 사업 자료는 그대로이며, 코드 기반 3D 도시와 오피스를 이용할 수 있습니다.</p>
  <Link className='button' href={assetId?`/city?inside=${encodeURIComponent(assetId)}`:'/city'}>{assetId?'3D 오피스 열기':'3D 도시 열기'}</Link>
 </section>;
}
