// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const handler = NextAuth(authOptions); // Initialize NextAuth with the auth options
export { handler as GET, handler as POST }; // Export the handler for both GET and POST requests
