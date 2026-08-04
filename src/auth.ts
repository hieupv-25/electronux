import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Session durations
const SESSION_MAX_AGE_SHORT = 24 * 60 * 60; // 1 day
const SESSION_MAX_AGE_LONG = 30 * 24 * 60 * 60; // 30 days

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_LONG, // Set to max, custom expiry enforced in jwt callback
  },
  pages: {
    signIn: "/", // We use a modal, not a separate page
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const rememberMe = credentials?.rememberMe === "true";

        if (!email || !password) {
          throw new Error("Vui lòng nhập email và mật khẩu.");
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("Email hoặc mật khẩu không đúng.");
        }

        // Check soft delete
        if (user.deletedAt) {
          throw new Error("Tài khoản này đã bị vô hiệu hóa.");
        }

        const isPasswordValid = await compare(password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error("Email hoặc mật khẩu không đúng.");
        }

        // Calculate custom session expiry
        const maxAge = rememberMe ? SESSION_MAX_AGE_LONG : SESSION_MAX_AGE_SHORT;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          rememberMe,
          expiresAt: Date.now() + maxAge * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, populate token from user
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.expiresAt = user.expiresAt;
      }

      // Check custom expiry
      if (token.expiresAt && Date.now() > token.expiresAt) {
        // Session expired — return empty token to force logout
        return {} as typeof token;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
      }
      return session;
    },
  },
});
