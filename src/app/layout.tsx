import type { Metadata } from "next";
import localFont from "next/font/local";
import Sidebar from "@/components/sidebar";
import "./globals.css";

const sahel = localFont({
  src: "../fonts/Sahel-VF.woff2",
  variable: "--font-sahel",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "کارها",
  description: "فضایی ساده برای مدیریت کارهای شما.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${sahel.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("todo-sidebar-collapsed")==="true")document.documentElement.classList.add("sidebar-collapsed")}catch{}` }} />
      </head>
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
