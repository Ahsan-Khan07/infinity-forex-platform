import "./globals.css";

import SessionProvider from "@/components/providers/SessionProvider";
import Navbar from "@/components/landing/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import AIOrb from "@/components/cinematic/AIOrb";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative bg-black text-white">

        {/* 1. AUTH SESSION LAYER (GLOBAL STATE) */}
        <SessionProvider>

          {/* 2. GLOBAL NAVBAR */}
          <Navbar />

          {/* 3. PAGE CONTENT */}
          <main className="pt-20">{children}</main>

          {/* 4. GLOBAL AUTH MODAL SYSTEM */}
          <AuthModal />

          {/* 5. FLOATING AI ORB (UI OVERLAY SYSTEM) */}
          <AIOrb />

        </SessionProvider>

      </body>
    </html>
  );
}
