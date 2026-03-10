import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const data = await request.json();

    // Write to file
    const filePath = path.join(process.cwd(), "public", "songData", "djSongsWeighted.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Count DNP songs
    const dnpCount = data.songs?.filter((s) => s.doNotPlay).length || 0;

    return NextResponse.json({ success: true, dnpCount });
  } catch (error) {
    console.error("Save songs error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
