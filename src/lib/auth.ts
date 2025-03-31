import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour session expiration
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          throw new Error("Missing username or password");
        }

        const user = await prisma.users.findUnique({
          where: { username: credentials.username },
        });

        if (!user || user.status !== "active") {
          throw new Error("User not found or account is deactivated");
        }

        // Check failed attempts in the last 30 minutes
        const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);
        const failedAttempts = await prisma.login_log.count({
          where: {
            user_id: user.id,
            status: "failed",
            login_time: { gte: THIRTY_MINUTES_AGO },
          },
        });

        if (failedAttempts >= 5) {
          throw new Error(
            "Too many failed login attempts. Try again in 30 minutes."
          );
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          await prisma.login_log.create({
            data: {
              user_id: user.id,
              status: "failed",
              login_time: new Date(),
            },
          });
          throw new Error("Invalid credentials");
        }

        // Log successful login and reset failed attempts
        await prisma.login_log.create({
          data: {
            user_id: user.id,
            status: "success",
            login_time: new Date(),
          },
        });

        return {
          id: user.id.toString(),
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          username: token.username,
          role: token.role,
        },
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
