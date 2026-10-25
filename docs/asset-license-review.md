# 에셋·의존성 배포 검토

## 프로젝트 코드 승인

소유자가 **MIT License / Copyright (c) 2026 kimdokrae**를 승인했다. 루트 LICENSE에 정식 MIT 원문을 넣고 README와 package.json에 반영했다. 사용·수정·확장·재배포·상업적 이용 시 저작권/허가 고지를 유지하며 무보증 조건을 따른다. [MIT 원문](https://opensource.org/license/mit)을 확인했다. 프로젝트 코드 라이선스는 제3자 권리를 대신 허가하지 않는다.

## 런타임 에셋 처리

| 파일 | 근거/현재 권리 상태 | 검토 ZIP |
|---|---|---|
| public/skycity/garden-terrain.webp | 기존 생성 기록은 있으나 소유자가 재배포 권리 미확인이라고 답변 | **제외** |
| public/skycity/world-v2/terrain.webp | 사용자 제공 원본의 재배포 권리 미확인 | **제외** |
| public/skycity/world-v2/interior.webp | 사용자 제공 원본의 재배포 권리 미확인 | **제외** |
| public/skycity/world-v2/edge-mask.svg | 기존 코드이나 이전 승인 대기 범위에 포함된 마스크, 보수적으로 미확인 처리 | **제외** |
| public/templates/*.csv | 프로젝트 고정 가상 원장과 헤더에서 생성, 동일성 검사 | 포함 |
| 3D 도시·건물·새싹 직원 | 코드 Geometry/Material, 외부 모델 파일 없음 | 코드 포함, 프로젝트 MIT 적용 |
| docs/screenshots/template-*.png | 독립 테스트의 가상 회사·자료와 코드 기반 3D만 촬영 | 6개 포함, 미확인 배경이 보이는 캡처는 포함하지 않음 |
| 글꼴 | 시스템 글꼴 스택 | 별도 폰트 파일 없음 |

미확인 에셋은 원본 프로젝트에서 삭제하거나 변환·잘라내어 우회 포함하지 않았다. ZIP 허용 목록에서만 제외한다. docs/references의 이미지와 제3자 ai-office 참고 프로젝트도 계속 제외한다. 소스에서 경로 문자열을 보존하는 것은 실제 에셋 파일 배포가 아니다.

ZIP의 이미지 기반 이전 도시와 world-v2 실내는 서버 파일 존재 검사 후 제외 안내와 3D 링크를 표시한다. 기본 3D 도시·오피스는 이 에셋을 사용하지 않는다. 권리 확인 전 해당 파일을 다시 패키지에 추가하지 않는다. 기존 프로젝트에 파일이 있으면 종전 화면을 유지한다.

외부 3D 모델 다운로드는 없었고, 별도 모델/텍스처 파일을 포함하지 않는다. 코드 기반이라는 사실만으로 모든 제3자 권리를 법적으로 보증하지 않으며 기존 의존성과 고지는 계속 따로 검토한다.

## 의존성 확인

package-lock.json의 102개 패키지(여러 플랫폼 선택 의존성 포함)를 확인했다. MIT, Apache-2.0, BSD-3-Clause, ISC, 0BSD 외에 CC-BY-4.0, LGPL-3.0-or-later와 복합 표기가 있다. 모두 MIT라고 표시하지 않는다.

- Next.js / React / React DOM / Three.js / React Three Fiber: 잠금 파일의 MIT 표기 확인.
- Playwright / TypeScript 등: Apache-2.0 등 개별 표기 확인.
- caniuse-lite: CC-BY-4.0.
- Sharp/libvips 플랫폼 선택 패키지: LGPL 포함. 바이너리는 소스 ZIP에 넣지 않고 npm ci가 설치한다. 바이너리·컨테이너를 추후 재배포하면 별도 고지·소스 제공 조건 등의 검토가 필요하다.
- 실제 설치된 패키지와 Next.js 내부 번들의 LICENSE/NOTICE는 third-party-notices.txt에 수집했다. 설치되지 않은 Windows/Linux 선택 패키지는 메타데이터만 확인했으므로 해당 플랫폼 고지까지 실물 확인 완료라고 주장하지 않는다.

목록: dependency-license-inventory.json. 고지: third-party-notices.txt. 이 목록은 기술적 조사 결과이며 법적 배포 허가나 모든 의무 이행 보증이 아니다. 공개 직전에 라이선스·저작권·에셋 권리 확인을 완료해야 한다.
