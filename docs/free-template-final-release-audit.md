# 무료 템플릿 V1 최종 배포 검수

검수일: **2026-10-21 (Asia/Seoul)**. 대상 입력: `online-landlord-os-free-template-v1-review.zip`.
입력 SHA-256: `e527df884fea8dcde8d808c2ebb07e0cfd858c95eefeddd431853b8e5a9995fe`.

## 1. 판정과 검수 범위

**Mac 로컬 템플릿의 지원 범위에서 기술 검수 통과. Windows는 정적 검증만 완료했으며 실기 미검증.**

기존 개발 프로젝트 밖의 새 임시 폴더 `Fresh Install/online-landlord-os`에 ZIP을 풀었다. ZIP 무결성·기존 manifest 체크섬을 검증하고, 비어 있는 새 npm 캐시로 `npm ci`를 실행해 51개 플랫폼 적용 패키지를 새로 설치했다. 이전 node_modules·환경 파일·다른 프로젝트 소스·개인 브라우저 프로필/저장소는 가져오지 않았다. Playwright Chromium도 별도 새 위치에 다운로드했다. 기존 OS의 Node.js/npm 실행 도구는 사용했다.

환경: macOS **15.1.1 / arm64**, Node.js **24.19.0**, npm **11.17.0**, Chromium Headless Shell **156.0.8078.4**. 공백이 들어 있는 설치 경로에서도 실행했다. 개발 실행과 프로덕션 실행을 모두 검사했다. 기존 사용자의 서버와 충돌하지 않도록 검수 사본만 3015(로컬), 3016(공개 모드) 포트에서 실행했다. 배포 기본 안내는 **127.0.0.1:3003** 그대로다.

출력 후보: `release/online-landlord-os-free-template-v1-final-candidate.zip`. 후보 생성은 GitHub·인터넷·Notion 공개 승인이나 게시를 의미하지 않는다.

## 2. 제외 에셋 4개와 영향

| 정확한 파일명 | 참조 코드 | 영향 화면 | 독립 브라우저 결과 |
|---|---|---|---|
| `public/skycity/garden-terrain.webp` | `components/city/terrain-world.tsx`의 TerrainWorld·BuildingDiorama, `lib/template/legacy-assets.ts` | `/city?view=legacy`의 이전 2D 지형·미리보기 | 제외 안내 후 3D 도시 링크 정상 |
| `public/skycity/world-v2/terrain.webp` | `lib/world-v2.ts`의 terrainV2 → terrain-world.tsx | `/city?preview=world-v2` 지형·미리보기 | 제외 안내 후 3D 도시 링크 정상 |
| `public/skycity/world-v2/interior.webp` | `lib/world-v2.ts`의 interiorV2 → `components/office/office-v2-scene.tsx` | `/assets/studio-hq/office?preview=world-v2` | 제외 안내 후 3D 본사 내부 링크 정상 |
| `public/skycity/world-v2/edge-mask.svg` | `components/city/village.module.css`의 world-v2 terrainPlate mask-image | V2 이미지 가장자리 블렌딩 | V2 렌더링 진입 전 제외 안내, 누락 마스크를 요청하지 않음 |

`app/city/page.tsx`와 `app/assets/[assetId]/office/page.tsx`가 서버 파일 존재 검사 후 `LegacyAssetNotice`를 표시한다. 경로 문자열은 코드에 보존되지만 실제 에셋은 후보 ZIP에 포함하지 않았다.

- **일반 사용 흐름:** 이미지 404·깨진 이미지 아이콘·페이지 JavaScript 오류 **0건**, 외부 서비스 요청 시도 **0건**.
- **의도적인 직접 URL 검사:** 제외된 네 파일의 `/skycity/...` URL을 각각 직접 요청하면 **404**다. 일반 화면이 해당 파일을 불러와 실패한 현상과 구분한다.
- 기본 `/city`·건물 내부는 실제 Three.js Geometry/Material 기반이다. Canvas 1개, 건물 5개, 직원 4명, `imageMaps=0`을 확인했고 직원 좌표 변화도 확인했다. 지형·건물·직원이 누락되지 않았다.
- 이 네 파일은 기본 3D 사용에 필수 파일이 아니므로 다시 넣거나 대체 이미지를 만들 필요가 없다. 이전 이미지 화면을 복원하려면 권리 확인 후 별도 에셋을 제공하거나, 현재 코드 기반 3D 도시·오피스를 그 경로에도 재사용하는 방법을 권장한다. 미확인 이미지를 잘라내거나 변형해 재포함하지 않는다.

## 3. 완전 신규 사용자 흐름

모든 회사·수치 변경은 검수용 빈 브라우저 프로필에서 UI와 CSV로 수행했다. 실제 사용자 정보를 사용하지 않았다.

