/**
 * MARKETING LAYOUT
 * -----------------
 * Clean layout for landing pages only.
 * No dashboard logic here.
 */

import Navbar from "@/components/marketing/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
