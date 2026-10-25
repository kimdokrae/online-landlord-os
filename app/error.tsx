"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="empty-state"><h1>화면을 불러오지 못했습니다</h1><p>데모 정보를 다시 불러와 주세요.</p><button className="button" onClick={reset}>다시 시도</button></section>;
}
