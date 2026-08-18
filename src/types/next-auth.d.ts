import { DefaultSession } from "next-auth";
import { UserRole, PlanType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      plan: PlanType;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    plan: PlanType;
    stripeCustomerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    plan: PlanType;
  }
}
