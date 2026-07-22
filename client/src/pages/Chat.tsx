import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/_core/hooks/useAuth";
import { useWebSocketChat } from "@/hooks/useWebSocketChat";
import { startBots, subscribeToBots, type BotMessage } from "@/lib/chatBots";

const MAX_MESSAGE_LENGTH = 500;

interface DisplayMessage {
  id?: number;
  senderName: string;
  content: string;
  createdAt: Date;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function Chat() {
  const { user, isAuthenticated } = useAuth({});
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [content, setContent] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [userCount, setUserCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHistoryLoadedRef = useRef(false);
  const username = isAuthenticated ? user?.name || "Jogador" : displayName.trim() || "Anônimo";
  const userId = (user as { id?: number } | undefined)?.id;

  const handleWsMessage = useCallback((msg: { senderName?: string; content?: string; createdAt?: string }) => {
    const content = msg.content;
    if (!content) return;

    if (content === "__HISTORY__") {
      isHistoryLoadedRef.current = true;
      setMessages([]);
      return;
    }

    if (content.startsWith("__USER_COUNT__:")) {
      const count = parseInt(content.split(":")[1], 10);
      if (!isNaN(count)) setUserCount(count);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random(),
        senderName: msg.senderName || "Anônimo",
        content: content,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      },
    ]);
  }, []);

  const { connected, connectionError, sendMessage: wsSend } = useWebSocketChat({
    username,
    userId,
    onMessage: handleWsMessage,
    onUserCount: setUserCount,
    enabled: isAuthenticated || displayName.trim().length > 0,
  });

  useEffect(() => {
    startBots();
    const unsubscribe = subscribeToBots((msg: BotMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random(),
          senderName: msg.senderName,
          content: msg.content,
          createdAt: msg.createdAt,
        },
      ]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated && displayName.trim()) {
      setDisplayName(displayName.trim());
    }
  }, [isAuthenticated, displayName]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Mensagem não pode ser vazia");
      return;
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`Mensagem muito longa (máx. ${MAX_MESSAGE_LENGTH} caracteres)`);
      return;
    }
    if (!isAuthenticated && !displayName.trim()) {
      setError("Digite seu nome para enviar mensagens");
      return;
    }
    if (!connected) {
      setError("Desconectado do chat. Aguardando reconexão...");
      return;
    }
    setError("");
    wsSend(trimmed);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">💬 Chat Global</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
              <span className="text-xs text-gray-400">
                {connected ? `${userCount} online` : "Desconectado"}
              </span>
            </div>
          </div>
          <Button onClick={() => (window.location.href = "/")} variant="outline" className="min-h-[44px]">
            🏠 Voltar
          </Button>
        </div>

        <div className="flex-1 bg-gray-800 rounded-lg border border-purple-400/30 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden" ref={scrollRef}>
            <ScrollArea className="h-full p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                  <span className="text-4xl">💬</span>
                  <span>Nenhuma mensagem ainda. Seja o primeiro a conversar!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, index) => {
                    const isBot = msg.senderName.startsWith("[BOT]");
                    return (
                      <div key={msg.id ?? index} className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`font-semibold text-sm ${
                              isBot
                                ? "text-cyan-400"
                                : msg.senderName === "Sistema"
                                  ? "text-yellow-400"
                                  : msg.senderName === "Erro"
                                    ? "text-red-400"
                                    : msg.senderName === "Aviso"
                                      ? "text-orange-400"
                                      : "text-purple-300"
                            }`}
                          >
                            {msg.senderName}
                          </span>
                          <span className="text-xs text-gray-500">{formatTimestamp(msg.createdAt)}</span>
                        </div>
                        <p className={`text-sm break-words whitespace-pre-wrap ${isBot ? "text-gray-400 italic" : "text-gray-200"}`}>
                          {msg.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="border-t border-gray-700 p-3 space-y-2">
            {!isAuthenticated && (
              <Input
                placeholder="Seu nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[44px]"
              />
            )}
            <div className="flex gap-2">
              <Input
                placeholder={connected ? "Digite sua mensagem..." : "Reconectando..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={MAX_MESSAGE_LENGTH}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[44px] flex-1"
                disabled={!connected}
              />
              <Button
                onClick={handleSend}
                disabled={!connected}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[44px] min-w-[44px] shrink-0"
              >
                {connected ? "Enviar" : "..."}
              </Button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {connectionError && <p className="text-orange-400 text-xs">{connectionError}</p>}
            {content.length > MAX_MESSAGE_LENGTH * 0.8 && (
              <p className="text-gray-500 text-xs text-right">
                {content.length}/{MAX_MESSAGE_LENGTH}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
