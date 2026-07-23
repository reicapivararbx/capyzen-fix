import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/_core/hooks/useAuth";
import { useWebSocketChat, type ChatMessage } from "@/hooks/useWebSocketChat";
import { trpc } from "@/lib/trpc";
import { startBots, subscribeToBots, type BotMessage } from "@/lib/chatBots";

const MAX_MESSAGE_LENGTH = 500;

const INVENTORY_ITEMS: Record<string, { emoji: string; label: string }> = {
  grama: { emoji: "🌿", label: "Grama" },
  batata: { emoji: "🥔", label: "Batata" },
  hamburger: { emoji: "🍔", label: "Hamburger" },
  refri: { emoji: "🥤", label: "Refrigerante" },
  feijao: { emoji: "🫘", label: "Feijão" },
  hotdog: { emoji: "🌭", label: "Hot Dog" },
  pizza: { emoji: "🍕", label: "Pizza" },
  sushi: { emoji: "🍣", label: "Sushi" },
  tacos: { emoji: "🌮", label: "Tacos" },
  sorvete: { emoji: "🍦", label: "Sorvete" },
  bolo: { emoji: "🎂", label: "Bolo" },
  chocolate: { emoji: "🍫", label: "Chocolate" },
  "maçã": { emoji: "🍎", label: "Maçã" },
  banana: { emoji: "🍌", label: "Banana" },
  melancia: { emoji: "🍉", label: "Melancia" },
  morango: { emoji: "🍓", label: "Morango" },
  uva: { emoji: "🍇", label: "Uva" },
  cenoura: { emoji: "🥕", label: "Cenoura" },
  "brócolis": { emoji: "🥦", label: "Brócolis" },
  espinafre: { emoji: "🥬", label: "Espinafre" },
  tomate: { emoji: "🍅", label: "Tomate" },
  queijo: { emoji: "🧀", label: "Queijo" },
  iogurte: { emoji: "🥛", label: "Iogurte" },
  leite: { emoji: "🥛", label: "Leite" },
  "pão": { emoji: "🍞", label: "Pão" },
  arroz: { emoji: "🍚", label: "Arroz" },
};

interface DisplayMessage {
  id?: number;
  senderName: string;
  content: string;
  createdAt: Date;
  mediaUrl?: string;
  mediaType?: string;
  mediaName?: string;
  itemType?: string;
  itemQuantity?: number;
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

function MediaRenderer({ url, type, name }: { url: string; type: string; name?: string }) {
  if (type.startsWith("image/")) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <img src={url} alt={name ?? "imagem"} className="rounded-lg max-w-[200px] max-h-[200px] object-cover" />
      </a>
    );
  }
  if (type.startsWith("audio/")) {
    return <audio controls src={url} className="mt-1 w-full max-w-[300px]" />;
  }
  if (type.startsWith("video/")) {
    return <video controls src={url} className="mt-1 rounded-lg max-w-[300px]" />;
  }
  return (
    <a href={url} download={name ?? "arquivo"} className="inline-flex items-center gap-1 mt-1 text-blue-400 hover:text-blue-300 text-sm">
      📎 {name ?? "arquivo"}
    </a>
  );
}

