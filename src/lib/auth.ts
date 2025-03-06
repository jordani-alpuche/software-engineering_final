// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaClient } from "@prisma/client";
// import { compare } from "bcrypt";

// const prisma = new PrismaClient();

// export const authOptions: NextAuthOptions = {
//   session: {
//     strategy: "jwt", // Using JWT for session management
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Sign in",
//       credentials: {
//         username: { label: "Username", type: "text", placeholder: "Username" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(credentials) {
//         // console.log("credentials", credentials);
//         // Check if username and password are provided
//         if (!credentials?.username || !credentials.password) {
//           throw new Error("Missing username or password");
//         }

//         // Find the user in the database
//         const user = await prisma.users.findUnique({
//           where: { username: credentials?.username, status: "active" },
//         });

//         console.log("User found:", user);

//         if (!user) {
//           throw new Error("User not found or account is deactivated");
//         }

//         // Validate the password
//         const isPasswordValid = await compare(
//           credentials.password,
//           user.password
//         );
//         if (!isPasswordValid) {
//           throw new Error("Invalid credentials");
//         }

//         // Return the user details on successful login
//         return {
//           id: user.id.toString(),
//           username: user.username,
//           role: user.role, // Default role if not set
//         };
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/login", // Redirect users to /login instead of /api/auth/signin
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = Number(user.id);
//         token.role = user.role;
//         token.username = user.username;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       return {
//         ...session,
//         user: {
//           ...session.user,
//           id: token.id as number,
//           username: token.username as string,
//           role: token.role as string,
//         },
//       };
//     },
//   },
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET,
//     maxAge: 60 * 60, // Set JWT expiration to 1 hour
//   },
//   secret: process.env.JWT_SECRET || "your_secret_key", // Optional, specify a JWT secret
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken"; // Import jwt for signing tokens

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

        // Find active user in DB
        const user = await prisma.users.findUnique({
          where: { username: credentials.username },
        });

        if (!user || user.status !== "active") {
          throw new Error("User not found or account is deactivated");
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id.toString(),
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login", // Redirect users to /login instead of /api/auth/signin
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id) || 0;
        token.role = user.role;
        token.username = user.username;

        const secret = process.env.JWT_SECRET || "your_secret_key"; // Use environment variable for secret
        const accessToken = jwt.sign(
          { id: token.id, role: token.role, username: token.username },
          secret,
          { expiresIn: "1h" }
        );
        token.accessToken = accessToken;

        // console.log("JWT Callback - accessToken:", accessToken); // Log the generated access token
      }
      return token;
    },

    async session({ session, token }) {
      // console.log("Session Callback - token:", token); // Log the session token to check if accessToken is present

      return {
        ...session,
        user: {
          id: token.id as number,
          username: token.username as string,
          role: token.role as string,
        },
        accessToken: token.accessToken, // Include the access token in the session
      };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
