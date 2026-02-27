//------------------------------------------------------------
// src/app/page.js
// Root redirect to GameHub (Welcome is now part of swipe menu)
//------------------------------------------------------------
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/games/gamehub");
  }, [router]);

  // Brief loading state while redirecting
  return null;
}
