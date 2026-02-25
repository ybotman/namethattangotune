// src/app/games/gamehub/page.js
// Mobile-first responsive game hub

"use client";
import React, { useContext } from "react";
import Image from "next/image";
import { Box, Typography, Paper, useMediaQuery, Button, Avatar, IconButton } from "@mui/material";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";

// Game categories with games
const gameCategories = [
  {
    title: "Timed Quiz",
    description: "Race against the clock",
    games: [
      {
        name: "Orchestra",
        path: "/games/artist-quiz",
        icon: "icons/IconQuiz.webp",
        isActive: true,
      },
      {
        name: "Singer",
        path: "/games/singer-quiz",
        icon: "icons/IconSinger.webp",
        isActive: true,
      },
      {
        name: "Song Title",
        path: "/games/song-quiz",
        icon: "icons/IconLearnSongs.webp",
        isActive: true,
      },
      {
        name: "Year",
        path: "/games/year-learn",
        icon: "icons/IconLearnDecade.webp",
        isActive: true,
      },
    ],
  },
  {
    title: "Clip Quiz",
    description: "No timer - replay clips",
    games: [
      {
        name: "Orchestra",
        path: "/games/clip-orchestra",
        icon: "icons/IconQuiz.webp",
        isActive: true,
      },
      {
        name: "Singer",
        path: "/games/clip-singer",
        icon: "icons/IconSinger.webp",
        isActive: true,
      },
    ],
  },
  {
    title: "Learn Mode",
    description: "Practice without pressure",
    games: [
      {
        name: "Orchestra",
        path: "/games/artist-learn",
        icon: "icons/IconLearnOrch.webp",
        isActive: true,
      },
      {
        name: "Year",
        path: "/games/year-learn",
        icon: "icons/IconLearnDecade.webp",
        isActive: false,
      },
      {
        name: "Style",
        path: "/games/style-learn",
        icon: "icons/IconLearnStyles.webp",
        isActive: false,
      },
      {
        name: "Singer",
        path: "/games/singer-learn",
        icon: "icons/IconLearnSinger.webp",
        isActive: true,
      },
    ],
  },
  {
    title: "Listen Mode",
    description: "Just listen - no scoring",
    games: [
      {
        name: "Listen",
        path: "/games/listen",
        icon: "icons/IconLearnOrch.webp",
        isActive: true,
      },
    ],
  },
  {
    title: "Compare",
    description: "Compare different recordings",
    games: [
      {
        name: "Same Song",
        path: "/games/same-song",
        icon: "icons/IconLearnSongs.webp",
        isActive: true,
      },
    ],
  },
  {
    title: "Tools",
    description: "Development & validation",
    games: [
      {
        name: "Recognition Validator",
        path: "/games/recognition-validator",
        icon: null, // No image - button only
        isActive: true,
        isButton: true,
      },
    ],
  },
];

function GameCard({ game, isMobile }) {
  const disabled = !game.isActive;
  const iconSize = isMobile ? 60 : 80;

  // Button-only style (no image)
  if (game.isButton) {
    return (
      <Link href={disabled ? "#" : game.path} style={{ textDecoration: "none" }}>
        <Button
          variant="outlined"
          disabled={disabled}
          sx={{
            borderColor: "var(--accent)",
            color: "var(--accent)",
            textTransform: "none",
            px: 3,
            py: 1.5,
            "&:hover": {
              backgroundColor: "var(--accent)",
              color: "var(--background)",
            },
          }}
        >
          {game.name}
        </Button>
      </Link>
    );
  }

  return (
    <Link href={disabled ? "#" : game.path} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: isMobile ? 1.5 : 2,
          borderRadius: 2,
          backgroundColor: disabled ? "transparent" : "var(--input-bg)",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
          transition: "all 0.2s ease",
          minWidth: isMobile ? 80 : 100,
          "&:hover": disabled
            ? {}
            : {
                transform: "scale(1.05)",
                backgroundColor: "var(--accent)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              },
          "&:active": disabled
            ? {}
            : {
                transform: "scale(0.98)",
              },
        }}
      >
        <Box
          sx={{
            width: iconSize,
            height: iconSize,
            position: "relative",
            mb: 1,
          }}
        >
          <Image
            src={`/${game.icon}`}
            alt={`${game.name} Icon`}
            fill
            sizes={`${iconSize}px`}
            style={{
              objectFit: "cover",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          />
        </Box>
        <Typography
          variant={isMobile ? "body2" : "body1"}
          textAlign="center"
          sx={{
            color: disabled ? "gray" : "var(--foreground)",
            fontWeight: 500,
          }}
        >
          {game.name}
        </Typography>
        {disabled && (
          <Typography
            variant="caption"
            sx={{ color: "gray", fontSize: "0.65rem" }}
          >
            Coming Soon
          </Typography>
        )}
      </Box>
    </Link>
  );
}

function CategorySection({ category, isMobile }) {
  const activeGames = category.games.filter((g) => g.isActive);
  const inactiveGames = category.games.filter((g) => !g.isActive);

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 2 : 3,
        mb: 2,
        backgroundColor: "var(--background)",
        border: "1px solid var(--border-color)",
        borderRadius: 3,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            fontWeight: "bold",
            color: "var(--accent)",
            mb: 0.5,
          }}
        >
          {category.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "var(--foreground)", opacity: 0.7 }}
        >
          {category.description}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: isMobile ? 1 : 2,
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        {activeGames.map((game, idx) => (
          <GameCard key={idx} game={game} isMobile={isMobile} />
        ))}
        {inactiveGames.map((game, idx) => (
          <GameCard key={`inactive-${idx}`} game={game} isMobile={isMobile} />
        ))}
      </Box>
    </Paper>
  );
}

