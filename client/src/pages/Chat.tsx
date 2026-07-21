import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_INTERVAL_MS = 2000;
const MAX_MESSAGES_IN_WINDOW = 3;

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function Chat() {
  const { user, isAuthenticated } = useAuth({});
  const utils = trpc.useUtils();
  const messagesQuery = trpc.chat.list.useQuery({ limit: 100 }, { refetchInterval: 5000 });
  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
      setContent('');
      setError('');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const [content, setContent] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageTimestampsRef = useRef<number[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesQuery.data]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_INTERVAL_MS;
    messageTimestampsRef.current = messageTimestampsRef.current.filter(t => t > windowStart);
    return messageTimestampsRef.current.length < MAX_MESSAGES_IN_WINDOW;
  }, []);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Mensagem não pode ser vazia');
      return;
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`Mensagem muito longa (máx. ${MAX_MESSAGE_LENGTH} caracteres)`);
      return;
    }
    if (!isAuthenticated && !displayName.trim()) {
      setError('Digite seu nome para enviar mensagens');
      return;
    }
    if (!checkRateLimit()) {
      setError(`Aguarde ${RATE_LIMIT_INTERVAL_MS / 1000}s entre mensagens`);
      return;
    }
    setError('');
    messageTimestampsRef.current.push(Date.now());
    sendMessage.mutate({
      content: trimmed,
      senderName: isAuthenticated ? undefined : displayName.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages = messagesQuery.data ?? [];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">💬 Chat Global</h1>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="min-h-[44px]"
          >
            🏠 Voltar
          </Button>
        </div>

        <div className="flex-1 bg-gray-800 rounded-lg border border-purple-400/30 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden" ref={scrollRef}>
            <ScrollArea className="h-full p-4">
              {messagesQuery.isLoading ? (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  Carregando mensagens...
                </div>
              ) : messagesQuery.error ? (
                <div className="flex items-center justify-center h-32 text-red-400">
                  Erro ao carregar mensagens. Tente novamente.
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                  <span className="text-4xl">💬</span>
                  <span>Nenhuma mensagem ainda. Seja o primeiro a conversar!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-purple-300 text-sm">
                          {msg.senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(new Date(msg.createdAt))}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  ))}
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
                placeholder="Digite sua mensagem..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={MAX_MESSAGE_LENGTH}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[44px] flex-1"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={sendMessage.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[44px] min-w-[44px] shrink-0"
              >
                {sendMessage.isPending ? '...' : 'Enviar'}
              </Button>
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
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
