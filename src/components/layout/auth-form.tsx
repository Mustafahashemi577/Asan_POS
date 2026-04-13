import StatsPanel from "./stats-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex bg-bg-light text-white p-10 items-center justify-center">
        <StatsPanel />
      </div>
    </div>
  );
}
