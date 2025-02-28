// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
