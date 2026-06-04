import { Sidebar } from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMockEnv = process.env.MOCK_ENV === "true";
  let session = null;

  if (!isMockEnv) {
    session = await auth();
    if (!session) {
      redirect("/login");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa] dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-scroll overflow-x-hidden custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
