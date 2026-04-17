import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { sanityWriteClient } from '@/sanity/lib/client';
import { sanityClient } from '@/sanity/lib/client';
import crypto from 'crypto';

/* ── Custom Sanity Adapter ──────────────────────── */

function SanityAdapter() {
  const client = sanityWriteClient();

  return {
    async createUser(user) {
      const doc = {
        _type: 'user',
        name: user.name || '',
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
        image: user.image || null,
        savedArticles: [],
        notificationPrefs: {
          newArticles: true,
          platformUpdates: true,
          marketAlerts: true,
          weeklyDigest: true,
          newsletter: false,
        },
        createdAt: new Date().toISOString(),
      };
      const created = await client.create(doc);
      return { id: created._id, ...user };
    },

    async getUser(id) {
      const user = await client.fetch('*[_type=="user" && _id==$id][0]', { id });
      if (!user) return null;
      return { id: user._id, name: user.name, email: user.email, emailVerified: user.emailVerified, image: user.image };
    },

    async getUserByEmail(email) {
      const user = await client.fetch('*[_type=="user" && email==$email][0]', { email });
      if (!user) return null;
      return { id: user._id, name: user.name, email: user.email, emailVerified: user.emailVerified, image: user.image };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await client.fetch(
        '*[_type=="account" && providerId==$provider && providerAccountId==$providerAccountId][0]{ user-> }',
        { provider, providerAccountId }
      );
      if (!account?.user) return null;
      const u = account.user;
      return { id: u._id, name: u.name, email: u.email, emailVerified: u.emailVerified, image: u.image };
    },

    async updateUser({ id, ...data }) {
      const updates = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.email !== undefined) updates.email = data.email;
      if (data.emailVerified !== undefined) updates.emailVerified = new Date(data.emailVerified).toISOString();
      if (data.image !== undefined) updates.image = data.image;
      await client.patch(id).set(updates).commit();
      return { id, ...data };
    },

    async linkAccount(account) {
      await client.create({
        _type: 'account',
        user: { _type: 'reference', _ref: account.userId },
        providerType: account.type,
        providerId: account.provider,
        providerAccountId: account.providerAccountId,
        refreshToken: account.refresh_token,
        accessToken: account.access_token,
        accessTokenExpires: account.expires_at,
      });
    },

    async createVerificationToken({ identifier, token, expires }) {
      await client.create({
        _type: 'verificationToken',
        identifier,
        token,
        expires: new Date(expires).toISOString(),
      });
      return { identifier, token, expires };
    },

    async useVerificationToken({ identifier, token }) {
      const vt = await client.fetch(
        '*[_type=="verificationToken" && identifier==$identifier && token==$token][0]',
        { identifier, token }
      );
      if (!vt) return null;
      await client.delete(vt._id);
      return { identifier: vt.identifier, token: vt.token, expires: vt.expires };
    },
  };
}

/* ── NextAuth Config ───────────────────────────── */

const providers = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
];

// Only add email provider if SMTP is configured
if (process.env.AUTH_EMAIL_SERVER) {
  providers.push(
    Nodemailer({
      server: process.env.AUTH_EMAIL_SERVER,
      from: process.env.AUTH_EMAIL_FROM || 'Dollar Commerce <noreply@dollarcommerce.com>',
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SanityAdapter(),
  session: { strategy: 'jwt' },
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (profile?.picture) {
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      if (token?.picture) {
        session.user.image = token.picture;
      }
      return session;
    },
  },
});