| 항목 | 결과 |
|---|---|
| 압축 해제 → 새 의존성 설치 → 로컬 실행 | 통과, `.env.local` 없이 실행 |
| 최초 주소 접속 | `/welcome`으로 이동, 두 선택 버튼 정상 |
| 데모 회사 체험 | 기존 DEMO 매출·차트·움직이는 직원 즉시 표시 |
| 3D 건물 선택 → 중앙본부 내부 → 도시 복귀 | 실제 UI 버튼으로 통과 |
| 5종 건물·직원·알림·성장·업무 시뮬레이션 | 지원 범위의 기존 회귀 테스트 통과 |
| 같은 프로필에서 내 회사 만들기 | 회사·도시 → 건물 → 직원 → CSV 순서 통과 |
| 이름 변경·새로고침 | 회사/건물/직원 이름과 사업 ID 매핑 유지 |
| 샘플·빈 양식 다운로드 | 실제 다운로드 파일명·내용이 배포 파일과 정확히 일치 |
| 수정한 720행 샘플 업로드 | 메인·금고·담당 건물·직원 보고에 동기화 |
| 같은 기간 CSV 교체 | 이전 가져오기를 선택해 교체, 중복 합산 없음 |
| 체험 ON/OFF | DEMO 원장과 사용자 입력의 수치가 분리되고 원래 DEMO 복원 |
| 모바일 390px | 수평 넘침 없이 도시·컨트롤 표시, 세계 화면 캡처 확인 |

### 실제 CSV 검증 수치

| 원천 | 30일 총매출 | 30일 광고 추정수익 | 웹사업 총매출 |
|---|---:|---:|---:|
| 다운로드한 실제 샘플 720행 | 15,457,000원 | 366,150원 | 720,000원 |
| 샘플의 매출·광고 금액을 2배로 수정해 가져오기 | 30,914,000원 | 732,300원 | 1,440,000원 |
| 같은 샘플을 3배로 수정해 기존 CSV 교체 | 46,371,000원 | 1,098,450원 | 2,160,000원 |
| 다시 체험 ON | 15,457,000원 | 366,150원 | 720,000원 |
| 다시 체험 OFF·새로고침 | 46,371,000원 | 1,098,450원 | 2,160,000원 |

CSV 수정은 다운로드한 원본 파일에서 수행했다. 별도 가짜 집계 함수를 앱에 넣지 않았다. 웹사업 직원 보고도 해당 웹사업 매출로 확인했다. 비용이 누락된 사업/일자는 **순이익 산정 불가**로 유지했으며 지급액은 수익에 재합산하지 않았다. 기간 매출과 월 누적 KPI가 다른 이유는 설명서에 보완했다. CSV 업로드가 업무 실행을 시작하지 않으며 개인 모드 직원 카드는 **업무 미연결**로 표시한다.

## 4. 테스트 기록

| 검증 | 실제 결과 |
|---|---|
| 신규 npm 설치 | 새 캐시·새 node_modules, 51개 설치 성공 |
| `npm test` | **78/78 통과**, skip 0 |
| `npm run typecheck` | 성공 |
| `npm run build:local` | 성공 |
| `npm run build:public` | 성공 |
| 배포 지원 Playwright `npm run test:final` | **32/32 통과**, 기존 테스트 삭제·skip 없음 |
| 신규 사용자 연속 흐름 | 개발 실행 **13/13**, 프로덕션 실행 **13/13** 검증 지점 통과 |
| 공개 보안 추가 검사 | 개인 회사 만들기 비활성화·공개 가상 데이터 안내·3D·CSP·API 차단 통과 |
| CSV 정적 파일/공통 생성 함수 동일성 | 통과 |
| Mac `.command` | zsh 문법 검사 통과. 실제 설치·dev·build·start는 CLI로 확인 |
| Windows `.cmd`/PowerShell 안내 | 코드·명령·경로·Node 24 검사·npm.cmd 구조 정적 검증만 완료 |

32개는 템플릿 7개, 데이터·업무 16개, 공개 DEMO 9개다. 실제 실행 명령은 분리된 로컬/공개 URL을 `FINAL_LOCAL_URL`, `FINAL_PUBLIC_URL`, `PUBLIC_DEMO_BASE_URL`로 명시했다. 새 `playwright.final-audit.config.ts`와 `test:final` 명령을 후보에 포함해 재현할 수 있게 했다. 원래의 테스트 파일은 수정하지 않았다. 의도적으로 제외한 이미지가 필요했던 이전 전체 `test:e2e`를 모두 통과했다고 주장하지 않는다.

