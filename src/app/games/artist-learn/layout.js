// src/app/games/artist-learn/layout.js
"use client";

import React from "react";
import { GameProvider } from "@/contexts/GameContext";

export default function Layout({ children }) {
  return <GameProvider>{children}</GameProvider>;
}
