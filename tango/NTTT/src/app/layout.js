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
import { ScoreProvider } from "@/contexts/ScoreContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { initErrorTracking } from "@/utils/analytics";
import ErrorBoundary from "@/components/ErrorBoundary";

import { CssBaseline } from "@mui/material";
import { Inter } from "next/font/google";

const GA_MEASUREMENT_ID = "G-GSRFSWE79N";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }) {
  // Init error tracking on first load
  useEffect(() => {
    initErrorTracking();
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
            <ScoreProvider>
              <ThemeProvider>
                <LayoutContent>{children}</LayoutContent>
              </ThemeProvider>
            </ScoreProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
