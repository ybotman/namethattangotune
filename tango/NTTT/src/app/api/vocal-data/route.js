import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Try multiple possible paths for vocal analysis
    const possiblePaths = [
      // Relative to NTTT-app
      path.join(process.cwd(), "..", "MusicImport", "vocal_detection", "vocalAnalysis.json"),
      // Relative to NTTT (if cwd is NTTT)
      path.join(process.cwd(), "MusicImport", "vocal_detection", "vocalAnalysis.json"),
      // Absolute fallback
      "/Users/tobybalsley/MyDocs/AppDev/NTTT/MusicImport/vocal_detection/vocalAnalysis.json",
    ];

    for (const vocalPath of possiblePaths) {
      if (fs.existsSync(vocalPath)) {
        console.log("Found vocal data at:", vocalPath);
        const data = JSON.parse(fs.readFileSync(vocalPath, "utf-8"));
        return NextResponse.json(data);
      }
    }

    console.log("No vocal data found. Tried:", possiblePaths);
    console.log("process.cwd():", process.cwd());
    return NextResponse.json({});
  } catch (error) {
    console.error("Error loading vocal data:", error);
    return NextResponse.json({});
  }
}
