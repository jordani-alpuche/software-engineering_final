import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Map of routes to allowed roles
const roleProtectedRoutes: Record<string, string[]> = {
  "/dashboard": ["admin", "resident", "security"],
  "/feedback/listfeedback": ["admin", "resident", "security"],
  
  "/visitors/vistorlog": ["admin", "resident", "security"],
  // Admin Management
  "/users/listusers": ["admin"],
  "/users/createuser": ["admin"],
  "/users/updateuser": ["admin"],
  "/blacklist/selectvisitor": ["admin"],
  "/blacklist/blacklistvisitor": ["admin"],
  "/feedback/viewvisitorfeedback": ["admin"], 

  //Resident Managment
  "/visitors/newIndividualVisitor": ["admin","resident"],
  "/visitors/newGroupVisitor": ["admin","resident"],
  "/visitors/listvisitors": ["admin", "security", "resident"],
  "/visitors/updatevisitor": ["admin", "resident"],
  "/visitors/viewvisitor": ["admin", "resident", "security"],
  
  // Security Management
  "/scan": ["admin", "security"],
  "/blacklist/listblacklistvisitors": ["admin", "security"],

};

// Redirect helper
function unauthorized(request: NextRequest) {
  return new URL("/errors/unauthorized", request.url);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const matchedRoute = Object.keys(roleProtectedRoutes).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    return NextResponse.next(); // Not a protected route
  }

  const token = await getToken({ req: request });

  if (!token || (typeof token.exp === "number" && token.exp < Date.now() / 1000)) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  const allowedRoles = roleProtectedRoutes[matchedRoute];
  const userRole = token.role;

  if (!allowedRoles.includes(userRole)) {
    return NextResponse.redirect(unauthorized(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth).*)"],
};
