import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZoomClone Workplace — Video Conferencing & Team Collaboration",
  description: "Functional ZoomClone Web Application with WebRTC video conferencing, scheduling, and instant meetings.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
