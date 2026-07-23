import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { getChatMessages, sendChatMessage, getClanByMember } from "./db";

interface ChatConnection {
  ws: WebSocket;
  username: string;
  userId: number | null;
  channel: string;
  connectedAt: Date;
}

interface ChatMessageData {
  id?: number;
  senderName?: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaName?: string;
  itemType?: string;
  itemQuantity?: number;
  createdAt?: string;
  message?: string;
}

interface ChatMessage {
  type: "message" | "join" | "leave" | "error" | "rate_limit" | "message_media" | "message_item";
  data: ChatMessageData;
}

const RATE_LIMIT_WINDOW_MS = 2000;
const MAX_MESSAGES_PER_WINDOW = 3;
const MAX_MESSAGE_LENGTH = 500;

const connections = new Map<WebSocket, ChatConnection>();
const messageTimestamps = new Map<WebSocket, number[]>();

function logChat(event: string, details: string) {
  const timestamp = new Date().toISOString();
  console.log(`[CHAT][${timestamp}] ${event}: ${details}`);
}

function checkRateLimit(ws: WebSocket): boolean {
  const now = Date.now();
  const timestamps = messageTimestamps.get(ws) || [];
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recentTimestamps = timestamps.filter((t) => t > windowStart);
  messageTimestamps.set(ws, recentTimestamps);
  return recentTimestamps.length < MAX_MESSAGES_PER_WINDOW;
}

