import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";
import {
  getUserByUsername,
  createUserAccount,
  updatePasswordHash,
  setPasswordResetToken,
  getUserByResetToken,
  clearPasswordResetToken,
  recordLoginAttempt,
  countRecentLoginAttempts,
} from "../db";
import { TRPCError } from "@trpc/server";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 32);
  return `${salt}:${key.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const key = scryptSync(password, salt, 32);
  return timingSafeEqual(Buffer.from(hash, "hex"), key);
}

function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

function getSessionSecret() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

async function signSession(userId: number, username: string): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);
  return new SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSessionSecret());
}

async function verifySession(token: string | undefined | null): Promise<{ userId: number; username: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), { algorithms: ["HS256"] });
    const userId = payload.userId as number | undefined;
    const username = payload.username as string | undefined;
    if (userId === undefined || typeof username !== "string") return null;
    return { userId, username };
  } catch {
    return null;
  }
}

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
        password: z.string().min(3).max(50),
        confirmPassword: z.string().min(3).max(50),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Senhas não coincidem" });
      }

      const existing = await getUserByUsername(input.username);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Usuário já existe" });
      }

      const passwordHash = hashPassword(input.password);
      const user = await createUserAccount(input.username, passwordHash, input.email);
      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao criar conta" });
      }

      return { success: true, userId: user.id };
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(20),
        password: z.string().min(3).max(50),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date();
      const attempts = await countRecentLoginAttempts(input.username, new Date(now.getTime() - LOCKOUT_WINDOW_MS));
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Muitas tentativas. Tente novamente em 15 minutos.",
        });
      }

      const user = await getUserByUsername(input.username);
      if (!user || !user.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
        const ip = ctx.req?.ip ?? ctx.req?.headers["x-forwarded-for"] ?? "unknown";
        await recordLoginAttempt(input.username, typeof ip === "string" ? ip : undefined);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha incorretos" });
      }

      const token = await signSession(user.id, user.username!);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, userId: user.id, username: user.username };
    }),

  forgotPassword: publicProcedure
    .input(z.object({ username: z.string().min(3).max(20) }))
    .mutation(async ({ input }) => {
      const user = await getUserByUsername(input.username);
      if (!user) {
        return { success: true };
      }

      const token = generateResetToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await setPasswordResetToken(user.id, token, expires);

      console.log(`[AUTH] Password reset token for ${input.username}: ${token}`);
      return { success: true, resetToken: token };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(3).max(50),
        confirmPassword: z.string().min(3).max(50),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Senhas não coincidem" });
      }

      const user = await getUserByResetToken(input.token);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Token inválido ou expirado" });
      }

      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Token expirado" });
      }

      const passwordHash = hashPassword(input.password);
      await updatePasswordHash(user.id, passwordHash);
      await clearPasswordResetToken(user.id);

      return { success: true };
    }),

  me: publicProcedure.query(async ({ ctx }) => {
    const session = await verifySession(ctx.req?.cookies?.[COOKIE_NAME]);
    if (!session) return null;

    const user = await getUserByUsername(session.username);
    if (!user) return null;

    return { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role };
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
});
