import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Sidebar from "@/components/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo",
  description: "A simple space to organize your tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="flex min-h-screen bg-zinc-900 text-zinc-100">
          <Sidebar />
          <main className="min-w-0 flex-1 px-6 py-8 sm:px-10 lg:px-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
