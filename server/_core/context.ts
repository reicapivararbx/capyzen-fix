import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import { sdk } from "./sdk";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import { getUserByUsername } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function getSessionSecret() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

/** Try to authenticate a user-password session directly from the JWT cookie. */
async function authenticateWithLocalJWT(
  req: CreateExpressContextOptions["req"]
): Promise<User | null> {
  const cookies = parseCookies(req.headers.cookie ?? "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    const username = payload.username as string | undefined;
    if (typeof username !== "string") return null;

    const user = await getUserByUsername(username);
    return user ?? null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Try SDK auth first (OAuth/Manus users)
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }

  // Fallback: user-password auth (local JWT with userId/username)
  if (!user) {
    user = await authenticateWithLocalJWT(opts.req);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}