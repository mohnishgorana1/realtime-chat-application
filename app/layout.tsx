import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@/context/UserContext";
// import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RealtimeChatApplication",
  description: "",
  // icons:{
  //   icon: ""
  // }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-background text-foreground max-w-6xl mx-auto px-2 md:px-0">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <UserProvider>{children}</UserProvider>
        </body>
      </html>
      {/* <Toaster /> */}
    </ClerkProvider>
  );
}
