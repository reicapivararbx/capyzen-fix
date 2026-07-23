import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { saveGame, loadGame, deleteGame, getLeaderboard, unlockAchievement, getAchievements, getChatMessages, sendChatMessage, sendFriendRequest, updateFriendRequest, listFriendRequests, listOutgoingRequests, listFriends, removeFriend, getUserByName, getUserById, blockUser, unblockUser, listBlockedUsers, createClan, getClanById, getClanByMember, listClanMembers, searchClans, disbandClan, leaveClan, kickClanMember, updateClanRole, transferClanLeadership, updateClanSettings, createClanInvite, acceptClanInvite, declineClanInvite, listClanInvites, joinClanPublic } from "./db";
import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./_core/authRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import fs from "fs";
import path from "path";
import { listAllUsers, updateUserRole } from "./db";
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
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const uploadsDir = path.resolve(process.cwd(), "uploads");
        fs.mkdirSync(uploadsDir, { recursive: true });
        fs.writeFileSync(path.join(uploadsDir, fileName), buffer);

        return {
          url: `/uploads/${fileName}`,
          mediaType: input.contentType,
          mediaName: safeFileName,
        };
      }),

    claimItem: protectedProcedure
      .input(z.object({
        itemType: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }))
      .mutation(async ({ input, ctx }) => {
        const VALID_ITEMS = [
          "grama", "batata", "hamburger", "refri", "feijao", "hotdog", "pizza",
          "sushi", "tacos", "sorvete", "bolo", "chocolate", "maçã", "banana",
          "melancia", "morango", "uva", "cenoura", "brócolis", "espinafre",
          "tomate", "queijo", "iogurte", "leite", "pão", "arroz",
        ] as const;

        if (!VALID_ITEMS.includes(input.itemType as typeof VALID_ITEMS[number])) {
          throw new Error(`Item inválido: ${input.itemType}`);
        }

        const userId = ctx.user!.id;
        const state = await loadGame(userId);
        if (!state) throw new Error("Save não encontrado");

        if (!state.inventory) {
          state.inventory = {} as GameState["inventory"];
        }

        const key = input.itemType as keyof GameState["inventory"];
        const currentQty = (state.inventory[key] as number) || 0;
        state.inventory[key] = (currentQty + input.quantity) as GameState["inventory"][typeof key];

        await saveGame(userId, state);
        return { success: true, itemType: key, newQuantity: state.inventory[key] };
      }),
  }),

  clans: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().trim().min(3, "Nome deve ter 3-20 caracteres").max(20),
        tag: z.string().trim().min(2, "Tag deve ter 2-5 caracteres").max(5),
        description: z.string().trim().max(200).optional(),
        emblem: z.string().max(10).optional(),
        isPublic: z.boolean().optional(),
        minLevel: z.number().int().min(1).max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user!.id;
        return createClan(userId, input.name, input.tag, input.description, input.emblem, input.isPublic, input.minLevel);
      }),

    mine: protectedProcedure.query(({ ctx }) => {
      const userId = ctx.user!.id;
      return getClanByMember(userId);
    }),

    get: protectedProcedure
      .input(z.object({ clanId: z.number() }))
      .query(({ input }) => getClanById(input.clanId)),

    members: protectedProcedure
      .input(z.object({ clanId: z.number() }))
      .query(({ input }) => listClanMembers(input.clanId)),

    search: protectedProcedure.query(() => searchClans()),

    disband: protectedProcedure
      .input(z.object({ clanId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return disbandClan(input.clanId, userId);
      }),

    leave: protectedProcedure.mutation(({ ctx }) => {
      const userId = ctx.user!.id;
      return leaveClan(userId);
    }),

    kick: protectedProcedure
      .input(z.object({ clanId: z.number(), targetUserId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return kickClanMember(input.clanId, input.targetUserId, userId);
      }),

    setRole: protectedProcedure
      .input(z.object({
        clanId: z.number(),
        targetUserId: z.number(),
        role: z.enum(["officer", "member"]),
      }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return updateClanRole(input.clanId, input.targetUserId, userId, input.role);
      }),

    transferLeadership: protectedProcedure
      .input(z.object({ clanId: z.number(), newLeaderId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return transferClanLeadership(input.clanId, input.newLeaderId, userId);
      }),

    updateSettings: protectedProcedure
      .input(z.object({
        clanId: z.number(),
        description: z.string().trim().max(200).optional(),
        emblem: z.string().max(10).optional(),
        isPublic: z.boolean().optional(),
        minLevel: z.number().int().min(1).max(100).optional(),
      }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return updateClanSettings(input.clanId, userId, {
          description: input.description,
          emblem: input.emblem,
          isPublic: input.isPublic,
          minLevel: input.minLevel,
        });
      }),

    invite: protectedProcedure
      .input(z.object({ clanId: z.number(), targetName: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user!.id;
        const target = await getUserByName(input.targetName);
        if (!target) throw new Error("Usuário não encontrado");
        if (target.id === userId) throw new Error("Não pode convidar a si mesmo");
        return createClanInvite(input.clanId, userId, target.id);
      }),

    invites: protectedProcedure.query(({ ctx }) => {
      const userId = ctx.user!.id;
      return listClanInvites(userId);
    }),

    acceptInvite: protectedProcedure
      .input(z.object({ inviteId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return acceptClanInvite(input.inviteId, userId);
      }),

    declineInvite: protectedProcedure
      .input(z.object({ inviteId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return declineClanInvite(input.inviteId, userId);
      }),

    join: protectedProcedure
      .input(z.object({ clanId: z.number() }))
      .mutation(({ input, ctx }) => {
        const userId = ctx.user!.id;
        return joinClanPublic(input.clanId, userId);
      }),
  }),

  admin: router({
    listUsers: adminProcedure.query(async () => {
      return listAllUsers();
    }),

    setUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    getUserGame: adminProcedure
      .input(z.object({ targetUserId: z.number() }))
      .query(async ({ input }) => {
        return loadGame(input.targetUserId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
