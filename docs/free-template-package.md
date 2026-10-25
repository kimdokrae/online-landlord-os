# Free Template V1 패키지 구성과 배포 전 확인

## 현재 결과의 의미

로컬에서 생성하는 ZIP은 **검토 후보**이다. 코드는 소유자 승인에 따라 MIT License(Copyright (c) 2026 kimdokrae)로 확정했다. 미확인 레거시 에셋은 제외했고, Windows 실기 검증과 최종 공개 승인은 남아 있다. GitHub 공개, 웹 배포, Notion 게시, 실제 운영 시스템 연결은 이 작업의 실행 대상이 아니다.

## 포함

- app / components / lib / scripts / tests의 필요한 소스.
- package.json / package-lock.json / TypeScript·Next·Playwright 설정.
- MIT LICENSE / README / AGENTS.md / 비밀값 없는 .env.example.
- Mac·Windows 시작 도우미.
- 실제 DEMO 원장 CSV와 빈 CSV.
- 자체 코드 기반 3D 도시·건물·직원과 가상 자료로 촬영한 스크린샷. 레거시 배경·마스크 4개는 제외.
- 초보자용 Notion 원고, 최종 독립 검수 보고서, AI 활용 안내, 라이선스 목록·고지.
- REVIEW-STATUS.json: 승인 대기 상태와 파일별 SHA-256.

## 제외

권리 미확인 garden-terrain.webp, world-v2/terrain.webp, world-v2/interior.webp, world-v2/edge-mask.svg, node_modules, .next*, .git, 환경 파일(.env.example 제외), 인증·개인·백업 폴더, 개인 백업 JSON, 실제 수익 CSV, 로그, 테스트 결과·trace·브라우저 바이너리, 이전 구현 보고서, docs/references 전체(참고 프로젝트·원본 시안 포함), 로컬 캐시와 검증용 복사본.

패키지는 전체 폴더 압축이 아니라 **포함 허용 목록**으로 생성한다. 모든 텍스트 파일에서 비밀키·DB 인증 URI·Webhook·개인 절대 경로 등의 패턴을 검사하고 발견하면 값은 출력하지 않고 생성을 중단한다. 이 검사는 모든 종류의 비밀정보를 알아내는 보장이 아니므로 배포 담당자가 목록도 검토해야 한다. 브라우저 개인 자료는 파일로 자동 수집하지 않는다.

## 생성

Node.js 24 설치 후 프로젝트 폴더:

```sh
npm run template:csv -- --check
npm run template:audit
npm run template:package
```

출력: release/online-landlord-os-free-template-v1-review.zip. 같은 이름이 있으면 명시적으로 `npm run template:package -- --replace-review`로 갱신한다. 패키지 생성은 업로드·배포하지 않는다. README는 ZIP의 online-landlord-os 폴더에 있다.

새 설치 확인은 해당 ZIP을 별도 검증 폴더에 풀어 node_modules·환경 파일 없이 npm ci부터 수행한다. 이 검증용 복사본은 별도 개발 프로젝트가 아니며 배포 후보의 설치 점검이다. 상세 실제 결과는 작업 보고서에 남긴다.

## 공개 직전 담당자 체크

- [x] 코드 MIT LICENSE / Copyright (c) 2026 kimdokrae 승인·반영.
- [x] 재배포 권한이 미확인된 레거시 배경·마스크를 ZIP에서 제외. 원본 프로젝트 파일은 보존.
- [ ] 해당 에셋을 다시 포함하려면 별도 권리 확인.
- [ ] Windows에서 Node.js 24 설치·실행·종료·CSV·3D 실기 검증.
- [x] 검토 ZIP의 허용 목록·민감 패턴·CRC·체크섬 검사. 공개 직전 최종본에서 다시 확인.
- [x] 에셋 없는 ZIP의 프로덕션 앱에서 온보딩·체험·개인 CSV·백업·3D 이동 6개 브라우저 시나리오 확인.
- [x] 포함된 스크린샷·CSV는 테스트용 가상 자료이며 개인 백업은 제외.
- [ ] 게시 위치·버전·사용자 지원 범위 확정.
- [ ] GitHub·외부 호스팅·Notion 게시에 대한 별도 사용자 승인.

외부 데이터 연결에는 별도의 인증된 서버·권한·읽기 전용 어댑터 개발이 필요하다. 패키지 의존성 버전 추가와 운영 DB 변경은 하지 않았다.

## 제외된 화면 처리

ZIP에는 레거시 배경·마스크가 없으므로 `/city?view=legacy`, `/city?preview=world-v2`, `/assets/studio-hq/office?preview=world-v2`는 누락 이미지 대신 제외 사유와 기존 코드 기반 3D 화면 링크를 표시한다. 기본 `/city`, `/city/3d-lab`, 3D 내부 입장과 CSS 기반 구형 실내는 보존된다. 원본 프로젝트에서는 에셋이 존재해 이전 경로가 그대로 동작한다.

## 브라우저 테스트 범위

에셋 없는 ZIP의 지원 흐름은 `npm run test:template -- --workers=1`로 확인한다. 원본 보존용 `test:e2e`에는 레거시 이미지 렌더링을 기대하는 테스트가 그대로 있으므로 ZIP에서 전체 통과했다고 주장하지 않는다. 해당 테스트를 삭제·skip하거나 미확인 에셋을 다시 포함해 통과시키지 않는다. 원본 프로젝트에서는 소유자가 보존한 에셋으로 회귀 테스트를 수행한다.

## 독립 검수 최종 후보

`npm run template:package -- --final-candidate`는 `release/online-landlord-os-free-template-v1-final-candidate.zip`을 생성합니다. 보고서는 `docs/free-template-final-release-audit.md`입니다. 실행 검수용 Windows 정적 검증과 Mac 실기 결과를 구분하며, 최종 후보 생성은 공개 게시가 아닙니다. 검수 스크린샷은 보고서에서 안내합니다.
