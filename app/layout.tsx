import type { Metadata } from "next";
import "./globals.css";
import BookTripButton from "./BookTripButton";
import TourInquiryModal from "./TourInquiryModal";

export const metadata: Metadata = {
  title: "Kyrgyzstan360 — Wild, your way",
  description: "Small-group and private adventures across Kyrgyzstan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}<BookTripButton /><TourInquiryModal /></body>
    </html>
  );
}