function broadcastToChannel(channel: string, message: ChatMessage, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  connections.forEach((conn, ws) => {
    if (conn.channel === channel && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

function broadcastUserCountToChannel(channel: string) {
  let count = 0;
  connections.forEach((conn) => {
    if (conn.channel === channel) count++;
  });
  const countMessage: ChatMessage = {
    type: "message",
    data: { content: `__USER_COUNT__:${count}` },
  };
  const payload = JSON.stringify(countMessage);
  connections.forEach((conn, ws) => {
    if (conn.channel === channel && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

export function setupWebSocketChat(server: Server) {
  const wss = new WebSocketServer({ server, path: "/api/ws/chat" });

  logChat("INIT", "WebSocket chat server started");

  wss.on("connection", async (ws: WebSocket) => {
    logChat("CONNECT", `New connection from ${ws.protocol || "unknown"}`);

    ws.on("message", async (rawData: Buffer | string) => {
      try {
        const parsed = JSON.parse(rawData.toString()) as {
          type: string;
          data: {
            username?: string;
            userId?: number;
            content?: string;
            mediaUrl?: string;
            mediaType?: string;
            mediaName?: string;
            itemType?: string;
            itemQuantity?: number;
          };
        };

        if (parsed.type === "auth") {
          const username = parsed.data?.username?.trim() || "Anônimo";
          const userId = parsed.data?.userId ?? null;
          const requestedChannel = (parsed.data as { channel?: string }).channel?.trim() || "global";

          let channel = "global";
          if (requestedChannel.startsWith("clan:") && userId) {
            const clanId = parseInt(requestedChannel.split(":")[1], 10);
            if (!isNaN(clanId) && clanId > 0) {
              const memberData = await getClanByMember(userId);
              if (memberData && memberData.clan.id === clanId) {
                channel = `clan:${clanId}`;
              }
            }
          }

          connections.set(ws, {
            ws,
            username,
            userId,
            channel,
            connectedAt: new Date(),
          });

          messageTimestamps.set(ws, []);

          logChat("AUTH", `User "${username}" (ID: ${userId ?? "anon"}) on channel "${channel}"`);

          const authResponse: ChatMessage = {
            type: "message",
            data: { content: `__AUTH_OK__` },
          };
          ws.send(JSON.stringify(authResponse));

          broadcastToChannel(
            channel,
            {
              type: "message",
              data: {
                content: `__JOIN__${username} entrou no chat`,
                senderName: "Sistema",
              },
            },
            ws,
          );

          broadcastUserCountToChannel(channel);

          const recentMessages = await getChatMessages(50, channel);
          ws.send(
            JSON.stringify({
              type: "message",
              data: { content: `__HISTORY__` },
            }),
          );
          recentMessages.forEach((msg: { id: number; senderName: string; content: string; mediaUrl?: string | null; mediaType?: string | null; mediaName?: string | null; createdAt: Date }) => {
            const msgData: ChatMessageData = {
              id: msg.id,
              senderName: msg.senderName,
              content: msg.content,
              createdAt: msg.createdAt.toISOString(),
            };
            if (msg.mediaUrl) {
              msgData.mediaUrl = msg.mediaUrl;
              msgData.mediaType = msg.mediaType ?? undefined;
              msgData.mediaName = msg.mediaName ?? undefined;
            }
            ws.send(
              JSON.stringify({
                type: "message",
                data: msgData,
              }),
            );
          });
        }

        if (parsed.type === "message") {
          const conn = connections.get(ws);
          if (!conn) {
            ws.send(
              JSON.stringify({
                type: "error",
                data: { message: "Não autenticado. Envie auth primeiro." },
              }),
            );
            return;
          }

          const content = parsed.data?.content?.trim();
          if (!content) {
            ws.send(
              JSON.stringify({
                type: "error",
                data: { message: "Mensagem não pode ser vazia" },
              }),
            );
            return;
          }

          if (content.length > MAX_MESSAGE_LENGTH) {
            ws.send(
              JSON.stringify({
                type: "error",
                data: { message: `Mensagem muito longa (máx. ${MAX_MESSAGE_LENGTH} caracteres)` },
              }),
            );
            return;
          }

          if (!checkRateLimit(ws)) {
            ws.send(
              JSON.stringify({
                type: "rate_limit",
                data: { message: `Aguarde ${RATE_LIMIT_WINDOW_MS / 1000}s entre mensagens` },
              }),
            );
            logChat("RATE_LIMIT", `User "${conn.username}" hit rate limit`);
            return;
          }

          messageTimestamps.get(ws)!.push(Date.now());

          try {
            const savedMessage = await sendChatMessage(content, conn.username, conn.userId, null, conn.channel);

            logChat("MESSAGE", `"${conn.username}" on "${conn.channel}": "${content.substring(0, 50)}..."`);

            broadcastToChannel(conn.channel, {
              type: "message",
              data: {
                id: savedMessage.id,
                senderName: savedMessage.senderName,
                content: savedMessage.content,
                createdAt: savedMessage.createdAt.toISOString(),
              },
            });
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Unknown error";
            logChat("ERROR", `Failed to save message: ${errorMsg}`);
            ws.send(
              JSON.stringify({
                type: "error",
                data: { message: "Erro ao enviar mensagem" },
              }),
            );
          }
        }

        // ── Media message handler ────────────────────────────────────
        if (parsed.type === "message_media") {
          const conn = connections.get(ws);
          if (!conn) {
            ws.send(JSON.stringify({ type: "error", data: { message: "Não autenticado. Envie auth primeiro." } }));
            return;
          }

          const content = parsed.data?.content?.trim() ?? "";
          const mediaUrl = parsed.data?.mediaUrl?.trim();
          const mediaType = parsed.data?.mediaType?.trim();
          const mediaName = parsed.data?.mediaName?.trim();

          if (!mediaUrl || !mediaType) {
            ws.send(JSON.stringify({ type: "error", data: { message: "URL e tipo de mídia são obrigatórios" } }));
            return;
          }

          if (content.length > MAX_MESSAGE_LENGTH) {
            ws.send(JSON.stringify({ type: "error", data: { message: `Mensagem muito longa (máx. ${MAX_MESSAGE_LENGTH} caracteres)` } }));
            return;
          }

          if (!checkRateLimit(ws)) {
            ws.send(JSON.stringify({ type: "rate_limit", data: { message: `Aguarde ${RATE_LIMIT_WINDOW_MS / 1000}s entre mensagens` } }));
            logChat("RATE_LIMIT", `User "${conn.username}" hit rate limit (media)`);
            return;
          }

          messageTimestamps.get(ws)!.push(Date.now());

          try {
            const savedMessage = await sendChatMessage(
              content,
              conn.username,
              conn.userId,
              { url: mediaUrl, type: mediaType, name: mediaName || "arquivo" },
              conn.channel,
            );

            logChat("MEDIA", `"${conn.username}" on "${conn.channel}" sent media: ${mediaType} (${mediaName})`);

            broadcastToChannel(conn.channel, {
              type: "message_media",
              data: {
                id: savedMessage.id,
                senderName: savedMessage.senderName,
                content: savedMessage.content,
                mediaUrl: savedMessage.mediaUrl ?? undefined,
                mediaType: savedMessage.mediaType ?? undefined,
                mediaName: savedMessage.mediaName ?? undefined,
                createdAt: savedMessage.createdAt.toISOString(),
              },
            });
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Unknown error";
            logChat("ERROR", `Failed to save media message: ${errorMsg}`);
            ws.send(JSON.stringify({ type: "error", data: { message: "Erro ao enviar mídia" } }));
          }
        }

        // ── Item gift handler ────────────────────────────────────────
        if (parsed.type === "message_item") {
          const conn = connections.get(ws);
          if (!conn) {
            ws.send(JSON.stringify({ type: "error", data: { message: "Não autenticado. Envie auth primeiro." } }));
            return;
          }

          const content = parsed.data?.content?.trim() ?? "";
          const itemType = parsed.data?.itemType?.trim();
          const itemQuantity = Math.max(1, Math.min(99, Math.floor(parsed.data?.itemQuantity ?? 1)));

          if (!itemType) {
            ws.send(JSON.stringify({ type: "error", data: { message: "Tipo de item é obrigatório" } }));
            return;
          }

          if (content.length > MAX_MESSAGE_LENGTH) {
            ws.send(JSON.stringify({ type: "error", data: { message: `Mensagem muito longa (máx. ${MAX_MESSAGE_LENGTH} caracteres)` } }));
            return;
          }

          if (!checkRateLimit(ws)) {
            ws.send(JSON.stringify({ type: "rate_limit", data: { message: `Aguarde ${RATE_LIMIT_WINDOW_MS / 1000}s entre mensagens` } }));
            return;
          }

          messageTimestamps.get(ws)!.push(Date.now());

          try {
            // Store item gift as a special media message
            const itemData = JSON.stringify({ itemType, itemQuantity });
            const savedMessage = await sendChatMessage(
              content,
              conn.username,
              conn.userId,
              { url: `item://${itemData}`, type: "application/x-capygame-item", name: itemType },
              conn.channel,
            );

            logChat("ITEM_GIFT", `"${conn.username}" on "${conn.channel}" gifted item: ${itemQuantity}x ${itemType}`);

            broadcastToChannel(conn.channel, {
              type: "message_item",
              data: {
                id: savedMessage.id,
                senderName: savedMessage.senderName,
                content: savedMessage.content,
                itemType,
                itemQuantity,
                createdAt: savedMessage.createdAt.toISOString(),
              },
            });
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Unknown error";
            logChat("ERROR", `Failed to save item gift: ${errorMsg}`);
            ws.send(JSON.stringify({ type: "error", data: { message: "Erro ao enviar item" } }));
          }
        }
      } catch {
        ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Formato de mensagem inválido" },
          }),
        );
      }
    });

    ws.on("close", () => {
      const conn = connections.get(ws);
      if (conn) {
        logChat("DISCONNECT", `User "${conn.username}" disconnected from "${conn.channel}"`);
        const channel = conn.channel;
        broadcastToChannel(
          channel,
          {
            type: "message",
            data: {
              content: `__LEAVE__${conn.username} saiu do chat`,
              senderName: "Sistema",
            },
          },
        );
        connections.delete(ws);
        messageTimestamps.delete(ws);
        broadcastUserCountToChannel(channel);
      }
    });

    ws.on("error", (error: Error) => {
      const conn = connections.get(ws);
      logChat("WS_ERROR", `Error for "${conn?.username ?? "unknown"}": ${error.message}`);
    });
  });

  logChat("INIT", `WebSocket chat listening on /api/ws/chat`);
  return wss;
}
