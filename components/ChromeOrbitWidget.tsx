"use client";

import { useEffect, useRef, useState } from "react";
import { AIChat8 } from "@/components/ai-chat-8";

export function ChromeOrbitWidget() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`chrome-orbit-widget${open ? " is-aligned" : ""}`}
        aria-label="Open AI voice composer"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="orbit-composer"
        title="Open AI voice composer"
        onClick={() => setOpen(true)}
      >
        <span className="chrome-orbit-aura" aria-hidden="true" />
        <svg className="chrome-orbit-rings" viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <linearGradient id="chromeOrbitMetal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff8f0" />
              <stop offset=".17" stopColor="#8a7770" />
              <stop offset=".32" stopColor="#fff" />
              <stop offset=".49" stopColor="#675953" />
              <stop offset=".68" stopColor="#f8e9df" />
              <stop offset=".84" stopColor="#8c7770" />
              <stop offset="1" stopColor="#fff" />
            </linearGradient>
            <linearGradient id="chromeOrbitGlow" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#ff6b35" />
              <stop offset=".48" stopColor="#ffd5b7" />
              <stop offset="1" stopColor="#9bc8ff" />
            </linearGradient>
          </defs>
          <g className="chrome-orbit-ring ring-one"><ellipse cx="60" cy="60" rx="23" ry="43" /></g>
          <g className="chrome-orbit-ring ring-two"><ellipse cx="60" cy="60" rx="33" ry="49" /></g>
          <g className="chrome-orbit-ring ring-three"><ellipse cx="60" cy="60" rx="43" ry="53" /></g>
          <g className="chrome-orbit-ring ring-four"><ellipse cx="60" cy="60" rx="52" ry="57" /></g>
          <circle className="chrome-orbit-nucleus" cx="60" cy="60" r="5" />
          <circle className="chrome-orbit-spark" cx="60" cy="9" r="2.2" />
        </svg>
        <span className="chrome-orbit-widget-label" aria-hidden="true">Voice</span>
      </button>

      <dialog
        id="orbit-composer"
        ref={dialogRef}
        className="orbit-composer-dialog"
        aria-labelledby="ai-chat-8-title"
        onClose={() => setOpen(false)}
      >
        <AIChat8 active={open} onClose={() => setOpen(false)} />
      </dialog>
    </>
  );
}
