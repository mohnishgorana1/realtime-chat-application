import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeProvider";
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
  title: {
    default: "RealtimeChat | Fast & Secure Messaging",
    template: "%s | RealtimeChat",
  },
  description:
    "A modern real-time chat application built with Next.js, Pusher, and MongoDB.",
  keywords: ["chat app", "real-time messaging", "Next.js chat", "Pusher chat"],
  authors: [{ name: "Your Name/Brand" }],
  metadataBase: new URL("https://your-deployment-url.vercel.app"),
  openGraph: {
    title: "RealtimeChat Application",
    description: "Chat with your friends in real-time with zero latency.",
    url: "https://your-deployment-url.vercel.app",
    siteName: "RealtimeChat",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RealtimeChat Application",
    description: "Modern messaging experience.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className="bg-background text-foreground max-w-6xl mx-auto px-2 md:px-0"
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider>{children}</UserProvider>
          </ThemeProvider>
        </body>
      </html>
      {/* <Toaster /> */}
    </ClerkProvider>
  );
}
