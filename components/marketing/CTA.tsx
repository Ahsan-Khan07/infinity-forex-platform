/**
 * CALL TO ACTION SECTION
 * ----------------------
 * Final conversion push.
 */

import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-black py-20 text-center text-white">
      <h2 className="text-3xl font-bold">Start Trading Smarter Today</h2>

      <p className="mt-4 text-gray-300">
        Join the next-generation financial platform.
      </p>

      <Link
        href="/auth/register"
        className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-black"
      >
        Create Account
      </Link>
    </section>
  );
}
