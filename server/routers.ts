import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { saveGame, loadGame, deleteGame, getLeaderboard, unlockAchievement, getAchievements, getChatMessages, sendChatMessage, sendFriendRequest, updateFriendRequest, listFriendRequests, listOutgoingRequests, listFriends, removeFriend, getUserByName, getUserById, blockUser, unblockUser, listBlockedUsers } from "./db";
import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./_core/authRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import type { GameState } from "../client/src/types/game";

const inventorySchema = z.object({
  grama: z.number(),
  batata: z.number(),
  hamburger: z.number(),
  refri: z.number(),
  feijao: z.number(),
  hotdog: z.number(),
  pizza: z.number(),
  sushi: z.number(),
  tacos: z.number(),
  sorvete: z.number(),
  bolo: z.number(),
  chocolate: z.number(),
  maçã: z.number(),
  banana: z.number(),
  melancia: z.number(),
  morango: z.number(),
  uva: z.number(),
  cenoura: z.number(),
  brócolis: z.number(),
  espinafre: z.number(),
  tomate: z.number(),
  queijo: z.number(),
  iogurte: z.number(),
  leite: z.number(),
  pão: z.number(),
  arroz: z.number(),
});

const gameStateSchema = z.object({
  coins: z.number(),
  level: z.number(),
  xp: z.number(),
  food: z.number(),
  poop: z.number(),
  hunger: z.number(),
  happiness: z.number(),
  sus: z.number(),
  x: z.number(),
  y: z.number(),
  speed: z.number(),
  alive: z.boolean(),
  capyColor: z.string(),
  capySize: z.number(),
  totalScore: z.number(),
  totalXP: z.number(),
  foodEaten: z.number(),
  gamesPlayed: z.number(),
  workCount: z.number(),
  affectionCount: z.number(),
  bathroomCount: z.number(),
  colorChanges: z.number(),
  size: z.number(),
  inventory: inventorySchema,
  energy: z.number(),
  thirst: z.number(),
  hygiene: z.number(),
  health: z.number(),
  equippedItems: z.array(z.string()),
  playerName: z.string(),
  capyName: z.string(),
  age: z.number(),
  fnfSongsCompleted: z.number().optional().default(0),
  fnfHighestCombo: z.number().optional().default(0),
  millionRewardClaimed: z.boolean().optional().default(false),
  speedBoost: z.number().optional().default(0),
  shieldActive: z.boolean().optional().default(false),
  luckBoost: z.number().optional().default(0),
  xpBoost: z.number().optional().default(0),
  coinBoost: z.number().optional().default(0),
  ownedClothing: z.array(z.string()).optional().default([]),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,

  game: router({
    save: protectedProcedure
      .input(gameStateSchema)
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return saveGame(userId, input);
      }),
    load: protectedProcedure.query(({ ctx }) => {
      const userId = ctx.user!.id;
      return loadGame(userId);
    }),
    delete: protectedProcedure.mutation(({ ctx }) => {
      const userId = ctx.user!.id;
      return deleteGame(userId);
    }),
    leaderboard: publicProcedure.query(() => getLeaderboard()),
    achievements: protectedProcedure.query(({ ctx }) => {
      const userId = ctx.user!.id;
      return getAchievements(userId);
    }),
    unlockAchievement: protectedProcedure
      .input(z.object({ achievementId: z.string() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return unlockAchievement(userId, input.achievementId);
      }),
  }),

  friends: router({
    send: protectedProcedure
      .input(z.object({ recipientId: z.number().optional(), recipientName: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user!.id;
        let targetId = input.recipientId;
        if (!targetId && input.recipientName) {
          const target = await getUserByName(input.recipientName);
          if (!target) throw new Error("User not found");
          targetId = target.id;
        }
        if (!targetId) throw new Error("Provide recipientId or recipientName");
        return sendFriendRequest(userId, targetId);
      }),

    accept: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return updateFriendRequest(input.requestId, userId, "accept");
      }),

    reject: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return updateFriendRequest(input.requestId, userId, "reject");
      }),

    incoming: protectedProcedure.query(({ ctx }) => {
      const userId = ctx.user!.id;
      return listFriendRequests(userId);
    }),

    outgoing: protectedProcedure.query(({ ctx }) => {
      const userId = ctx.user!.id;
      return listOutgoingRequests(userId);
    }),

    list: protectedProcedure.query(({ ctx }) => {
      const userId = ctx.user!.id;
      return listFriends(userId);
    }),

    remove: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return removeFriend(userId, input.requestId);
      }),

    block: protectedProcedure
      .input(z.object({ targetId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user!.id;
        await blockUser(userId, input.targetId);
        return { success: true };
      }),

    unblock: protectedProcedure
      .input(z.object({ targetId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user!.id;
        await unblockUser(userId, input.targetId);
        return { success: true };
      }),

    blocked: protectedProcedure.query(({ ctx }) => {
      const userId = ctx.user!.id;
      return listBlockedUsers(userId);
    }),

    profile: protectedProcedure.query(({ ctx }) => {
      const user = ctx.user!;
      return {
        id: user.id,
        username: user.username ?? null,
        name: user.name ?? user.email ?? null,
        role: user.role,
      };
    }),
  }),

  chat: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(200).optional().default(50) }).optional().default({ limit: 50 }))
      .query(({ input }) => getChatMessages(input.limit)),
    send: publicProcedure
      .input(z.object({
        content: z.string().trim().max(500, "Mensagem muito longa (máx. 500 caracteres)").optional().default(""),
        senderName: z.string().trim().max(30).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const displayName = ctx.user?.name?.trim() || input.senderName?.trim() || "Anônimo";
        const userId = ctx.user?.id ?? null;
        if (!input.content) {
          throw new Error("Mensagem não pode ser vazia");
        }
        return sendChatMessage(input.content, displayName, userId);
      }),

    uploadMedia: publicProcedure
      .input(z.object({
        fileName: z.string().min(1).max(200),
        contentType: z.string().min(1).max(100),
        fileData: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const allowedTypes = [
          "image/png", "image/jpeg", "image/gif", "image/webp", "image/bmp", "image/svg+xml",
          "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac", "audio/webm", "audio/x-m4a",
          "video/mp4", "video/webm", "video/ogg",
          "application/pdf",
        ];

        if (!allowedTypes.includes(input.contentType)) {
          throw new Error(`Tipo de arquivo não suportado: ${input.contentType}`);
        }

        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        const buffer = Buffer.from(input.fileData, "base64");

        if (buffer.length > MAX_FILE_SIZE) {
          throw new Error(`Arquivo muito grande (máx. ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
        }

        const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const ext = safeFileName.split(".").pop() || "bin";
        const key = `chat-media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const result = await storagePut(key, buffer, input.contentType);

        return {
          url: result.url,
          mediaType: input.contentType,
          mediaName: safeFileName,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
