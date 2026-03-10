//------------------------------------------------------------
// src/components/LandingRedirect.js
// Client-side redirect for logged in / returning users
// Google crawlers see static SEO page (no JS execution)
// Real users get redirected based on auth/visit status
//------------------------------------------------------------
"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";

// Check if user has visited before (same logic as gamehub)
const getVisitCount = () => {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("nttt-visit-count") || "0", 10);
};

export default function LandingRedirect() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // Logged in user → go to gamehub (welcome page)
    if (user) {
      router.replace("/games/gamehub");
      return;
    }

    // Returning visitor (has visit count) → go to gamehub
    const visitCount = getVisitCount();
    if (visitCount > 0) {
      router.replace("/games/gamehub");
      return;
    }

    // New visitor → stay on SEO landing page
    // (Google crawlers also stay here since they don't execute JS)
  }, [user, loading, router]);

  // This component renders nothing - it just handles redirects
  return null;
}
