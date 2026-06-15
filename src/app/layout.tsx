import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSA Coach — Master DSA by Understanding, Not Memorizing",
  description: "AI-powered DSA learning platform: deterministic pattern detection, 8 interactive visualizers, mock interviews, and interview-ready solutions in Java, Python & C++.",
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
