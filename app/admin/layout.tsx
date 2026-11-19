import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = { title: "Kyrgyzstan360 CRM", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="crm"><main>{children}</main></body></html>;
}