function GiftCard({ itemType, itemQuantity }: { itemType: string; itemQuantity: number }) {
  const item = INVENTORY_ITEMS[itemType];
  const label = item?.label ?? itemType;
  const emoji = item?.emoji ?? "🎁";
  const [claimed, setClaimed] = useState(false);

  const claimMutation = trpc.chat.claimItem.useMutation({
    onSuccess: () => {
      setClaimed(true);
      toast.success(`${itemQuantity}x ${label} adicionado ao seu inventário!`);
    },
    onError: (err: { message: string }) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="mt-1 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30 flex items-center gap-3">
      <span className="text-3xl">{emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-purple-300">{itemQuantity}x {label}</p>
        <p className="text-xs text-gray-400">Presente!</p>
      </div>
      {claimed ? (
        <span className="text-sm text-green-400 font-semibold">✓ Recebido!</span>
      ) : (
        <Button
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          disabled={claimMutation.isPending}
          onClick={() => claimMutation.mutate({ itemType, quantity: itemQuantity })}
        >
          {claimMutation.isPending ? "..." : "Receber"}
        </Button>
      )}
    </div>
  );
}

export default function Chat() {
  const { user, isAuthenticated, loading } = useAuth({});
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [content, setContent] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [giftItem, setGiftItem] = useState<string | null>(null);
  const [giftQty, setGiftQty] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isHistoryLoadedRef = useRef(false);
  const username = isAuthenticated ? user?.name || "Jogador" : displayName.trim() || "Anônimo";
  const userId = (user as { id?: number } | undefined)?.id;

  const uploadMutation = trpc.chat.uploadMedia.useMutation({
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const handleWsMessage = useCallback((msg: ChatMessage) => {
    const msgContent = msg.content;
    if (msgContent?.startsWith("__USER_COUNT__:")) {
      const count = parseInt(msgContent.split(":")[1], 10);
      if (!isNaN(count)) setUserCount(count);
      return;
    }
    if (msgContent === "__AUTH_OK__" || msgContent === "__HISTORY__") {
      isHistoryLoadedRef.current = true;
      return;
    }
    if (msgContent?.startsWith("__JOIN__") || msgContent?.startsWith("__LEAVE__")) {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id ?? Math.random(),
          senderName: "Sistema",
          content: msgContent.replace(/^__(JOIN|LEAVE)__/, ""),
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: msg.id ?? Math.random(),
        senderName: msg.senderName || "Anônimo",
        content: msgContent ?? "",
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        mediaUrl: msg.mediaUrl,
        mediaType: msg.mediaType,
        mediaName: msg.mediaName,
        itemType: msg.itemType,
        itemQuantity: msg.itemQuantity,
      },
    ]);
  }, []);

  const { connected, connectionError, sendMessage: wsSend, sendMedia, sendItem } = useWebSocketChat({
    username,
    userId,
    onMessage: handleWsMessage,
    onUserCount: setUserCount,
    enabled: !loading && (isAuthenticated || displayName.trim().length > 0),
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      if (!base64) return;
      try {
        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          contentType: file.type,
          fileData: base64,
        });
        sendMedia(result.url, result.mediaType, result.mediaName, "");
        toast.success("Mídia enviada!");
      } catch {
        toast.error("Erro ao enviar mídia");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGiftConfirm = () => {
    if (!giftItem) return;
    sendItem(giftItem, giftQty, "");
    setShowGiftDialog(false);
    setGiftItem(null);
    setGiftQty(1);
    toast.success(`Presente enviado!`);
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

        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,audio/*,video/*,.pdf" />

        {showGiftDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowGiftDialog(false)}>
            <div className="bg-gray-800 rounded-lg border border-purple-400/30 p-5 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-3">🎁 Enviar Presente</h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Object.entries(INVENTORY_ITEMS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setGiftItem(key)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition ${
                      giftItem === key
                        ? "border-purple-400 bg-purple-500/20"
                        : "border-gray-600 bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs text-gray-300">{item.label}</span>
                  </button>
                ))}
              </div>
              {giftItem && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-gray-300">Quantidade:</span>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={giftQty}
                    onChange={(e) => setGiftQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                    className="w-20 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowGiftDialog(false)} className="min-h-[44px]">
                  Cancelar
                </Button>
                <Button
                  onClick={handleGiftConfirm}
                  disabled={!giftItem}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[44px]"
                >
                  Presentear
                </Button>
              </div>
            </div>
          </div>
        )}

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
                        {msg.content && (
                          <p className={`text-sm break-words whitespace-pre-wrap ${isBot ? "text-gray-400 italic" : "text-gray-200"}`}>
                            {msg.content}
                          </p>
                        )}
                        {msg.mediaUrl && msg.mediaType && (
                          <MediaRenderer url={msg.mediaUrl} type={msg.mediaType} name={msg.mediaName} />
                        )}
                        {msg.itemType && msg.itemQuantity && (
                          <GiftCard itemType={msg.itemType} itemQuantity={msg.itemQuantity} />
                        )}
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
                onClick={() => fileInputRef.current?.click()}
                disabled={!connected || uploadMutation.isPending}
                variant="outline"
                className="min-h-[44px] min-w-[44px] shrink-0 border-gray-600"
                title="Enviar mídia"
              >
                {uploadMutation.isPending ? "⏳" : "📎"}
              </Button>
              <Button
                onClick={() => setShowGiftDialog(true)}
                disabled={!connected || !isAuthenticated}
                variant="outline"
                className="min-h-[44px] min-w-[44px] shrink-0 border-gray-600"
                title="Enviar presente"
              >
                🎁
              </Button>
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
