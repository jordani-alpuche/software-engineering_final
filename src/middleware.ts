import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// List of protected routes
const protectedRoutes = [
  // "/form",
  "/dashboard",
  "/users/listusers",
  "/users/createuser",
  "/users/updateuser",
  "/visitors/listvisitors",
  "/visitors/newvisitor",
];

export default async function middleware(request: NextRequest) {
  // Get the token (session) for the current request
  const token = await getToken({ req: request });

  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If token is missing, redirect to sign-in page
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  // Ensure token has an expiration time and it's a number
  if (
    token &&
    typeof token.exp === "number" &&
    token.exp < Math.floor(Date.now() / 1000)
  ) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  return NextResponse.next();
}

// Configure matcher to protect all routes except /api/auth
export const config = {
  matcher: ["/((?!api/auth).*)"], // Protect everything except /api/auth
};
