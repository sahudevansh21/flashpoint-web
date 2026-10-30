import Link from "next/link";

export default function NotFound() {
  return (
    <main className="universe-page min-h-screen mx-auto flex max-w-[720px] flex-col gap-4 px-6 py-24">
      <h1 className="m-0 font-display text-4xl font-bold">Not found</h1>
      <Link href="/feed" className="text-hot">Go to the live feed →</Link>
    </main>
  );
}
