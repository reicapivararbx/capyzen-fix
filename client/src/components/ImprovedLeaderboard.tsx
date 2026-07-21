import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import type { LeaderboardEntry, WeeklyLeaderboardEntry, FriendLeaderboardEntry, LeaderboardTab } from "@/types/game";

interface ImprovedLeaderboardProps {
  currentUsername?: string;
  onClose: () => void;
}

export function ImprovedLeaderboard({
  currentUsername,
  onClose,
}: ImprovedLeaderboardProps) {
  const { data: leaderboard, isLoading } = trpc.game.leaderboard.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const [activeTab, setActiveTab] = useState<LeaderboardTab>("global");
  const [sortBy, setSortBy] = useState<"score" | "level">("score");
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<WeeklyLeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<FriendLeaderboardEntry[]>([]);

  // Generate weekly leaderboard from global data
  useEffect(() => {
    if (!leaderboard) return;

    const now = Date.now();
    const weekStart = now - 7 * 24 * 60 * 60 * 1000;

    const weekly = leaderboard
      .filter((entry) => entry.timestamp >= weekStart)
      .map((entry) => ({
        ...entry,
        weekStart: weekStart,
      }));

    setWeeklyLeaderboard(weekly);
  }, [leaderboard]);

  // Generate friends leaderboard from localStorage
  useEffect(() => {
    try {
      const savedFriends = localStorage.getItem("capyzen_friends");
      if (savedFriends) {
        const friends = JSON.parse(savedFriends) as string[];
        const friendEntries: FriendLeaderboardEntry[] = friends.map((username) => ({
          username,
          score: 0,
          level: 1,
          isOnline: Math.random() > 0.7,
          lastSeen: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        }));
        setFriendsLeaderboard(friendEntries);
      }
    } catch {
      // Ignorar erro de parsing
    }
  }, []);

  const getSortedLeaderboard = () => {
    const data = activeTab === "global"
      ? leaderboard || []
      : activeTab === "weekly"
        ? weeklyLeaderboard
        : friendsLeaderboard;

    return [...data].sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      return b.level - a.level;
    });
  };

  const sortedLeaderboard = getSortedLeaderboard();

  const getMedalEmoji = (position: number) => {
    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return `${position + 1}º`;
  };

  const getLevelBadge = (level: number) => {
    if (level >= 50) return "👑";
    if (level >= 30) return "⭐";
    if (level >= 20) return "🌟";
    if (level >= 10) return "✨";
    return "🌱";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 1000000) return "💎";
    if (score >= 500000) return "🏆";
    if (score >= 100000) return "🎖️";
    if (score >= 50000) return "🎯";
    return "🎪";
  };

  const formatLastSeen = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 max-w-4xl w-full border-4 border-cyan-400 my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 mb-2">
            🏆 Ranking
          </h1>
          <p className="text-gray-600 font-semibold">
            Top capybaras do CapyZen 🐹
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 justify-center mb-6 flex-wrap">
          {(["global", "weekly", "friends"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-bold transition transform hover:scale-105 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab === "global" && "🌍 Global"}
              {tab === "weekly" && "📅 Semanal"}
              {tab === "friends" && "👥 Amigos"}
            </button>
          ))}
        </div>

        {/* Sort Filters */}
        <div className="flex gap-3 justify-center mb-8 flex-wrap">
          {(["score", "level"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSortBy(filter)}
              className={`px-6 py-2 rounded-full font-bold transition transform hover:scale-105 ${
                sortBy === filter
                  ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {filter === "score" && "📊 Score"}
              {filter === "level" && "⭐ Nível"}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-4">
          {isLoading ? (
            <div className="text-center text-gray-600 py-12">
              <p className="text-xl font-bold">⏳ Carregando ranking...</p>
            </div>
          ) : sortedLeaderboard.length > 0 ? (
            sortedLeaderboard.map((player, index) => {
              const isCurrentUser = currentUsername === player.username;
              return (
                <div
                  key={player.username}
                  className={`p-4 rounded-2xl border-2 transition transform hover:scale-102 ${
                    isCurrentUser
                      ? "bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 shadow-lg"
                      : "bg-white border-gray-200 hover:border-cyan-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Posição e Nome */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl font-bold w-12 text-center">
                        {getMedalEmoji(index)}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-800">
                          {player.username}
                          {isCurrentUser && " 👈 Você"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getLevelBadge(player.level)} Nível {player.level}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                        {getScoreBadge(player.score)} {player.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Score</div>
                    </div>

                    {/* Online Status (Friends tab only) */}
                    {activeTab === "friends" && "isOnline" in player && (
                      <div className="text-right ml-4">
                        <div className={`text-sm font-semibold ${player.isOnline ? "text-green-600" : "text-gray-500"}`}>
                          {player.isOnline ? "🟢 Online" : "🔴 Offline"}
                        </div>
                        {!player.isOnline && "lastSeen" in player && (
                          <div className="text-xs text-gray-500">
                            {formatLastSeen(player.lastSeen)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                      style={{
                        width: `${Math.min((player.score / 1000000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-600 py-12">
              <p className="text-xl font-bold mb-2">🐹 Nenhum jogador no ranking ainda</p>
              <p className="text-sm">
                {activeTab === "friends"
                  ? "Adicione amigos para ver o ranking deles!"
                  : "Comece a jogar para aparecer aqui!"}
              </p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {leaderboard && leaderboard.length > 0 && (
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {leaderboard.length}
                </div>
                <div className="text-sm text-gray-600">Jogadores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-600">
                  {Math.max(...leaderboard.map((p) => p.level))}
                </div>
                <div className="text-sm text-gray-600">Nível Máximo</div>
              </div>
            </div>
          </div>
        )}

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="w-full mt-8 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
        >
          ❌ Fechar Ranking
        </button>
      </div>
    </div>
  );
}