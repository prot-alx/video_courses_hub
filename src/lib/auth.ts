import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Сохраняем пользователя в БД при первом входе
      console.log(user);
      if (account?.provider === "google" && profile?.email) {
        try {
          await prisma.user.upsert({
            where: { email: profile.email },
            update: {
              name: profile.name || null,
            },
            create: {
              email: profile.email,
              googleId: account.providerAccountId,
              name: profile.name || null,
              role: "USER",
            },
          });
        } catch (error) {
          console.error("Ошибка сохранения пользователя:", error);
          // Не блокируем вход при ошибке БД
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email && token.sub) {
        // Получаем актуальные данные пользователя из БД
        try {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true, email: true, name: true },
          });

          if (user) {
            session.user.id = user.id;
            session.user.role = user.role;
          } else {
            session.user.role = "USER";
          }
        } catch (error) {
          console.error("Ошибка получения пользователя:", error);
          session.user.role = "USER";
        }
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const userId = profile.sub || profile.id;
        if (userId) {
          token.sub = userId;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
