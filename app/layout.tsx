import type { Metadata } from "next";
import "./globals.css";
import BookTripButton from "./BookTripButton";
import BackButton from "./BackButton";

export const metadata: Metadata = {
  title: "Kyrgyzstan360 — Wild, your way",
  description: "Small-group and private adventures across Kyrgyzstan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <BackButton />
        <BookTripButton />
      </body>
    </html>
  );
}
