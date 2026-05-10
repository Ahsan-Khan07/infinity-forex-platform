import ThreeHero from "@/components/ThreeHero";
import HeroContent from "@/components/HeroContent";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* BACKGROUND GLOW LAYERS */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-200px] right-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT SIDE (CLIENT COMPONENT) */}
          <HeroContent />

          {/* RIGHT SIDE - 3D HERO */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <ThreeHero />
          </div>

        </div>
      </div>
    </main>
  );
}
