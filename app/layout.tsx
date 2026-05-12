import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";
import SessionWatcher from "@/components/SessionWatcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SessionWatcher />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
