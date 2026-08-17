import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import { DataProvider } from "@/lib/data/store";
import { PostHogInit } from "@/components/PostHogInit";
import { Grain } from "@/components/Grain";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "put me on",
  description: "Spotify knows what you listen to. Put Me On remembers who put you on.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-text-primary">
        <Grain />
        <PostHogInit />
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
