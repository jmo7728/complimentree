import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CanopyIQ — NYC Heat Resilience Planner",
  description: "Heat-resilience decision-support tool for NYC city planners",
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
