import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Launchpad — ProofBridge",
  description: "Founder operating system for ProofBridge."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} bg-app font-[var(--font-sans)] text-[14px] leading-[1.5] text-primary`}>
        {children}
      </body>
    </html>
  );
}
