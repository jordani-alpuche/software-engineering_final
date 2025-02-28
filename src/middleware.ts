import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import getToken to fetch JWT token
import type { NextRequest } from "next/server";

// List of protected routes
const protectedRoutes = [
  "/form",
  "/dashboard",
  "/users/listusers",
  "/users/createuser",
  "/users/updateuser",
  "/visitors/listvisitors",
  "/visitors/newvisitor",
  // "/users/updateuser",
]; // Add your other protected routes here

export default async function middleware(request: NextRequest) {
  // Get the token (session) for the current request
  const token = await getToken({ req: request });

  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a protected route and no token exists, redirect to sign-in page
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  return NextResponse.next(); // Allow access to the route if authenticated
}

// Configure matcher to protect all routes except /api/auth
export const config = {
  matcher: ["/((?!api/auth).*)"], // Protect everything except /api/auth
};
