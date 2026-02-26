//------------------------------------------------------------
// src/app/layout.js
//------------------------------------------------------------
"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";
import "./globals.css";
import PropTypes from "prop-types";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScoreProvider, useScoreContext } from "@/contexts/ScoreContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { trackVisitor } from "@/utils/tracking";

import { CssBaseline, Box } from "@mui/material";
import { Inter } from "next/font/google";

const GA_MEASUREMENT_ID = "G-GSRFSWE79N";

import GameScoreCurrent from "@/components/ui/GameScoreCurrent";
import GameHubButton from "@/components/ui/GameHubRoute";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }) {
  // Access scores from ScoreContext
  const { bestScore, totalScore, completedGames, resetAll } = useScoreContext();
  const hasTrackedVisitorRef = useRef(false);

  // Track visitor on first load (once per session)
  useEffect(() => {
    if (!hasTrackedVisitorRef.current) {
      hasTrackedVisitorRef.current = true;
      trackVisitor(window.location.pathname);
    }
  }, []);

  // Provide fallback in case they're undefined or null
  const safeBest = bestScore ?? 0;
  const safeTotal = totalScore ?? 0;
  const safeCompleted = completedGames ?? 0;

  return (
    <>
      {/* Top right icons: GameHub + Score */}
      <Box
        sx={{
          position: "fixed",
          top: "0.5rem",
          right: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
          zIndex: 1000,
        }}
      >
        <GameHubButton />
        <GameScoreCurrent
          bestScore={safeBest}
          totalScore={safeTotal}
          completedGames={safeCompleted}
          onReset={resetAll}
        />
      </Box>

      {children}
    </>
  );
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
        <AuthProvider>
          <ScoreProvider>
            <ThemeProvider>
              <LayoutContent>{children}</LayoutContent>
            </ThemeProvider>
          </ScoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
