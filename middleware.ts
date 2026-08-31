import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/overview") ||
    request.nextUrl.pathname.startsWith("/explorer") ||
    request.nextUrl.pathname.startsWith("/flight-risk") ||
    request.nextUrl.pathname.startsWith("/equity") ||
    request.nextUrl.pathname.startsWith("/insights");

  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (user && request.nextUrl.pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};