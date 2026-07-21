import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { getChatMessages, sendChatMessage } from "./db";

interface ChatConnection {
  ws: WebSocket;
  username: string;
  userId: number | null;
  connectedAt: Date;
}

interface ChatMessage {
  type: "message" | "join" | "leave" | "error" | "rate_limit";
  data: {
    id?: number;
    senderName?: string;
    content?: string;
    createdAt?: string;
    message?: string;
  };
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

function broadcastToAll(message: ChatMessage, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  connections.forEach((conn, ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

function broadcastUserCount() {
  const countMessage: ChatMessage = {
    type: "message",
    data: { content: `__USER_COUNT__:${connections.size}` },
  };
  const payload = JSON.stringify(countMessage);
  connections.forEach((conn, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
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
          data: { username?: string; userId?: number; content?: string };
        };

        if (parsed.type === "auth") {
          const username = parsed.data?.username?.trim() || "Anônimo";
          const userId = parsed.data?.userId ?? null;

          connections.set(ws, {
            ws,
            username,
            userId,
            connectedAt: new Date(),
          });

          messageTimestamps.set(ws, []);

          logChat("AUTH", `User "${username}" (ID: ${userId ?? "anon"}) authenticated`);

          const authResponse: ChatMessage = {
            type: "message",
            data: { content: `__AUTH_OK__` },
          };
          ws.send(JSON.stringify(authResponse));

          broadcastToAll(
            {
              type: "message",
              data: {
                content: `__JOIN__${username} entrou no chat`,
                senderName: "Sistema",
              },
            },
            ws,
          );

          broadcastUserCount();

          const recentMessages = await getChatMessages(50);
          ws.send(
            JSON.stringify({
              type: "message",
              data: { content: `__HISTORY__` },
            }),
          );
          recentMessages.forEach((msg: { id: number; senderName: string; content: string; createdAt: Date }) => {
            ws.send(
              JSON.stringify({
                type: "message",
                data: {
                  id: msg.id,
                  senderName: msg.senderName,
                  content: msg.content,
                  createdAt: msg.createdAt.toISOString(),
                },
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
            const savedMessage = await sendChatMessage(content, conn.username, conn.userId);

            logChat("MESSAGE", `"${conn.username}": "${content.substring(0, 50)}..."`);

            broadcastToAll({
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
        logChat("DISCONNECT", `User "${conn.username}" disconnected`);
        broadcastToAll(
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
        broadcastUserCount();
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
