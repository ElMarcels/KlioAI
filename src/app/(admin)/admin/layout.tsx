import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminShell from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
