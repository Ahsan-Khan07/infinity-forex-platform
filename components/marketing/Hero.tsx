"use client";

/**
 * HERO SECTION
 * ------------
 * Conversion-focused SaaS hero.
 */

import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-5xl font-bold leading-tight">
        Smart Trading & Finance Platform
      </h1>

      <p className="mt-6 max-w-2xl text-gray-600">
        Automate trading, manage accounts, and scale your financial systems with
        enterprise-grade infrastructure.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/auth/register"
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          Get Started
        </Link>

        <Link
          href="/auth/login"
          className="rounded-lg border px-6 py-3"
        >
          Login
        </Link>
      </div>
    </section>
  );
}
