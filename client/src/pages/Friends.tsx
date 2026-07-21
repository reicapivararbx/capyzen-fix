import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Friends() {
  const { user, isAuthenticated } = useAuth({});
  const [target, setTarget] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const utils = trpc.useUtils();

  const { data: incoming, isLoading: loadingIncoming } = trpc.friends.incoming.useQuery(undefined, { enabled: isAuthenticated });
  const { data: outgoing, isLoading: loadingOutgoing } = trpc.friends.outgoing.useQuery(undefined, { enabled: isAuthenticated });
  const { data: friends, isLoading: loadingFriends } = trpc.friends.list.useQuery(undefined, { enabled: isAuthenticated });

  const sendMutation = trpc.friends.send.useMutation({
    onSuccess: () => {
      setTarget("");
      setSendError("");
      setSendSuccess("Pedido enviado!");
      utils.friends.outgoing.invalidate();
      setTimeout(() => setSendSuccess(""), 3000);
    },
    onError: (err) => {
      setSendError(err.message);
      setSendSuccess("");
    },
  });

  const acceptMutation = trpc.friends.accept.useMutation({
    onSuccess: () => {
      utils.friends.incoming.invalidate();
      utils.friends.list.invalidate();
    },
  });

  const rejectMutation = trpc.friends.reject.useMutation({
    onSuccess: () => {
      utils.friends.incoming.invalidate();
    },
  });

  const removeMutation = trpc.friends.remove.useMutation({
    onSuccess: () => {
      utils.friends.list.invalidate();
    },
  });

  const handleSend = () => {
    const trimmed = target.trim();
    if (!trimmed) {
      setSendError("Digite o nome ou ID do usuário.");
      return;
    }
    setSendError("");
    setSendSuccess("");
    const numericId = Number(trimmed);
    if (!Number.isNaN(numericId) && Number.isFinite(numericId)) {
      sendMutation.mutate({ recipientId: numericId });
    } else {
      sendMutation.mutate({ recipientName: trimmed });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const isLoading = loadingIncoming || loadingOutgoing || loadingFriends;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">👥 Amigos</h1>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="min-h-[44px]"
          >
            🏠 Voltar
          </Button>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 pb-4">
              {!isAuthenticated ? (
                <Card className="bg-gray-800 border-purple-400/30">
                  <CardContent className="pt-6 pb-6 text-center">
                    <p className="text-lg font-semibold text-gray-200 mb-2">
                      Faça login para adicionar amigos
                    </p>
                    <p className="text-sm text-gray-400">
                      Você precisa estar logado para enviar pedidos de amizade e ver sua lista de amigos.
                    </p>
                  </CardContent>
                </Card>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
                </div>
              ) : (
                <>
                  <Card className="bg-gray-800 border-purple-400/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-gray-300">
                        Adicionar amigo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nome do usuário ou ID"
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={sendMutation.isPending}
                          className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[44px]"
                        />
                        <Button
                          onClick={handleSend}
                          disabled={sendMutation.isPending || !target.trim()}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[44px] shrink-0"
                        >
                          {sendMutation.isPending ? "..." : "Enviar"}
                        </Button>
                      </div>
                      {sendError && (
                        <p className="text-xs text-red-400 mt-2">{sendError}</p>
                      )}
                      {sendSuccess && (
                        <p className="text-xs text-green-400 mt-2">{sendSuccess}</p>
                      )}
                    </CardContent>
                  </Card>

                  {incoming && incoming.length > 0 && (
                    <Card className="bg-gray-800 border-purple-400/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-300">
                          Pedidos recebidos ({incoming.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {incoming.map((req) => (
                            <div
                              key={req.id}
                              className="flex items-center justify-between gap-3 p-3 bg-gray-700 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-semibold text-gray-200">
                                  {req.senderName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white min-h-[36px]"
                                  onClick={() => acceptMutation.mutate({ requestId: req.id })}
                                  disabled={acceptMutation.isPending}
                                >
                                  Aceitar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:bg-gray-600 min-h-[36px]"
                                  onClick={() => rejectMutation.mutate({ requestId: req.id })}
                                  disabled={rejectMutation.isPending}
                                >
                                  Recusar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {outgoing && outgoing.length > 0 && (
                    <Card className="bg-gray-800 border-purple-400/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-300">
                          Pedidos enviados ({outgoing.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {outgoing.map((req) => (
                            <div
                              key={req.id}
                              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-semibold text-gray-200">
                                  {req.recipientName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Aguardando resposta
                                </p>
                              </div>
                              <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                                Pendente
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gray-800 border-purple-400/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-gray-300">
                        Seus amigos ({friends?.length ?? 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!friends || friends.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                          Nenhum amigo ainda. Envie um pedido de amizade!
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {friends.map((f) => {
                            const friendName =
                              f.senderId === user?.id ? f.recipientName : f.senderName;
                            return (
                              <div
                                key={f.id}
                                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                              >
                                <p className="text-sm font-semibold text-gray-200">
                                  {friendName}
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300 min-h-[36px]"
                                  onClick={() => removeMutation.mutate({ requestId: f.id })}
                                  disabled={removeMutation.isPending}
                                >
                                  Remover
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