검수 도구 초기에는 개인 차트의 접근성 이름을 DEMO 차트의 이름으로 찾은 선택자 오류가 있었다. 실제 차트가 렌더링됨을 확인하고, 두 모드의 실제 이름을 찾도록 검수 도구를 수정한 뒤 새 빈 프로필로 전체 13개 흐름을 다시 통과했다. 포트 감시 기준을 맞추기 전 중단한 실행도 성공 횟수에 포함하지 않았다. 앱 오류나 테스트를 무시해 통과시킨 것이 아니다.

## 5. Mac·Windows 사용자 실행 가이드

ZIP을 먼저 완전히 압축 해제하고 안쪽 `online-landlord-os` 폴더에서 실행한다. Node.js **24.x**가 필요하며 기본 실행에는 API 키나 환경 파일 복사가 필요 없다.

Mac:

```sh
node --version
npm --version
npm run doctor
npm ci
npm run dev:local
```

Windows PowerShell (**실기 미검증**):

```powershell
node --version
npm.cmd --version
npm.cmd run doctor
npm.cmd ci
npm.cmd run dev:local
```

접속: **http://127.0.0.1:3003**. 종료: 실행한 터미널에서 Control+C / Ctrl+C. 재시작은 같은 폴더에서 `npm run dev:local`(Windows `npm.cmd run dev:local`). 알려진 본인 서버가 포트를 쓰는지 먼저 확인하며 타인의 프로세스를 강제 종료하지 않는다. 주소·포트를 바꾸면 브라우저 저장소가 달라진다는 안내를 유지했다.

Mac Finder에서 도우미를 더블클릭했을 때의 다운로드 격리 경고·서명 흐름, Node 설치 프로그램 자체, 모든 Mac/브라우저 조합은 검증하지 않았다. 실제 Windows OS·3D·도우미 실행을 완료했다고 표시하지 않는다.

## 6. Notion 원고와 후보 사본의 수정

`docs/notion-free-template-guide.md`의 22개 항목을 확인했다. 설치·종료/재시작·온보딩·이름 변경·CSV 입력·기간별 그래프·수동 갱신·자동 연동 확장·백업·오류 해결·ChatGPT·Claude·Codex 활용·안전한 코드 전달·FAQ가 포함돼 있다.

후보 사본에서만 다음을 보완했다.

- 실제 최종 후보 ZIP 파일명, 압축 푼 안쪽 폴더와 실행 명령을 명시.
- ZIP에 없던 이전 보고서 참조를 **이번 보고서 링크**로 교체하고 보고서를 ZIP에 포함.
- Mac/Windows 압축 해제와 모바일의 KPI 아래 도시 위치 설명.
- 샘플을 복사해 수정하는 방법, UTF-8 CSV, 헤더만 있는 빈 양식과 .xlsx의 차이.
- 30일과 이번 달 KPI 기간 차이, 업로드는 자동 동기화가 아님을 명확히 유지.
- Notion에 넣을 실제 검수 스크린샷을 동봉. Notion 게시 작업은 하지 않음.
- 최종 후보 생성 옵션과 배포 지원 회귀 테스트 설정·명령 추가.

수동 입력은 새 수치를 사용자가 입력하고, CSV는 새 파일을 다시 가져와야 갱신된다. 자동 갱신은 **추가 개발 필요**이며 n8n → 인증된 서버 수집 계층/Workspace 저장소 → 권한 검증 API/Provider → 공통 집계 구조로 설명했다. 외부 서버가 브라우저 localStorage에 직접 데이터를 쓸 수 있다고 가정하지 않는다.

후보 사본의 변경 파일: `README.md`, `.gitignore`, `package.json`의 test:final 스크립트, `scripts/template-package.mjs`, 새 `playwright.final-audit.config.ts`, `docs/notion-free-template-guide.md`, `docs/free-template-package.md`, 본 보고서·의존성 고지·검수 이미지. 기존 `app/`, `components/`, `lib/`, 저장 모델·키·3D 렌더링 코드는 변경하지 않았다. 의존성 버전·잠금 파일·기존 테스트도 변경하지 않았다.

## 7. 보안과 라이선스

