import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy de Street View Static API.
 * El navegador no envía la key directamente a Google (evita problemas de
 * restricción de referrer). El servidor hace la petición y reenvía la imagen.
 *
 * GET /api/v1/streetview?lat=40.39&lng=-3.66&heading=270
 */
export async function GET(req: NextRequest) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key) {
    return new NextResponse("Street View key not configured", { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const heading = searchParams.get("heading") ?? "0";

  if (!lat || !lng) {
    return new NextResponse("lat and lng are required", { status: 400 });
  }

  const params = new URLSearchParams({
    size: "640x320",
    location: `${lat},${lng}`,
    fov: "80",
    pitch: "0",
    heading,
    key,
  });

  const upstream = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;

  try {
    const res = await fetch(upstream, { next: { revalidate: 86400 } }); // cache 24h
    if (!res.ok) {
      return new NextResponse("Street View upstream error", { status: res.status });
    }
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch Street View", { status: 502 });
  }
}
