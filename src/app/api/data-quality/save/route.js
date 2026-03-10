import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const data = await request.json();

    // Update metadata
    data.metadata.lastModified = new Date().toISOString();
    data.metadata.reviewed = data.issues.filter((i) => i.status !== "not_reviewed").length;

    // Write to file
    const filePath = path.join(process.cwd(), "public", "songData", "dataQualityIssues.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, reviewed: data.metadata.reviewed });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
