import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** La web pública solo es la landing. Panel, conductor y API no se sirven. */
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/panel/:path*", "/conductor/:path*", "/api/:path*"],
};
