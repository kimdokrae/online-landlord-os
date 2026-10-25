const major=Number(process.versions.node.split('.')[0]);
if(major!==24){console.error(`현재 Node.js ${process.versions.node}. 이 템플릿에는 Node.js 24가 필요합니다. https://nodejs.org/en/download 에서 24 버전을 설치한 뒤 터미널을 다시 여세요.`);process.exitCode=1;}
else console.log(`준비 완료: Node.js ${process.versions.node} · ${process.platform}/${process.arch}. 기본 주소 http://127.0.0.1:3003 · 실제 API 키는 필요하지 않습니다.`);
