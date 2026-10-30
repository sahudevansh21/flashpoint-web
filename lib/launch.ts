/** Enable only after the worker is switched from demo adapters to the verified live feeds. */
export const LIVE_DATA_READY = process.env.NEXT_PUBLIC_LIVE_DATA_READY === "true";

/** Enable only after real basket outcomes are graded, reconciled, and ready for publication. */
export const PUBLIC_RECORD_READY = process.env.NEXT_PUBLIC_PUBLIC_RECORD_READY === "true";
