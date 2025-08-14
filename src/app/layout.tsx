import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOX Rental Cars",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Malek Chahbani X" }],
  icons: {
    icon: "https://img.freepik.com/premium-vector/free-vector-geotag-address-location-spotter-tag-favicon-icon-logo-symbol_1000823-235651.jpg", 
  },
  openGraph: {
    title: "MOX Rental Cars",
    description: "AI-powered development with modern React stack",
    url: "https://moxrentalcars.com",
    siteName: "MOX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOX Rental Cars",
    description: "AI-powered development with modern React stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
  suppressHydrationWarning
  className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
>
  {children}
  <Toaster />
</body>

      {/* <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body> */}
    </html>
  );
}
