"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import TrustStrip from "@/components/landing/TrustStrip";
import CTA from "@/components/landing/CTA";
import USDField from "@/components/cinematic/USDField";

export default function HomePage() {
  return (
    <main className="relative bg-[#05060a] text-white overflow-hidden">

      {/* CINEMATIC BACKGROUND */}
      <USDField />

      {/* UI LAYERS */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <TrustStrip />
        <Features />
        <CTA />
      </div>

    </main>
  );
}
