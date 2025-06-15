import { betterAuth } from "better-auth";
import { admin as adminPlugin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../prisma";
import { ac, admin, user, organizer } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
        organizer,
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
});
