import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSA Trainer",
  description: "AI-powered platform for learning Data Structures & Algorithms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
