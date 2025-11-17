import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ElimuNova AI - Intelligent Education Platform",
  description: "Transform education with AI-powered lesson plans, schemes of work, and personalized learning experiences.",
  keywords: ["education", "AI", "learning", "teaching", "lesson plans", "schemes of work"],
  authors: [{ name: "ElimuNova AI Team" }],
  themeColor: '#ffffff',
  colorScheme: 'light',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: "ElimuNova AI - Intelligent Education Platform",
    description: "Transform education with AI-powered lesson plans, schemes of work, and personalized learning experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
