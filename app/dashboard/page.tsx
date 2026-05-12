import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // 🔥 FIX: protect route
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Welcome back, {session.user?.name}
        </h1>

        <p className="text-gray-400">
          Role: {(session.user as any)?.role}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold">Balance</h2>
          <p className="text-2xl mt-2">$10,000</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold">Profit</h2>
          <p className="text-2xl mt-2 text-green-400">+12.4%</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold">Trades</h2>
          <p className="text-2xl mt-2">24 Active</p>
        </div>
      </div>
    </div>
  );
}
