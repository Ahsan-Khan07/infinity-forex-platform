export default function DashboardCard({
  title,
  value,
  subtitle,
  color = "blue",
}: {
  title: string;
  value: string;
  subtitle?: string;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-600 to-cyan-500",
    green: "from-green-600 to-emerald-500",
    red: "from-red-600 to-pink-500",
    yellow: "from-yellow-500 to-orange-500",
    purple: "from-purple-600 to-fuchsia-500",
  };

  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
      <p className="text-sm text-gray-400">{title}</p>

      <h2
        className={`text-3xl font-bold mt-2 bg-gradient-to-r ${
          colorMap[color] || colorMap.blue
        } bg-clip-text text-transparent`}
      >
        {value}
      </h2>

      {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}
