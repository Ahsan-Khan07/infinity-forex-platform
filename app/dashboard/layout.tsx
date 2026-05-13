import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/modules/auth/core/auth.config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  // 🔒 BLOCK UNAUTHENTICATED ACCESS
  if (!session?.user) {
    redirect("/auth/login");
  }

  return <div className="p-6">{children}</div>;
}
