import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string; // Ensure this matches the actual type if it can be null
    role: string;
    username: string;
  }

  interface Session {
    // Make user optional here to align with default types and optional chaining usage
    user?: User & DefaultSession["user"];
    expires: string;
    error?: string; // Make optional if it's not always present
    username?: string; // Make optional if it's not always present on the session root
    accessToken?: string;
  }
}

// import { DefaultSession, DefaultUser } from "next-auth";

// declare module "next-auth" {
//   /**
//    * Extends the built-in User type. (Optional but good practice)
//    * This reflects the object returned by your `authorize` callback.
//    */
//   interface User extends DefaultUser {
//     id: string;
//     username: string;
//     role: string;
//     // NOTE: email is NOT included here based on your authorize return
//   }

//   /**
//    * Extends the built-in Session type.
//    * This MUST match the object structure returned by your `session` callback.
//    */
//   interface Session extends DefaultSession {
//     // Make user optional to align with default types and optional chaining usage
//     user?: {
//       id: string;
//       username: string;
//       role: string;
//       // NOTE: email, name, image are NOT included here based on your session callback return
//     }; // & DefaultSession["user"]; <-- REMOVE this intersection if you aren't providing name/email/image

//     // NOTE: error, root username, accessToken are NOT included here
//     // Add them back ONLY IF you modify your session callback to include them.
//     // For example:
//     // accessToken?: string;
//   }
// }

// // Also update JWT if needed (looks consistent with your jwt callback)
// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//     role?: string;
//     username?: string;
//     // Add accessToken here if you add it in the jwt callback
//     // accessToken?: string;
//   }
// }
