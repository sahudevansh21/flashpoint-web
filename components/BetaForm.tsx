"use client";
import { useState } from "react";

export function BetaForm() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setMessage("Beta signup is not connected yet. Your contact details were not saved.");
      }}
      className="flex flex-[1_1_380px] flex-wrap gap-2.5"
    >
      <label htmlFor="beta-email" className="sr-only">Email or Telegram handle</label>
      <input id="beta-email" required placeholder="you@email.com or @telegram"
        className="min-h-13 flex-[1_1_220px] rounded-xl border border-hot-ink bg-[#fff4ea] px-4 text-hot-ink placeholder:text-[#6b4a33]" />
      <button type="submit" className="min-h-13 rounded-xl bg-ink px-5.5 font-semibold text-text">
        Join the beta
      </button>
      {message && <p className="fp-beta-feedback" role="status">{message}</p>}
    </form>
  );
}
