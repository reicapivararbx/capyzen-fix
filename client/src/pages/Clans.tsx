import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Clans() {
  const { isAuthenticated } = useAuth({});
  const utils = trpc.useUtils();

  const { data: myClanData, isLoading: loadingMine } = trpc.clans.mine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: searchResults, isLoading: loadingSearch } = trpc.clans.search.useQuery(undefined, { enabled: isAuthenticated });
  const { data: invites } = trpc.clans.invites.useQuery(undefined, { enabled: isAuthenticated });

  const clanId = myClanData?.clan.id ?? 0;
  const { data: members } = trpc.clans.members.useQuery({ clanId }, { enabled: !!myClanData });

  const [createForm, setCreateForm] = useState({ name: "", tag: "", description: "", emblem: "🛡️", isPublic: true, minLevel: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ description: "", emblem: "", isPublic: true, minLevel: 1 });

  const createMutation = trpc.clans.create.useMutation({
    onSuccess: () => {
      toast.success("Clã criado!");
      setShowCreate(false);
      setCreateForm({ name: "", tag: "", description: "", emblem: "🛡️", isPublic: true, minLevel: 1 });
      utils.clans.mine.invalidate();
      utils.clans.search.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const leaveMutation = trpc.clans.leave.useMutation({
    onSuccess: () => {
      toast.success("Você saiu do clã");
      utils.clans.mine.invalidate();
      utils.clans.search.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const disbandMutation = trpc.clans.disband.useMutation({
    onSuccess: () => {
      toast.success("Clã dissolvido");
      utils.clans.mine.invalidate();
      utils.clans.search.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const kickMutation = trpc.clans.kick.useMutation({
    onSuccess: () => {
      toast.success("Membro expulso");
      utils.clans.members.invalidate({ clanId });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const setRoleMutation = trpc.clans.setRole.useMutation({
    onSuccess: () => {
      utils.clans.members.invalidate({ clanId });
    },
  });

  const transferMutation = trpc.clans.transferLeadership.useMutation({
    onSuccess: () => {
      toast.success("Liderança transferida!");
      utils.clans.mine.invalidate();
      utils.clans.members.invalidate({ clanId });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const inviteMutation = trpc.clans.invite.useMutation({
    onSuccess: () => {
      toast.success("Convite enviado!");
      setInviteName("");
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const acceptInviteMutation = trpc.clans.acceptInvite.useMutation({
    onSuccess: () => {
      toast.success("Convite aceito!");
      utils.clans.mine.invalidate();
      utils.clans.invites.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const declineInviteMutation = trpc.clans.declineInvite.useMutation({
    onSuccess: () => {
      utils.clans.invites.invalidate();
    },
  });

  const joinMutation = trpc.clans.join.useMutation({
    onSuccess: () => {
      toast.success("Você entrou no clã!");
      utils.clans.mine.invalidate();
      utils.clans.search.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const updateSettingsMutation = trpc.clans.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações atualizadas!");
      setShowSettings(false);
      utils.clans.mine.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const handleCreate = () => {
    createMutation.mutate({
      name: createForm.name.trim(),
      tag: createForm.tag.trim().toUpperCase(),
      description: createForm.description.trim() || undefined,
      emblem: createForm.emblem.trim() || undefined,
      isPublic: createForm.isPublic,
      minLevel: createForm.minLevel,
    });
  };

  const handleUpdateSettings = () => {
    updateSettingsMutation.mutate({
      clanId,
      description: settingsForm.description.trim() || undefined,
      emblem: settingsForm.emblem.trim() || undefined,
      isPublic: settingsForm.isPublic,
      minLevel: settingsForm.minLevel,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-3">🏰</span>
          <p className="text-lg font-semibold text-gray-200 mb-2">Faça login para gerenciar clãs</p>
          <Button onClick={() => (window.location.href = "/")} variant="outline" className="min-h-[44px] mt-3">🏠 Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col min-h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">🏰 Clãs</h1>
          <Button onClick={() => (window.location.href = "/")} variant="outline" className="min-h-[44px]">🏠 Voltar</Button>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 pb-4">
              {loadingMine ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
                </div>
              ) : myClanData ? (
                <>
                  <Card className="bg-gray-800 border-purple-400/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{myClanData.clan.emblem}</span>
                        <div>
                          <CardTitle className="text-lg">{myClanData.clan.name}</CardTitle>
                          <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">[{myClanData.clan.tag}]</span>
                          <span className="text-xs text-gray-400 ml-2">Seu cargo: {myClanData.role === "leader" ? "👑 Líder" : myClanData.role === "officer" ? "⭐ Oficial" : "Membro"}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {myClanData.clan.description && (
                        <p className="text-sm text-gray-300">{myClanData.clan.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>💰 {myClanData.clan.coins} moedas</span>
                        <span>👥 {members?.length ?? 0} membros</span>
                        <span>{myClanData.clan.isPublic ? "🌍 Público" : "🔒 Privado"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {myClanData.role === "leader" && (
                          <>
                            <Button size="sm" variant="outline" className="border-gray-600 min-h-[36px]" onClick={() => { setSettingsForm({ description: myClanData.clan.description ?? "", emblem: myClanData.clan.emblem, isPublic: myClanData.clan.isPublic, minLevel: myClanData.clan.minLevel }); setShowSettings(true); }}>⚙️ Configurações</Button>
                            <Button size="sm" variant="outline" className="text-red-400 border-red-400/30 hover:bg-red-400/10 min-h-[36px]" disabled={disbandMutation.isPending} onClick={() => { if (confirm("Dissolver o clã? Esta ação não pode ser desfeita.")) disbandMutation.mutate({ clanId: myClanData.clan.id }); }}>💀 Dissolver</Button>
                          </>
                        )}
                        {myClanData.role !== "leader" && (
                          <Button size="sm" variant="outline" className="text-orange-400 border-orange-400/30 hover:bg-orange-400/10 min-h-[36px]" disabled={leaveMutation.isPending} onClick={() => { if (confirm("Sair do clã?")) leaveMutation.mutate(); }}>🚪 Sair</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {showSettings && (
                    <Card className="bg-gray-800 border-purple-400/30">
                      <CardHeader className="pb-3"><CardTitle className="text-base text-gray-300">⚙️ Configurações</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400">Descrição</label>
                          <Textarea value={settingsForm.description} onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })} className="bg-gray-700 border-gray-600 text-white mt-1" maxLength={200} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Emblema (emoji)</label>
                          <Input value={settingsForm.emblem} onChange={(e) => setSettingsForm({ ...settingsForm, emblem: e.target.value })} className="bg-gray-700 border-gray-600 text-white mt-1" maxLength={10} />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">Público</label>
                          <Select value={settingsForm.isPublic ? "sim" : "nao"} onValueChange={(v) => setSettingsForm({ ...settingsForm, isPublic: v === "sim" })}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sim">Sim</SelectItem>
                              <SelectItem value="nao">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Nível mínimo: {settingsForm.minLevel}</label>
                          <Input type="number" min={1} max={100} value={settingsForm.minLevel} onChange={(e) => setSettingsForm({ ...settingsForm, minLevel: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })} className="bg-gray-700 border-gray-600 text-white mt-1 w-24" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="border-gray-600 min-h-[36px]" onClick={() => setShowSettings(false)}>Cancelar</Button>
                          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[36px]" disabled={updateSettingsMutation.isPending} onClick={handleUpdateSettings}>{updateSettingsMutation.isPending ? "..." : "Salvar"}</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gray-800 border-purple-400/30">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-gray-300">Membros ({members?.length ?? 0})</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {members?.map((m: { userId: number; username: string | null; name: string | null; role: string; joinedAt: Date }) => (
                          <div key={m.userId} className="flex items-center justify-between gap-2 p-2.5 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                              <span>{m.role === "leader" ? "👑" : m.role === "officer" ? "⭐" : "👤"}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-200 truncate">{m.name ?? m.username ?? `ID: ${m.userId}`}</p>
                                <p className="text-xs text-gray-400">{m.role}</p>
                              </div>
                            </div>
                            {myClanData.role === "leader" && m.userId !== (members?.find((x: { role: string }) => x.role === "leader")?.userId) && (
                              <div className="flex gap-1 shrink-0">
                                <Select
                                  value={m.role === "officer" ? "officer" : "member"}
                                  onValueChange={(v) => setRoleMutation.mutate({ clanId, targetUserId: m.userId, role: v as "officer" | "member" })}
                                >
                                  <SelectTrigger className="bg-gray-600 border-gray-500 text-white h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">Membro</SelectItem>
                                    <SelectItem value="officer">Oficial</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button size="sm" variant="outline" className="text-red-400 border-red-400/30 hover:bg-red-400/10 h-8 px-2" disabled={kickMutation.isPending} onClick={() => kickMutation.mutate({ clanId, targetUserId: m.userId })}>Expulsar</Button>
                                <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10 h-8 px-2" disabled={transferMutation.isPending} onClick={() => { if (confirm("Transferir liderança?")) transferMutation.mutate({ clanId, newLeaderId: m.userId }); }}>👑</Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-purple-400/30">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-gray-300">Convidar jogador</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Input placeholder="Nome do jogador" value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="bg-gray-700 border-gray-600 text-white min-h-[44px]" disabled={inviteMutation.isPending} />
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[44px] shrink-0" disabled={inviteMutation.isPending || !inviteName.trim()} onClick={() => inviteMutation.mutate({ clanId, targetName: inviteName.trim() })}>{inviteMutation.isPending ? "..." : "Convidar"}</Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {showCreate ? (
                    <Card className="bg-gray-800 border-purple-400/30">
                      <CardHeader className="pb-3"><CardTitle className="text-base text-gray-300">Criar Clã</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400">Nome (3-20 caracteres)</label>
                          <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} maxLength={20} className="bg-gray-700 border-gray-600 text-white mt-1" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Tag (2-5 caracteres)</label>
                          <Input value={createForm.tag} onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value.toUpperCase() })} maxLength={5} className="bg-gray-700 border-gray-600 text-white mt-1" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Emblema</label>
                          <Input value={createForm.emblem} onChange={(e) => setCreateForm({ ...createForm, emblem: e.target.value })} maxLength={10} className="bg-gray-700 border-gray-600 text-white mt-1" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Descrição (opcional)</label>
                          <Textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} maxLength={200} className="bg-gray-700 border-gray-600 text-white mt-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">Público</label>
                          <Select value={createForm.isPublic ? "sim" : "nao"} onValueChange={(v) => setCreateForm({ ...createForm, isPublic: v === "sim" })}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sim">Sim</SelectItem>
                              <SelectItem value="nao">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Nível mínimo: {createForm.minLevel}</label>
                          <Input type="number" min={1} max={100} value={createForm.minLevel} onChange={(e) => setCreateForm({ ...createForm, minLevel: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })} className="bg-gray-700 border-gray-600 text-white mt-1 w-24" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" className="border-gray-600 min-h-[44px]" onClick={() => setShowCreate(false)}>Cancelar</Button>
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[44px]" disabled={createMutation.isPending || createForm.name.length < 3 || createForm.tag.length < 2} onClick={handleCreate}>{createMutation.isPending ? "..." : "Criar"}</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[48px] text-lg font-bold" onClick={() => setShowCreate(true)}>
                      🏰 Criar Clã
                    </Button>
                  )}

                  {invites && invites.filter((i: { status: string }) => i.status === "pending").length > 0 && (
                    <Card className="bg-gray-800 border-purple-400/30">
                      <CardHeader className="pb-3"><CardTitle className="text-base text-gray-300">Convites pendentes</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {invites.filter((i: { status: string }) => i.status === "pending").map((inv: { id: number; clanId: number; clanName: string; clanTag: string; clanEmblem: string; inviterId: number; inviterName: string | null; status: string; createdAt: Date }) => (
                            <div key={inv.id} className="flex items-center justify-between gap-2 p-3 bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{inv.clanEmblem}</span>
                                <div>
                                  <p className="text-sm font-semibold text-gray-200">{inv.clanName}</p>
                                  <p className="text-xs text-gray-400">[{inv.clanTag}] • por {inv.inviterName ?? "???"}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white min-h-[36px]" disabled={acceptInviteMutation.isPending} onClick={() => acceptInviteMutation.mutate({ inviteId: inv.id })}>Aceitar</Button>
                                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-600 min-h-[36px]" disabled={declineInviteMutation.isPending} onClick={() => declineInviteMutation.mutate({ inviteId: inv.id })}>Recusar</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gray-800 border-purple-400/30">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-gray-300">Clãs públicos</CardTitle></CardHeader>
                    <CardContent>
                      {loadingSearch ? (
                        <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>
                      ) : (
                        <div className="space-y-2">
                          {searchResults?.filter((c: { isPublic: boolean }) => c.isPublic).map((c: { id: number; name: string; tag: string; description: string | null; leaderId: number; coins: number; emblem: string; isPublic: boolean; minLevel: number; createdAt: Date; memberCount: number }) => (
                            <div key={c.id} className="flex items-center justify-between gap-3 p-3 bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{c.emblem}</span>
                                <div>
                                  <p className="text-sm font-semibold text-gray-200">{c.name} <span className="text-xs text-purple-400">[{c.tag}]</span></p>
                                  <p className="text-xs text-gray-400">👥 {c.memberCount} membros</p>
                                </div>
                              </div>
                              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[36px]" disabled={joinMutation.isPending} onClick={() => joinMutation.mutate({ clanId: c.id })}>Entrar</Button>
                            </div>
                          ))}
                          {searchResults?.filter((c: { isPublic: boolean }) => c.isPublic).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">Nenhum clã público ainda.</p>
                          )}
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
