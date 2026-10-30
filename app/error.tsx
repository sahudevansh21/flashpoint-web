'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center text-white">
      <h2 className="text-2xl font-bold mb-4 font-display">Something went wrong</h2>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-full bg-hot font-bold text-black hover:bg-hot/80 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
