"use client";

/**
 * FEATURES SECTION
 * ----------------
 * Simple modular feature grid.
 */

const features = [
  {
    title: "AI Trading Engine",
    desc: "Automated decision systems for smart execution.",
  },
  {
    title: "Risk Management",
    desc: "Advanced protection & capital safety layers.",
  },
  {
    title: "Real-time Analytics",
    desc: "Live dashboards with performance tracking.",
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-3xl font-bold text-center">Features</h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
