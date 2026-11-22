import type { Metadata } from "next";
import "./account.css";

export const metadata: Metadata = { title: "My trips | Kyrgyzstan360", robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="traveler-account">{children}</body></html>;
}
