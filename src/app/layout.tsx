import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ParticleField } from "@/components/effects/particles";
import { NotificationStack } from "@/components/layout/notifications";
import { LevelUpModal } from "@/components/layout/level-up-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monarch System | Hunter Interface",
  description:
    "Solo Leveling-inspired hunter management system — quests, dungeons, shadows, and ranks.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="system-bg" />
        <ParticleField />
        <QueryProvider>
          {children}
          <NotificationStack />
          <LevelUpModal />
        </QueryProvider>
      </body>
    </html>
  );
}
