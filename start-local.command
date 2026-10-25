#!/bin/zsh
cd -- "${0:A:h}" || exit 1
if ! command -v node >/dev/null 2>&1; then
  print 'Node.js 24를 먼저 설치한 뒤 터미널을 다시 여세요: https://nodejs.org/en/download'
  read '?Enter 키로 종료'; exit 1
fi
node scripts/check-runtime.mjs || { read '?Enter 키로 종료'; exit 1; }
if [[ ! -f node_modules/next/package.json ]]; then
  npm ci || { read '?설치 실패. 위 오류를 확인하고 Enter 키로 종료'; exit 1; }
fi
print '브라우저에서 http://127.0.0.1:3003 을 여세요. 종료는 Control+C입니다.'
npm run dev:local
read '?Enter 키로 창 닫기'