// Beta Banner Component
function BetaBanner({ isMobile }) {
  const [dismissed, setDismissed] = React.useState(false);

  // Check if already dismissed this session
  React.useEffect(() => {
    const wasDismissed = sessionStorage.getItem("nttt-beta-dismissed");
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("nttt-beta-dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Box
      sx={{
        backgroundColor: "rgba(102, 170, 255, 0.15)",
        border: "1px solid var(--accent)",
        borderRadius: 2,
        p: 2,
        mb: 2,
        position: "relative",
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "var(--foreground)", fontWeight: 500 }}
      >
        Welcome to NTTT 2.0 Beta!
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "var(--foreground)", opacity: 0.8, display: "block", mt: 0.5 }}
      >
        This version is under active development. Coming soon: login scoring,
        score sharing, saved configurations, progressive lessons, and more. Stay tuned!
      </Typography>
      <Button
        size="small"
        onClick={handleDismiss}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          minWidth: "auto",
          p: 0.5,
          color: "var(--foreground)",
          opacity: 0.6,
          "&:hover": { opacity: 1 },
        }}
      >
        X
      </Button>
    </Box>
  );
}

export default function GameHubPage() {
  const { user, loading, logOut } = useContext(AuthContext);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  const handleLogout = async () => {
    await logOut();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        p: isMobile ? 2 : 4,
        transition: "all 0.3s ease",
      }}
    >
      {/* Beta Banner */}
      <BetaBanner isMobile={isMobile} />
      {/* Header with Auth */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: isMobile ? 2 : 3,
          pt: isMobile ? 1 : 2,
        }}
      >
        {/* Title */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: "bold",
              color: "var(--foreground)",
              mb: 0.5,
            }}
          >
            Name That Tango Tune
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--foreground)", opacity: 0.8 }}
          >
            Test your tango knowledge
          </Typography>
        </Box>

        {/* Auth Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user ? (
            <>
              <Avatar
                src={user.photoURL}
                alt={user.displayName || "User"}
                sx={{ width: 36, height: 36 }}
              >
                {user.displayName?.[0] || user.email?.[0] || "U"}
              </Avatar>
              {!isMobile && (
                <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
                  {user.displayName || user.email?.split("@")[0]}
                </Typography>
              )}
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{ color: "var(--foreground)" }}
                title="Sign Out"
              >
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<LoginIcon />}
              onClick={() => router.push("/auth/login")}
              sx={{
                borderColor: "var(--accent)",
                color: "var(--accent)",
                textTransform: "none",
              }}
            >
              {isMobile ? "Login" : "Sign In"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Game Categories */}
      <Box
        sx={{
          maxWidth: isTablet ? "100%" : 900,
          margin: "0 auto",
        }}
      >
        {gameCategories.map((category, idx) => (
          <CategorySection key={idx} category={category} isMobile={isMobile} />
        ))}
      </Box>

      {/* Footer with theme info */}
      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          pt: 2,
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "var(--foreground)", opacity: 0.5 }}
        >
          NTTT v2.0.1
        </Typography>
      </Box>
    </Box>
  );
}
