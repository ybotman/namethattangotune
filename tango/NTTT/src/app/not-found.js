"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to game hub after 2 seconds
    const timer = setTimeout(() => {
      router.push("/games/gamehub");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "4rem", mb: 2 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Page not found
      </Typography>
      <Typography variant="body1" sx={{ opacity: 0.7 }}>
        Redirecting to Game Hub...
      </Typography>
    </Box>
  );
}