- 루트 **MIT LICENSE**, **Copyright (c) 2026 kimdokrae**, README 재사용 조건과 제3자 고지를 확인했다.
- 재배포 권리 미확인 에셋 4개는 계속 제외한다. 외부 3D 모델·텍스처·폰트 파일을 새로 다운로드하거나 ZIP에 넣지 않았다. 새 사진은 코드 기반 3D와 가상 검수 회사/금액만 담는다.
- 새로 설치된 의존성에서 라이선스 목록 **102개 잠금 항목**, 실제 LICENSE/NOTICE **170개**를 다시 수집했다. 플랫폼 선택 의존성의 Windows/Linux 고지는 실물 검증하지 못했다. LGPL/복합·CC-BY 등은 별도 조건이 있어 전부 MIT라고 표시하지 않는다. 프로젝트 MIT 허가가 제3자 권리를 대신하지 않는다.
- `.env.example`만 포함한다. 실제 환경 파일·API 키·DB 접속 인증·OAuth 토큰·브라우저 프로필·개인 백업·수익 CSV·로그·node_modules·빌드·참고 프로젝트를 허용 목록에서 제외한다. 민감 패턴 검사도 수행하며, 모든 형태의 비밀값 검출을 보장하는 것으로 설명하지 않는다.
- 입력 ZIP에는 사용자의 localStorage가 없었으며, 빈 브라우저 컨텍스트에서 시작했다. 가상으로 만든 업로드/저장 자료도 후보 ZIP으로 수집하지 않는다.
- 공개 모드는 개인 회사 만들기를 막고 가상 자료만 안내한다. 공개 서버의 `/api/private/revenue`, `/api/integrations/neon`, `/hooks/n8n`에서 GET/POST **6건 모두 403**, no-store를 확인했다. 브라우저 저장·쿼리·헤더에서 private 모드를 주장해도 서버 권한이 바뀌지 않았다. CSP의 connect-src self도 확인했다.
- 일반 사용자 흐름에서 외부 요청 시도 0건. 운영 n8n·Neon·Slack·WordPress·AdSense·AI API에 연결·수정하지 않았다.
- 원본 개발 프로젝트는 검수 중 수정하지 않았다. 최종 ZIP·요청 보고서·검수 이미지 산출물만 별도로 전달한다.

## 8. 스크린샷

아래는 독립 프로덕션 설치본과 가상 검수 자료의 실제 캡처다. `docs/screenshots/final-audit/`에 동봉한다.

| 파일 | 화면 |
|---|---|
| [첫 실행](screenshots/final-audit/01-first-run-viewport.png) | 빈 브라우저의 /welcome |
| [3D 도시](screenshots/final-audit/02-demo-city-world.png) | /city, 지형·5종 건물·직원 |
| [본사 내부](screenshots/final-audit/03-demo-hq-office-world.png) | 중앙본부 실제 3D 실내 |
| [CSV 가이드](screenshots/final-audit/06-csv-guide.png) | 컬럼 설명·수동/CSV/자동 갱신 차이 |
| [내 회사·직원](screenshots/final-audit/07-own-city-staff-world.png) | 변경된 표시명과 직원 보고 |
| [CSV 교체 금고](screenshots/final-audit/09-replaced-finance.png) | 매출 46,371,000원·변경 그래프 |
| [이전 도시 제외 안내](screenshots/final-audit/10-legacy-exclusion-0-viewport.png) | /city?view=legacy |
| [V2 도시 제외 안내](screenshots/final-audit/10-legacy-exclusion-1-viewport.png) | /city?preview=world-v2 |
| [V2 실내 제외 안내](screenshots/final-audit/10-legacy-exclusion-2-viewport.png) | V2 본사 실내 경로 |
| [모바일 3D](screenshots/final-audit/11-city-mobile-world.png) | 390px 화면의 도시·컨트롤 |
| [공개 온보딩](screenshots/final-audit/public-onboarding.png) | 내 회사 만들기 비활성화 |
| [공개 3D](screenshots/final-audit/public-city.png) | 가상 수치 전용 공개 서버 |

## 9. 실제 공개 가능 여부와 제한

**Mac 지원 범위를 명시한 무료 로컬 템플릿의 배포 후보로 검토할 수 있다.** 검증된 신규 설치·3D·재무·CSV·모드 전환·공개 API 차단에서 차단 수준의 문제는 확인되지 않았다. 권리 미확인 이미지를 제외한 제한과 Windows 실기 미검증을 사용자에게 반드시 안내해야 한다. 모든 OS에서 검증된 정식 배포나 외부 에셋 전체에 대한 법적 권리 검증 완료로 표시하지 않는다.

개발 모드에서 Three.js의 Clock 폐기 예정·PCFSoftShadowMap 대체 경고가 보였으나 화면은 정상 렌더링했고 브라우저 예외는 없었다. 후속 유지보수에서 라이브러리 호환 API를 정리할 수 있다. Windows 실기, 저성능 실제 기기 장시간 성능, Mac 다운로드 격리·서명 흐름은 남은 검증이다. 실제 AI·자동 동기화·인증된 외부 DB 연결은 미구현이다.

이번 작업은 후보 ZIP과 설명서 준비까지다. GitHub 공개·외부 호스팅·Notion 게시는 수행하지 않았으며 소유자의 별도 승인이 필요하다.
