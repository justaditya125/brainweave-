import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ThemeInitializer from "@/components/ThemeInitializer";
import ToastContainer from "@/components/ToastContainer";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#3B82F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "NotionNotes — Your thoughts, organized.",
  description: "A minimalist, responsive workspace to compose, organize, and filter notes in real-time.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NotionNotes',
  },
  openGraph: {
    title: "NotionNotes — Your thoughts, organized.",
    description: "A minimalist, responsive workspace to compose, organize, and filter notes in real-time.",
    url: "https://notionnotes.com",
    siteName: "NotionNotes",
    images: [
      {
        url: "/site_banner.png",
        width: 1200,
        height: 630,
        alt: "NotionNotes Workspace Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NotionNotes — Your thoughts, organized.",
    description: "A minimalist, responsive workspace to compose, organize, and filter notes in real-time.",
    images: ["/site_banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegistration />
        <ThemeInitializer />
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
        <ToastContainer />
      </body>
    </html>
  );
}
