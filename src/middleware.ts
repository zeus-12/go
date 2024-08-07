import { type ResponseData } from "@/pages/api/get-url";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.split("/").pop();
  if (!slug) {
    return;
  }

  const slugFetch = await fetch(
    `${req.nextUrl.origin}/api/get-url?slug=${slug}`,
  );
  if (slugFetch.status === 404) {
    return NextResponse.redirect(req.nextUrl.origin);
  }

  const data = (await slugFetch.json()) as ResponseData;

  if (data?.error) {
    return NextResponse.redirect(req.nextUrl.origin);
  }

  return NextResponse.redirect(data.url);
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/ (proxies for third-party services)
     * 4. /_static (inside /public)
     * 5. /_vercel (Vercel internals)
     * 6. Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
     */
    "/((?!api/|_next/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
