import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Vault - Secure Password Manager",
  description: "Manage your passwords, notes, and checklists securely with a beautiful, modern interface",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#272822",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vault",
  },
  openGraph: {
    title: "Vault - Secure Password Manager",
    description: "Manage your passwords, notes, and checklists securely with a beautiful, modern interface",
    type: "website",
    siteName: "Vault",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vault Password Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vault - Secure Password Manager",
    description: "Manage your passwords, notes, and checklists securely with a beautiful, modern interface",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.jpg", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.jpg", sizes: "192x192", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
