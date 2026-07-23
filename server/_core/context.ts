import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
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

async function verifyToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    const userId = payload.userId as number | undefined;
    const username = payload.username as string | undefined;
    if (userId === undefined || typeof username !== "string") return null;
    return { userId, username };
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookies = parseCookies(opts.req.headers.cookie ?? "");
    const session = await verifyToken(cookies[COOKIE_NAME]);
    if (session?.username) {
      const found = await getUserByUsername(session.username);
      user = found ?? null;
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
