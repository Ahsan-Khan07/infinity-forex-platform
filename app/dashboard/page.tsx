import { getServerSession } from "next-auth";
import { authConfig } from "@/modules/auth/core/auth.config";
import { redirect } from "next/navigation";
import DashboardCard from "@/components/dashboard/DashboardCard";

/**
 * FINTECH DASHBOARD HOME
 */

export default async function Dashboard() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user?.name}
        </h1>

        <p className="text-gray-400">
          Role: {(session.user as any)?.role}
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <DashboardCard
          title="Balance"
          value="$10,000"
          subtitle="Live trading wallet"
          color="blue"
        />

        <DashboardCard
          title="Profit"
          value="+12.4%"
          subtitle="Today performance"
          color="green"
        />

        <DashboardCard
          title="Active Trades"
          value="24"
          subtitle="Open positions"
          color="purple"
        />

      </div>

    </div>
  );
}
