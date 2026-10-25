# Online Landlord OS · Free Template V1

사업을 건물로 관리하는 로컬 3D AI 오피스 템플릿입니다. 첫 화면에서 **데모 회사 체험하기 / 내 회사 만들기**를 선택합니다. 실제 AI 업무 실행과 외부 자동 연동은 없습니다.

> 독립 설치 검수를 거친 최종 배포 후보입니다. 프로젝트 코드는 MIT License이며, 재배포 권한이 미확인된 레거시 이미지·마스크는 ZIP에서 제외했습니다. 아직 GitHub·웹·Notion에 공개하지 않았습니다.

## 처음 시작하기

필수: **Node.js 24.x**(npm 포함), 인터넷(최초 패키지 다운로드), WebGL2 지원 브라우저. Docker·DB·AI API 키는 필요하지 않습니다. Node.js 25/26으로 대체하지 마세요.

1. [공식 Node.js 다운로드](https://nodejs.org/en/download)에서 **24 버전**을 설치합니다.
2. ZIP을 압축 해제합니다. `package.json`이 있는 폴더에서 터미널을 엽니다.
3. 다음을 한 줄씩 실행합니다.

Mac 터미널:

```sh
node --version
npm --version
npm ci
npm run dev:local
```

Windows PowerShell(실기 미검증):

```powershell
node --version
npm.cmd --version
npm.cmd ci
npm.cmd run dev:local
```

4. **http://127.0.0.1:3003** 을 엽니다.
5. 서버 종료는 실행한 터미널에서 **Control+C / Ctrl+C**. 다시 켤 때는 같은 폴더에서 `npm run dev:local`만 실행합니다. 서버 종료는 브라우저 자료를 지우지 않습니다.

간편 도우미: Mac `start-local.command`, Windows `start-local.cmd`. 최초에는 의존성을 설치하고 같은 로컬 서버를 실행합니다. Mac 실행 권한이 막히면 터미널 명령을 사용하세요. Windows 도우미와 실제 OS 동작은 미검증이며, 명령 구조는 OS 공통 Node 실행기로 작성했습니다.

완전 초보자용 전체 설명은 [Notion 설명서 원고](docs/notion-free-template-guide.md)를 참고하세요.

## 체험과 내 회사

- **체험**: 기존 30일 가상 원장·매출 그래프·직원 업무 시뮬레이션.
- **내 회사**: 회사 이름 → 기존 사업 건물 이름 → 직원 프로필 → 수익 자료 연결. 안정적인 고유 ID는 바꾸지 않습니다.
- 기존 저장값이 있으면 온보딩을 강제하지 않습니다. 하단 **처음 사용 안내**로 직접 다시 열 수 있습니다. 새 기본값으로 기존 설정을 덮어쓰지 않습니다.
- 설정 → **데이터 모드**: 체험 ON/OFF 전환. 개인 자료와 샘플은 합산하지 않습니다.
- 내 데이터에 자료가 없으면 **자료 없음 / 데이터 미연결**, 명시적으로 입력한 0은 **0원**입니다.
- 내 데이터에서는 실제 업무가 연결되지 않은 직원이 **업무 미연결**로 표시됩니다.

## CSV와 매일 갱신

설정 → **데이터 연결** → **연결 안내·CSV 양식**에서 설명·미리보기·샘플·빈 양식을 제공합니다.

- 샘플: [실제 DEMO 원장 CSV](public/templates/skycity-sample-finance.csv)
- 빈 양식: [개인 재무 CSV 양식](public/templates/my-finance-template.csv)
- 순서: 사업 등록·건물 매핑 → CSV 업로드·열 매핑 → 검증 미리보기 → 가져오기 확정 → 체험 OFF.
- 기본 컬럼: `date,businessId,metric,amount,currency`
- 지표: `grossSales` 총매출 / `refunds` 환불·취소 / `adEstimate` 광고 추정수익 / `cost` 운영비 / `paidOut` 실제 지급액.
- 일자·사업·지표·통화별 **합계 한 행**. 금액은 쉼표·음수 없이 입력합니다. 모르는 값은 행을 생략하고 실제 해당 없음은 0을 입력합니다.
- 수동 입력은 새 자료를 직접 추가해야 갱신됩니다. **CSV는 새 파일을 다시 가져와야 갱신**되며 원본 파일을 추적하지 않습니다.
- 자동 동기화는 **추가 개발 필요**입니다. n8n·DB·외부 API를 연결한 것처럼 작동하지 않습니다.
- 지급액을 매출·추정수익에 다시 더하지 않습니다. 필수 비용 등 자료가 없으면 순이익은 **산정 불가**입니다.

## 저장과 백업

자료는 같은 브라우저·프로필·주소(origin)의 localStorage에만 저장합니다. `localhost`와 `127.0.0.1`, 다른 포트·브라우저·기기는 각각 별도 저장소입니다. 늘 **127.0.0.1:3003**을 사용하세요.

설정 → 데이터 연결 → **개인 백업** → **개인 백업 다운로드**. 회사·건물·직원·재무·발굴실·KPI 표시·온보딩을 한 JSON으로 보관합니다. 복원 전 현재 백업을 먼저 받고 다른 탭을 닫으세요. 복원은 확인·검증 후 로컬 자료를 교체하고 새로고침합니다.

**개인 백업·원본 수익 CSV는 공개하거나 AI에 보내지 마세요.** 암호화·로그인·자동 백업·서버 동기화는 없습니다. 설정 JSON만 내보내면 재무·발굴 기록은 포함되지 않으므로 전체 보관에는 개인 백업을 사용하세요.

## 실행 환경과 검증 명령

| 명령 | 용도 | 주소 |
|---|---|---|
| `npm run dev:local` | 개인 로컬 템플릿 | 127.0.0.1:3003 |
| `npm run dev:public` | 가상 자료 전용 공개 체험 | 127.0.0.1:3001 |
| `npm run dev` | 보존된 이전 개발 모드 | 127.0.0.1:3000 |

공개 모드에서는 개인 모드 버튼이 비활성화되며 운영 API가 서버에서 차단됩니다. 브라우저 토글은 서버 권한을 바꾸지 못합니다. 지원 모드 모두 실제 운영 API는 미연결/차단 상태입니다. 환경 파일은 필요하지 않습니다. `.env.example`에는 비밀값이 없습니다.

```sh
npm run doctor
npm test
npm run typecheck
npm run build:local
npm run start:local
```

개발 서버를 Control+C로 종료한 뒤 같은 3003 포트에서 프로덕션 서버를 실행하세요. Windows에서는 `npm` 대신 `npm.cmd`를 사용할 수 있습니다.

개발자용 브라우저 검증: `npm run test:e2e`, `npm run test:public`, `npm run test:operations`, `npm run test:template`에 `-- --workers=1`을 붙입니다. Playwright 브라우저는 별도 설치가 필요합니다. 설치: `npx playwright install chromium --only-shell`. 브라우저를 프로젝트에 둘 때는 `PLAYWRIGHT_BROWSERS_PATH`를 `.playwright-browsers`로 지정합니다. OS별 명령은 전체 설명서에 있습니다.

배포 ZIP에서는 `npm run test:template -- --workers=1`로 지원하는 온보딩·데이터 흐름과 에셋 제외 안내를 확인할 수 있습니다. 기존 `test:e2e`에는 의도적으로 보존한 레거시 이미지 전용 테스트가 있어, 미확인 에셋을 제외한 ZIP에서 전체 성공을 기대하면 안 됩니다. 원본 프로젝트에서는 에셋이 존재할 때 기존 테스트를 실행합니다. 테스트를 삭제·skip하거나 권리 미확인 파일을 임의로 다시 넣어 통과시키지 마세요.

## 배포 검토·확장

- [AI 커스터마이징 안내](docs/ai-customization-guide.md)
- [패키지 포함·제외 및 공개 전 체크리스트](docs/free-template-package.md)
- [에셋·라이선스 검토](docs/asset-license-review.md)
- [잠금 의존성 라이선스 목록](docs/dependency-license-inventory.json)
- [설치된 의존성 고지](docs/third-party-notices.txt)

`npm run template:csv -- --check`는 원장과 제공 CSV의 동일성을 검사합니다. `npm run template:audit`는 로컬 잠금 파일·라이선스 고지를 정리합니다. `npm run template:package`는 허용 목록과 민감 패턴 검사를 통과한 **검토용 ZIP**을 `release/`에 생성합니다. 기존 ZIP 갱신은 `-- --replace-review`를 명시합니다. 이 명령은 공개 업로드를 하지 않습니다.

실제 검수 결과는 ZIP에 포함된 [최종 검수 보고서](docs/free-template-final-release-audit.md)에 기록했습니다. 파일명은 `online-landlord-os-free-template-v1-final-candidate.zip`입니다. 후보라는 이름은 GitHub·외부 게시 승인을 뜻하지 않습니다. Windows 실기와 최종 공개 승인 전까지 완전한 공개 배포 완료로 간주하지 않습니다. ZIP의 이전 2D·world-v2 이미지 경로는 제외 안내를 표시하며, 기존 소유자 프로젝트의 원본 이미지·기능은 보존합니다.

## 라이선스와 재사용

프로젝트 자체 코드는 [MIT License](LICENSE)입니다. **Copyright (c) 2026 kimdokrae**. 사용자는 코드를 사용·복사·수정·확장·재배포하고 상업적으로 이용할 수 있습니다. 코드의 복사본 또는 중요한 부분을 배포할 때 LICENSE의 저작권·허가 고지를 포함하세요. 무보증 조건 등 전체 내용은 LICENSE를 따릅니다.

이 허가는 외부 라이브러리·이미지·모델의 권리를 대신 부여하지 않습니다. 제3자 의존성에는 각자의 라이선스와 고지가 적용됩니다. 권리 미확인 배경 3개와 마스크는 ZIP에서 제외하며 원본 프로젝트에서만 보존합니다. 기본 3D 도시·건물·직원은 Geometry/Material 코드로 렌더링하며 제외된 이미지를 사용하지 않습니다.

MIT 원문 확인: [Open Source Initiative](https://opensource.org/license/mit).

## 최종 후보 ZIP 확인

1. `online-landlord-os-free-template-v1-final-candidate.zip`을 압축 해제합니다.
2. 안쪽 `online-landlord-os` 폴더에서 Node.js 24로 `npm ci` → `npm run dev:local`을 실행합니다.
3. http://127.0.0.1:3003 에 접속합니다. 별도 환경 파일 복사나 API 키 입력은 필요하지 않습니다.
4. 수익 자료는 브라우저에 보관되므로 같은 주소를 사용하고 개인 백업을 별도로 보관합니다.

원본에 있던 이미지 기반 이전 화면은 배포 대상에서 제외됐습니다. 대신 기본 `/city`의 실제 3D 도시·오피스를 이용하세요. 제외 안내 자체는 오류가 아닙니다. 이 후보를 다시 만들 때는 `npm run template:package -- --final-candidate`를 사용합니다.

최종 후보 지원 범위의 브라우저 회귀 검사는 `npm run test:final`입니다. 최초에는 Playwright Chromium 설치가 필요합니다. 보존된 이전 이미지 전용 테스트를 삭제하거나 skip하는 대신, 배포 지원 범위(3D·데이터·설정·공개 차단)의 기존 테스트를 함께 실행합니다. 개인 브라우저 프로필은 사용하지 않습니다.
