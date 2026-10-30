"use client";

import { useEffect } from "react";

export function ScrollLiftObserver() {
  useEffect(() => {
    const updateHeaders = () => {
      const lifted = window.scrollY > 24;
      document.querySelectorAll<HTMLElement>(".site-header, .flashpoint-home-header").forEach((header) => {
        header.classList.toggle("is-lifted", lifted);
      });
    };

    updateHeaders();
    window.addEventListener("scroll", updateHeaders, { passive: true });
    return () => window.removeEventListener("scroll", updateHeaders);
  }, []);

  return null;
}
