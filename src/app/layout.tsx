import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AlertBanner from "@/components/AlertBanner";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";

export const metadata: Metadata = {
  title: "National Works Agency | Government of Jamaica",
  description:
    "The National Works Agency (NWA) is responsible for the management, maintenance, and development of Jamaica's road network.",
  openGraph: {
    title: "National Works Agency | Government of Jamaica",
    description: "Building and maintaining Jamaica's road infrastructure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <AlertBanner />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <AccessibilityToolbar />
      </body>
    </html>
  );
}
