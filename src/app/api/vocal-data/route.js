import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Try multiple possible paths for vocal analysis
    const possiblePaths = [
      // Public folder (deployed on Vercel)
      path.join(process.cwd(), "public", "songData", "vocalAnalysis.json"),
      // Relative to NTTT-app (local dev)
      path.join(process.cwd(), "..", "MusicImport", "vocal_detection", "vocalAnalysis.json"),
      // Relative to NTTT (if cwd is NTTT)
      path.join(process.cwd(), "MusicImport", "vocal_detection", "vocalAnalysis.json"),
    ];

    for (const vocalPath of possiblePaths) {
      if (fs.existsSync(vocalPath)) {
        const data = JSON.parse(fs.readFileSync(vocalPath, "utf-8"));
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Error loading vocal data:", error);
    return NextResponse.json({});
  }
}
