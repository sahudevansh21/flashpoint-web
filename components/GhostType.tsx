"use client";

import { useEffect, useState } from "react";

const COMPLETIONS = [
  " becomes an ETF trade in 60 seconds.",
  " becomes a basket before Wall Street opens.",
  " gets a public grade at 9:45 ET.",
];

export function GhostType() {
  const [completion, setCompletion] = useState(COMPLETIONS[0]);
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    const typeCompletion = (index: number) => {
      const phrase = COMPLETIONS[index];
      let position = 0;
      setCompletion("");
      setAccepted(false);

      timeout = setTimeout(() => {
        interval = setInterval(() => {
          position += 1;
          setCompletion(phrase.slice(0, position));

          if (position >= phrase.length) {
            clearInterval(interval);
            timeout = setTimeout(() => {
              setAccepted(true);
              timeout = setTimeout(() => {
                typeCompletion((index + 1) % COMPLETIONS.length);
              }, 2600);
            }, 800);
          }
        }, 42);
      }, 560);
    };

    timeout = setTimeout(() => {
      typeCompletion(1);
    }, 2800);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <h1 id="home-title" aria-label="Every headline becomes an ETF trade in 60 seconds.">
      <span aria-hidden="true">Every headline</span>
      <span
        aria-hidden="true"
        className={`ghost-type-completion${accepted ? " is-accepted" : ""}`}
      >
        {completion}
        {!accepted && <span className="ghost-type-caret" />}
      </span>
    </h1>
  );
}
