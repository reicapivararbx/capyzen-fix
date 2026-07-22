import { useState, useCallback, useRef, useEffect } from "react";

export interface ChatMessage {
  id?: number;
  senderName?: string;
  content?: string;
  createdAt?: string;
  message?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaName?: string;
  itemType?: string;
  itemQuantity?: number;
}

interface UseWebSocketChatOptions {
  username: string;
  userId?: number;
  onMessage?: (msg: ChatMessage) => void;
  onConnectionChange?: (connected: boolean) => void;
  onUserCount?: (count: number) => void;
  enabled?: boolean;
}

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;
const RECONNECT_MAX_ATTEMPTS = 50;

export function useWebSocketChat({
  username,
  userId,
  onMessage,
  onConnectionChange,
  onUserCount,
  enabled = true,
}: UseWebSocketChatOptions) {
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  const onConnectionChangeRef = useRef(onConnectionChange);
  const onUserCountRef = useRef(onUserCount);
  const usernameRef = useRef(username);
  const userIdRef = useRef(userId);

  onMessageRef.current = onMessage;
  onConnectionChangeRef.current = onConnectionChange;
  onUserCountRef.current = onUserCount;
  usernameRef.current = username;
  userIdRef.current = userId;

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/api/ws/chat`;

    console.log(`[WS] Connecting to ${url}...`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      setConnected(true);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
      onConnectionChangeRef.current?.(true);

      ws.send(
        JSON.stringify({
          type: "auth",
          data: {
            username: usernameRef.current,
            userId: userIdRef.current ?? null,
          },
        }),
      );
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as {
          type: string;
          data: ChatMessage;
        };

        if (msg.type === "message" && msg.data) {
          const content = msg.data.content;

          if (content?.startsWith("__USER_COUNT__:")) {
            const count = parseInt(content.split(":")[1], 10);
            if (!isNaN(count)) {
              onUserCountRef.current?.(count);
            }
            return;
          }

          if (content === "__AUTH_OK__" || content === "__HISTORY__") {
            return;
          }

          if (content?.startsWith("__JOIN__") || content?.startsWith("__LEAVE__")) {
            onMessageRef.current?.({
              ...msg.data,
              content: content.replace(/^__(JOIN|LEAVE)__/, ""),
              senderName: "Sistema",
            });
            return;
          }

          onMessageRef.current?.(msg.data);
        }

        if (msg.type === "message_media" && msg.data) {
          onMessageRef.current?.({
            ...msg.data,
            mediaUrl: msg.data.mediaUrl,
            mediaType: msg.data.mediaType,
            mediaName: msg.data.mediaName,
          });
        }

        if (msg.type === "message_item" && msg.data) {
          onMessageRef.current?.({
            ...msg.data,
            itemType: msg.data.itemType,
            itemQuantity: msg.data.itemQuantity,
          });
        }

        if (msg.type === "error" && msg.data) {
          console.warn("[WS] Server error:", msg.data.message);
          onMessageRef.current?.({
            senderName: "Erro",
            content: msg.data.message || "Erro desconhecido",
            createdAt: new Date().toISOString(),
          });
        }

        if (msg.type === "rate_limit" && msg.data) {
          onMessageRef.current?.({
            senderName: "Aviso",
            content: msg.data.message || "Rate limit",
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onclose = (event: CloseEvent) => {
      console.log(`[WS] Disconnected (code: ${event.code}, reason: ${event.reason || "none"})`);
      setConnected(false);
      onConnectionChangeRef.current?.(false);

      if (reconnectAttemptsRef.current < RECONNECT_MAX_ATTEMPTS) {
        const delay = Math.min(
          RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current),
          RECONNECT_MAX_DELAY_MS,
        );
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${RECONNECT_MAX_ATTEMPTS})`);
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        setConnectionError("Máximo de tentativas de reconexão atingido");
        console.error("[WS] Max reconnect attempts reached");
      }
    };

    ws.onerror = (event: Event) => {
      console.error("[WS] Error:", event);
      setConnectionError("Erro de conexão WebSocket");
    };
  }, [cleanup]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "message",
          data: { content },
        }),
      );
    }
  }, []);

  const sendMedia = useCallback((mediaUrl: string, mediaType: string, mediaName: string, content?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "message_media",
          data: { mediaUrl, mediaType, mediaName, content: content ?? "" },
        }),
      );
    }
  }, []);

  const sendItem = useCallback((itemType: string, itemQuantity: number, content?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "message_item",
          data: { itemType, itemQuantity, content: content ?? "" },
        }),
      );
    }
  }, []);

  const disconnect = useCallback(() => {
    reconnectAttemptsRef.current = RECONNECT_MAX_ATTEMPTS;
    cleanup();
    setConnected(false);
    onConnectionChangeRef.current?.(false);
  }, [cleanup]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      cleanup();
    }
    return cleanup;
  }, [connect, cleanup, enabled]);

  return {
    connected,
    connectionError,
    sendMessage,
    sendMedia,
    sendItem,
    disconnect,
    reconnect: connect,
  };
}
