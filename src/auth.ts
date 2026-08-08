import NextAuth from "next-auth";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_MAX_AGE_SHORT = 24 * 60 * 60;
const SESSION_MAX_AGE_LONG = 30 * 24 * 60 * 60;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.toLowerCase().trim() : "";
}

function getProfileName(userName?: string | null, profile?: Record<string, unknown>) {
  const givenName = typeof profile?.given_name === "string" ? profile.given_name.trim() : "";
  const familyName = typeof profile?.family_name === "string" ? profile.family_name.trim() : "";

  if (givenName || familyName) {
    return {
      firstName: givenName || "Khách hàng",
      lastName: familyName || "",
    };
  }

  const parts = (userName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Khách hàng",
    lastName: parts.slice(1).join(" "),
  };
}

async function ensureUserStores(userId: string) {
  await Promise.all([
    prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
    prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
  ]);
}

async function syncOAuthUser({
  email,
  name,
  profile,
}: {
  email: string;
  name?: string | null;
  profile?: Record<string, unknown>;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser?.deletedAt) {
    return null;
  }

  if (existingUser) {
    await ensureUserStores(existingUser.id);
    return existingUser;
  }

  const { firstName, lastName } = getProfileName(name, profile);
  const passwordHash = await hash(randomUUID(), 12);

  return prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash,
      role: "customer",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });
}

const oauthProviders = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  oauthProviders.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_LONG,
  },
  pages: {
    signIn: "/",
  },
  providers: [
    ...oauthProviders,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const rememberMe = credentials?.rememberMe === "true";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || user.deletedAt) {
          return null;
        }

        const isPasswordValid = await compare(password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        const maxAge = rememberMe ? SESSION_MAX_AGE_LONG : SESSION_MAX_AGE_SHORT;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          expiresAt: Date.now() + maxAge * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.type === "credentials") {
        return true;
      }

      const email = normalizeEmail(user.email);
      if (!email) {
        return false;
      }

      if (account.provider === "google" && profile?.email_verified === false) {
        return false;
      }

      const dbUser = await syncOAuthUser({
        email,
        name: user.name,
        profile,
      });

      if (!dbUser) {
        return false;
      }

      user.id = dbUser.id;
      user.role = dbUser.role;
      user.firstName = dbUser.firstName;
      user.lastName = dbUser.lastName;
      user.expiresAt = Date.now() + SESSION_MAX_AGE_LONG * 1000;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.expiresAt = user.expiresAt;
      }

      if (token.expiresAt && Date.now() > token.expiresAt) {
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
