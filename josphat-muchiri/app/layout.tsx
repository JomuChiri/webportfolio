import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jomuchiri.github.io"),
  title: {
    default: site.title,
    template: "%s | Josphat Muchiri"
  },
  description: site.description,
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    images: [site.ogImage]
  },
  icons: {
    icon: "/images/favicon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
