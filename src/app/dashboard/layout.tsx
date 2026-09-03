import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ShellDashboard } from "@/components/shell-dashboard";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const sesion = await auth();
  if (!sesion?.user) redirect("/login");

  return (
    <ShellDashboard rol={sesion.user.rol} usuario={sesion.user.name ?? "Usuario"}>
      {children}
    </ShellDashboard>
  );
}
