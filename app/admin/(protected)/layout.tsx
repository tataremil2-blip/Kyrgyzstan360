import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { logout } from "../actions";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return <>
    <header className="crm-header"><Link href="/admin">Kyrgyzstan360 CRM</Link>
      <form action={logout}><span>{staff.display_name}</span><button>Sign out</button></form>
    </header>
    {children}
  </>;
}
