"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useImmersive() {
  const root = useRef<HTMLDivElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const exitButton = useRef<HTMLButtonElement>(null);
  const [immersive, setImmersive] = useState(false);
  const active = useRef(false); const native = useRef(false);
  const exit = useCallback(() => {
    active.current = false; setImmersive(false);
    if (document.fullscreenElement === root.current) void document.exitFullscreen().catch(() => {});
  }, []);
  function enter() {
    active.current = true; setImmersive(true);
    const element = root.current;
    // A fixed viewport remains active if native fullscreen is unavailable or denied.
    try {
      void element?.requestFullscreen?.().then(() => {
        native.current = document.fullscreenElement === element;
        if (!active.current && native.current) void document.exitFullscreen().catch(() => {});
      }).catch(() => {});
    } catch { /* The fixed-position fallback already covers the viewport. */ }
  }
  useEffect(() => {
    if (!immersive) return;
    const element = root.current; if (!element) return;
    const scroll = { x: window.scrollX, y: window.scrollY };
    const overflow = document.body.style.overflow;
    const inert: { element: HTMLElement; previous: boolean }[] = [];
    let branch: HTMLElement = element;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) { inert.push({ element: sibling, previous: sibling.inert }); sibling.inert = true; }
      }
      branch = branch.parentElement; if (branch === document.body) break;
    }
    document.body.style.overflow = "hidden"; exitButton.current?.focus({ preventScroll: true });
    const fullscreenChange = () => { if (document.fullscreenElement === element) native.current = true; else if (native.current) exit(); };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); exit(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...element.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], summary, [tabindex="0"]')].filter(item => {
        // Closed details can still expose layout rectangles, but their controls cannot receive focus.
        const closed=item.closest('details:not([open])');
        return item.getClientRects().length && !item.closest("[inert]") && (!closed || closed.querySelector(':scope > summary')===item);
      });
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("fullscreenchange", fullscreenChange); document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChange); document.removeEventListener("keydown", keydown);
      for (const saved of inert) saved.element.inert = saved.previous;
      document.body.style.overflow = overflow; window.scrollTo(scroll.x, scroll.y);
      enterButton.current?.focus({ preventScroll: true }); active.current = false; native.current = false;
      if (document.fullscreenElement === element) void document.exitFullscreen().catch(() => {});
    };
  }, [immersive, exit]);
  return { root, enterButton, exitButton, immersive, enter, exit };
}
