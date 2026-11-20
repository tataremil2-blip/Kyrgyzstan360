import { redirect } from "next/navigation";
import { authClient, safeAdminPath } from "@/lib/admin/auth";
import PasswordForm from "../PasswordForm";
export default async function Complete({ searchParams }: PageProps<"/admin/auth/complete">) {
  const params = await searchParams;
  const next = safeAdminPath(typeof params.next === "string" ? params.next : null);
  const supabase = await authClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/admin/login?authError=expired");
  return <section className="crm-login"><h1>Set your password</h1>
    {params.error && <p role="alert">Password must be at least 12 characters and both fields must match.</p>}
    <PasswordForm next={next} /></section>;
}
