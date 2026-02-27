"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Box, Typography, Button, Paper, useMediaQuery } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { trackStartPlaying } from "@/utils/analytics";

export default function WelcomePage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: isMobile ? 2 : 4,
      }}
    >
      {/* Banner Image */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          mb: 3,
          position: "relative",
          height: isMobile ? 80 : 100,
        }}
      >
        <Image
          src="/NTTTBanner3.png"
          alt="Name That Tango Tune"
          fill
          sizes="100vw"
          style={{ objectFit: "contain" }}
          priority
        />
      </Box>

      {/* New in 2.0 Block */}
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 2 : 3,
          mb: 3,
          backgroundColor: "var(--background)",
          border: "1px solid var(--border-color)",
          borderRadius: 3,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: "var(--accent)", fontWeight: 600, mb: 1 }}
        >
          NEW IN 2.0
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "var(--foreground)", opacity: 0.8, lineHeight: 1.6 }}
        >
          Multiple quiz modes, 4,600+ songs, orchestra &amp; singer recognition,
          year guessing, and more!
        </Typography>
      </Paper>

      {/* Beta Notice */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 4,
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(255, 193, 7, 0.8)",
            color: "#000",
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: "bold",
          }}
        >
          BETA
        </Box>
        <Typography variant="body2" sx={{ color: "var(--foreground)", opacity: 0.6 }}>
          Under active development
        </Typography>
      </Box>

      {/* Start Button */}
      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrowIcon />}
        onClick={() => { trackStartPlaying(); router.push("/games/gamehub"); }}
        sx={{
          backgroundColor: "var(--accent)",
          color: "var(--background)",
          fontWeight: 600,
          py: 1.5,
          px: 4,
          fontSize: "1.1rem",
          borderRadius: 2,
          textTransform: "none",
          mb: 4,
          "&:hover": {
            backgroundColor: "var(--foreground)",
            transform: "translateY(-2px)",
          },
        }}
      >
        Start Playing
      </Button>

      {/* How to Play Block */}
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 2 : 3,
          backgroundColor: "var(--background)",
          border: "1px solid var(--border-color)",
          borderRadius: 3,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "var(--accent)", fontWeight: 600, mb: 2, letterSpacing: 1 }}
        >
          HOW TO PLAY
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {[
            { step: "1", text: "Hit Start to open the Game Hub" },
            { step: "2", text: "Pick a quiz mode (Orchestra, Singer, Year...)" },
            { step: "3", text: "Listen to clips and test your ear!" },
          ].map((item) => (
            <Box
              key={item.step}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {item.step}
              </Box>
              <Typography variant="body2" sx={{ color: "var(--foreground)", opacity: 0.8 }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{
          mt: 4,
          color: "var(--foreground)",
          opacity: 0.4,
          letterSpacing: 2,
        }}
      >
        NTTT v2.0.7 BETA
      </Typography>
    </Box>
  );
}
