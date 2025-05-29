
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "../components/ClientWrapper";
import { Toaster } from "react-hot-toast";
import { Providers } from './providers';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SweetSpot Admin",
  description: "Admin dashboard for SweetSpot application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen`}
      >
        <ClientWrapper>
          <Providers>
            {children}
          </Providers>
        </ClientWrapper>
        <Toaster position="top-right"/>
      </body>
    </html>
  );
}