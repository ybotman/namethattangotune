import { NextResponse } from "next/server";

const AZURE_BASE = "https://nttt.blob.core.windows.net/v20";

// Cache for audio file sizes
const sizeCache = new Map();

async function getFileSize(url) {
  if (sizeCache.has(url)) {
    return sizeCache.get(url);
  }
  const headRes = await fetch(url, { method: "HEAD" });
  const size = parseInt(headRes.headers.get("content-length") || "0", 10);
  sizeCache.set(url, size);
  return size;
}

export async function GET(request, context) {
  const { songId } = await context.params;
  const url = `${AZURE_BASE}/${songId}.mp3`;
  const range = request.headers.get("range");

  try {
    const fileSize = await getFileSize(url);

    if (range) {
      // Parse range header: "bytes=start-end"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024, fileSize - 1); // Max 1MB chunk
      const chunkSize = end - start + 1;

      // Fetch the range from Azure
      const response = await fetch(url, {
        headers: { Range: `bytes=${start}-${end}` },
      });

      const audioData = await response.arrayBuffer();

      return new NextResponse(audioData, {
        status: 206,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Content-Length": chunkSize.toString(),
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // No range - return full file info but stream it
    const response = await fetch(url);
    const audioData = await response.arrayBuffer();

    return new NextResponse(audioData, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Audio proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch audio" }, { status: 500 });
  }
}

export async function HEAD(request, context) {
  const { songId } = await context.params;
  const url = `${AZURE_BASE}/${songId}.mp3`;

  try {
    const fileSize = await getFileSize(url);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
