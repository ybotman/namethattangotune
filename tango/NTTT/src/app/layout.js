//------------------------------------------------------------
// src/app/layout.js
// v2.1.1 - Removed global GameHub/Fullscreen buttons
//          Navigation now handled per-page
//------------------------------------------------------------
"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import "./globals.css";
import PropTypes from "prop-types";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { ScoreProvider } from "@/contexts/ScoreContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { initErrorTracking } from "@/utils/analytics";
import { preloadSongData } from "@/utils/dataFetching";
import { registerServiceWorker } from "@/utils/registerSW";
import ErrorBoundary from "@/components/ErrorBoundary";

import { CssBaseline } from "@mui/material";
import { Inter } from "next/font/google";

const GA_MEASUREMENT_ID = "G-GSRFSWE79N";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }) {
  // Init error tracking, preload song data, register service worker
  useEffect(() => {
    initErrorTracking();
    preloadSongData(); // Cache song data early so games load instantly
    registerServiceWorker(); // Register PWA service worker
  }, []);

  return <>{children}</>;
}

LayoutContent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NTTT" />

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body>
        <CssBaseline />
        <ErrorBoundary>
          <AuthProvider>
            <UserProvider>
              <ScoreProvider>
                <ThemeProvider>
                  <LayoutContent>{children}</LayoutContent>
                </ThemeProvider>
              </ScoreProvider>
            </UserProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
