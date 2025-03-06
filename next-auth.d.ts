import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: string;
    username: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
    expires: string;
    error: string;
    username: string;
    accessToken?: string; // Add accessToken to the Session interface
  }
}
