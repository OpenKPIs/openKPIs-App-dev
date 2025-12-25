import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Script from "next/script";
import Footer from "@/components/Footer";
import "./globals.css";
import "./styles/tokens.css";
import "./styles/components.css";
import "./styles/layout.css";
import AuthProvider from "./providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

import { generateHomeMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateHomeMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-NPT9TNWC';
  const enableGtm = (process.env.NEXT_PUBLIC_ENABLE_GTM || '1') !== '0';

  return (
    <html lang="en" data-theme="light" style={{ colorScheme: 'light' }}>
      <head>
        {/* Force light mode once */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.style.colorScheme = 'light';
              })();
            `,
          }}
        />
        {/* Preconnect to Supabase */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="" />
          </>
        ) : null}
        {/* Google Tag Manager (toggleable) */}
        {enableGtm ? (
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        {enableGtm ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

