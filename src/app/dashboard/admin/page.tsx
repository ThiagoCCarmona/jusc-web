import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminPanelClient } from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const usuario = await getCurrentUser();

  if (!usuario || usuario.perfil !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminPanelClient />;
}
