import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { loadGameState, updateGameState } from "@/lib/game-save";
import type { GameState } from "@/types/game";
import shopItems from "@shared/shop-items.json";

const verityAnimations = `
@keyframes verity-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-12px) scale(1.05); }
}

@keyframes verity-shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  10% { transform: translateX(-8px) rotate(-5deg); }
  20% { transform: translateX(8px) rotate(5deg); }
  30% { transform: translateX(-6px) rotate(-3deg); }
  40% { transform: translateX(6px) rotate(3deg); }
  50% { transform: translateX(-4px) rotate(-2deg); }
  60% { transform: translateX(4px) rotate(2deg); }
  70% { transform: translateX(-2px) rotate(-1deg); }
  80% { transform: translateX(2px) rotate(1deg); }
  90% { transform: translateX(-1px) rotate(0deg); }
}

@keyframes verity-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(168, 85, 247, 0.3); }
  50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.6), 0 0 50px rgba(168, 85, 247, 0.2); }
}

@keyframes verity-angry-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.6), 0 0 50px rgba(239, 68, 68, 0.2); }
}

.animate-verity-bounce {
  animation: verity-bounce 0.8s ease-in-out infinite, verity-glow 2s ease-in-out infinite;
}

.animate-verity-shake {
  animation: verity-shake 0.5s ease-in-out infinite, verity-angry-glow 1s ease-in-out infinite;
}
`;

if (typeof document !== 'undefined') {
  const styleId = 'verity-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = verityAnimations;
    document.head.appendChild(style);
  }
}

type VerityState = "normal" | "talking" | "angry";

const VERITY_TIPS = [
  "🍎 Comidas aumentam a felicidade da capivara!",
  "⚡ Boosts te dão poderes especiais!",
  "👕 Roupas deixam sua capivara estilosa!",
  "💍 Acessórios são items raros e valiosos!",
  "💰 Complete quests diárias para ganhar mais moedas!",
  "🎵 Jogue FNF para ganhar moedas extras!",
  "🏆 Conquiste achievements para desbloquear items exclusivos!",
  "💎 Items lendários têm borda dourada brilhante!",
];

const VERITY_ANGRY_MESSAGES = [
  "😡 PARA DE CLICAR EM MIM!",
  "😤 Você já me clicou {count} vezes!",
  "💢 EU NÃO SOU BOTÃO!",
  "😠 Clica na loja, não em mim!",
  "🔥 Se me clicar mais uma vez...!",
  "💥 {count} CLIQUES?! Tá de sacanagem!",
];

const VERITY_CLICK_MESSAGES = [
  "😊 Oi! Clica nos itens da loja, não em mim!",
  "🍎 Quer uma dica? Compre frutas!",
  "👋 Ei! Eu sou decorativa!",
  "🙉 Para cócegas!",
  "😊 Tá me cutucando por quê?",
  "🙈 Isso faz cócegas!",
  "🎵 Clica no FNF pra ganhar moedas!",
  "💤 Eu tava dormindo...",
];

const VERITY_THANK_YOU_MESSAGES = [
  "🎉 Boa compra! A capivara vai adorar!",
  "✨ Excelente escolha!",
  "💖 Sua capivara ficou feliz!",
  "🌟 Compra perfeita!",
];

const VERITY_ACHIEVEMENT_MESSAGES = [
  "🏆 Conquista desbloqueada: Chato de Galocha!",
  "🎖️ Parabéns, você é oficialmente irritante!",
  "🏆 Achievement: Mão Boba!",
  "🥇 Troféu de Ouro: Cliquei 20x na Verity!",
];

function VerityHelper({ onPurchase }: { onPurchase: (callback: () => void) => void }) {
  const [verityState, setVerityState] = useState<VerityState>("normal");
  const [message, setMessage] = useState<string>("");
  const [showBubble, setShowBubble] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [achievementUnlocked, setAchievementUnlocked] = useState(false);
  const tipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onPurchase(() => {
      const thankYou = VERITY_THANK_YOU_MESSAGES[Math.floor(Math.random() * VERITY_THANK_YOU_MESSAGES.length)];
      setVerityState("talking");
      setMessage(thankYou);
      setShowBubble(true);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => {
        setShowBubble(false);
        setTimeout(() => { setVerityState(clickCount >= 20 ? "angry" : "normal"); setMessage(""); }, 300);
      }, 3000);
    });
  }, [onPurchase, clickCount]);

  useEffect(() => {
    tipTimerRef.current = setInterval(() => {
      if (verityState === "angry") return;
      const tip = VERITY_TIPS[Math.floor(Math.random() * VERITY_TIPS.length)];
      setVerityState("talking");
      setMessage(tip);
      setShowBubble(true);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => {
        setShowBubble(false);
        setTimeout(() => { setVerityState("normal"); setMessage(""); }, 300);
      }, 5000);
    }, 15000);
    return () => { if (tipTimerRef.current) clearInterval(tipTimerRef.current); };
  }, [verityState]);

  useEffect(() => {
    return () => {
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);

    if (newCount >= 20 && !achievementUnlocked) {
      setAchievementUnlocked(true);
      setVerityState("angry");
      const achievementMsg = VERITY_ACHIEVEMENT_MESSAGES[Math.floor(Math.random() * VERITY_ACHIEVEMENT_MESSAGES.length)];
      setMessage(achievementMsg);
      setShowBubble(true);
      try {
        const saved = localStorage.getItem('capyzen_game');
        if (saved) {
          const state = JSON.parse(saved);
          if (!state.verityAchievement) {
            state.verityAchievement = true;
            state.coins = (state.coins || 0) + 500;
            localStorage.setItem('capyzen_game', JSON.stringify(state));
          }
        }
      } catch {}
      messageTimerRef.current = setTimeout(() => {
        setShowBubble(false);
        setTimeout(() => {
          const angryMsg = VERITY_ANGRY_MESSAGES[Math.floor(Math.random() * VERITY_ANGRY_MESSAGES.length)].replace('{count}', String(newCount));
          setMessage(angryMsg);
          setShowBubble(true);
          setVerityState("angry");
        }, 300);
      }, 4000);
      return;
    }

    if (newCount >= 20) {
      setVerityState("angry");
      const angryMsg = VERITY_ANGRY_MESSAGES[Math.floor(Math.random() * VERITY_ANGRY_MESSAGES.length)].replace('{count}', String(newCount));
      setMessage(angryMsg);
      setShowBubble(true);
    } else {
      const clickMsg = VERITY_CLICK_MESSAGES[Math.floor(Math.random() * VERITY_CLICK_MESSAGES.length)];
      setVerityState("talking");
      setMessage(clickMsg);
      setShowBubble(true);
    }

    messageTimerRef.current = setTimeout(() => {
      setShowBubble(false);
      setTimeout(() => { setVerityState(newCount >= 20 ? "angry" : "normal"); setMessage(""); }, 300);
    }, 3000);
  }, [clickCount, achievementUnlocked]);

  const getImageSrc = () => {
    switch (verityState) {
      case "talking": return "/verity/talking.png";
      case "angry": return "/verity/angry.png";
      default: return "/verity/normal.png";
    }
  };

  const getBubbleStyle = () => {
    if (verityState === "angry") return "bg-red-500/20 border-red-500/50 text-red-200";
    return "bg-white/10 border-purple-500/50 text-purple-200";
  };

  const getAnimationClass = () => {
    if (verityState === "angry") return "animate-verity-shake";
    if (verityState === "talking") return "animate-verity-bounce";
    return "";
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {clickCount > 0 && clickCount < 20 && (
        <div className="text-xs text-white/50 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
          {clickCount}/20 cliques
        </div>
      )}
      {achievementUnlocked && (
        <div className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30 backdrop-blur-sm">
          🏆 +500 moedas!
        </div>
      )}
      <div
        className={`relative max-w-xs p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
          showBubble ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        } ${getBubbleStyle()}`}
      >
        <p className="text-sm font-bold">{message}</p>
        <div className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 border-b border-r"
          style={{
            backgroundColor: verityState === "angry" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)",
            borderColor: verityState === "angry" ? "rgba(239, 68, 68, 0.5)" : "rgba(168, 85, 247, 0.5)"
          }}
        />
      </div>
      <div
        onClick={handleClick}
        className={`w-[180px] h-[180px] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:scale-110 ${getAnimationClass()}`}
        title={clickCount < 20 ? "Clique na Verity!" : "Verity está brava!"}
      >
        <img
          src={getImageSrc()}
          alt="Verity Helper"
          className="w-full h-full object-contain transition-opacity duration-300"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 50;

type SortKey = "price-asc" | "price-desc" | "name-asc" | "name-desc";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ShopItem {
  id: number;
  name: string;
  icon: string;
  price: number;
  description: string;
  category: string;
}

const CATEGORIES = [
  { key: "Todos", icon: "🍔", label: "Todos" },
  { key: "Comida", icon: "🍎", label: "Comida" },
  { key: "Boost", icon: "⚡", label: "Boost" },
  { key: "Roupa", icon: "👕", label: "Roupa" },
  { key: "Acessório", icon: "💍", label: "Acessório" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Comida: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Boost: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Roupa: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Acessório": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

function getRarity(price: number): { label: string; border: string; glow: string; badge: string } {
  if (price <= 100) {
    return {
      label: "Common",
      border: "border-gray-500/40",
      glow: "",
      badge: "bg-gray-500/20 text-gray-300",
    };
  }
  if (price <= 500) {
    return {
      label: "Uncommon",
      border: "border-green-500/50",
      glow: "hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
      badge: "bg-green-500/20 text-green-300",
    };
  }
  if (price <= 1500) {
    return {
      label: "Rare",
      border: "border-blue-500/50",
      glow: "hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]",
      badge: "bg-blue-500/20 text-blue-300",
    };
  }
  if (price <= 3000) {
    return {
      label: "Epic",
      border: "border-purple-500/50",
      glow: "hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      badge: "bg-purple-500/20 text-purple-300",
    };
  }
  return {
    label: "Legendary",
    border: "border-yellow-400/60",
    glow: "hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]",
    badge: "bg-yellow-500/20 text-yellow-300",
  };
}

function CoinCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value === display) return;
    setAnimating(true);
    const direction = value > display ? 1 : -1;
    const diff = Math.abs(value - display);
    const steps = Math.min(diff, 30);
    const stepSize = diff / steps;
    let current = display;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += stepSize * direction;
      setDisplay(Math.round(current));
      if (step >= steps) {
        setDisplay(value);
        setAnimating(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [value, display]);

  return (
    <span
      className={`inline-block transition-transform ${
        animating ? "scale-110" : "scale-100"
      }`}
    >
      {display.toLocaleString("pt-BR")}
    </span>
  );
}

export default function Shop() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sortBy, setSortBy] = useState<SortKey>("price-asc");
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const verityPurchaseCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const state = loadGameState();
    if (state.playerName || state.capyName) {
      setGameState(state);
    } else {
      setGameState(null);
    }
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const buyItem = useCallback(
    (item: ShopItem) => {
      if (!gameState) return;

      if (gameState.coins < item.price) {
        addToast("Moedas insuficientes!", "error");
        return;
      }

      const updated = updateGameState({
        coins: gameState.coins - item.price,
        equippedItems: [...gameState.equippedItems, item.name],
      });
      setGameState(updated);
      addToast(`Comprou ${item.name}!`, "success");
      
      if (verityPurchaseCallbackRef.current) {
        verityPurchaseCallbackRef.current();
      }
    },
    [gameState, addToast]
  );

  const filteredItems = useMemo(() => {
    let items = shopItems.filter((item) => {
      const matchCategory =
        selectedCategory === "Todos" || item.category === selectedCategory;
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });

    switch (sortBy) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        break;
      case "name-desc":
        items.sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
        break;
    }

    return items;
  }, [selectedCategory, searchTerm, sortBy]);

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const stats = useMemo(() => {
    const total = shopItems.length;
    const avgPrice = Math.round(
      shopItems.reduce((sum, i) => sum + i.price, 0) / total
    );
    const byCat: Record<string, number> = {};
    for (const item of shopItems) {
      byCat[item.category] = (byCat[item.category] ?? 0) + 1;
    }
    return { total, avgPrice, byCat };
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🐹</div>
          <p className="text-slate-300 text-xl font-semibold">
            Nenhum jogo salvo encontrado
          </p>
          <p className="text-slate-500 text-sm">
            Crie um novo jogo antes de visitar a loja.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 text-lg rounded-xl">
              🐹 Criar Novo Jogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/fundo-da-loja.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl sm:text-6xl">🛍️</div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Loja CapyZen
                </h1>
                <p className="text-slate-400 text-sm sm:text-base">
                  {stats.total} itens disponíveis para sua capivara
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white rounded-xl"
                >
                  🐹 Jogo
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white rounded-xl"
                >
                  ⚙️ Admin
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Coins Display */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 sm:p-6 mb-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">💰</div>
              <div>
                <p className="text-slate-400 text-sm">Suas Moedas</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-yellow-400">
                  <CoinCounter value={gameState.coins} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span>Nível {gameState.level}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-400">✨</span>
                <span>{gameState.equippedItems.length} itens equipados</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm border animate-in slide-in-from-right-5 fade-in-0 duration-300 ${
                toast.type === "success"
                  ? "bg-green-500/90 border-green-400/50 text-white"
                  : "bg-red-500/90 border-red-400/50 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{toast.type === "success" ? "✅" : "❌"}</span>
                <span className="font-medium">{toast.message}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              🔍
            </div>
            <input
              type="text"
              placeholder="Pesquisar itens..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 transition-all"
          >
            <option value="price-asc" className="bg-gray-800">
              💰 Preço (menor)
            </option>
            <option value="price-desc" className="bg-gray-800">
              💰 Preço (maior)
            </option>
            <option value="name-asc" className="bg-gray-800">
              🔤 Nome (A-Z)
            </option>
            <option value="name-desc" className="bg-gray-800">
              🔤 Nome (Z-A)
            </option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
                {cat.key !== "Todos" && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20"
                        : "bg-white/10"
                    }`}
                  >
                    {stats.byCat[cat.key] ?? 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Items Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-slate-400 text-sm">
            A mostrar{" "}
            <span className="text-white font-medium">
              {displayedItems.length}
            </span>{" "}
            de{" "}
            <span className="text-white font-medium">
              {filteredItems.length}
            </span>{" "}
            itens
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Limpar pesquisa
            </button>
          )}
        </div>

        {/* Items Grid */}
        {displayedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedItems.map((item) => {
                const rarity = getRarity(item.price);
                const catColor =
                  CATEGORY_COLORS[item.category] ??
                  "bg-gray-500/20 text-gray-300 border-gray-500/30";
                const isHovered = hoveredItem === item.id;
                const canAfford = gameState.coins >= item.price;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group relative bg-white/5 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 ${
                      rarity.border
                    } ${rarity.glow} ${
                      isHovered ? "scale-[1.02] border-opacity-80" : ""
                    }`}
                  >
                    {/* Legendary shimmer */}
                    {item.price > 3000 && (
                      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
                      </div>
                    )}

                    {/* Rarity & Category Badges */}
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-lg border ${catColor}`}
                      >
                        {item.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-lg ${rarity.badge}`}
                      >
                        {rarity.label}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="text-center mb-3">
                      <div
                        className={`text-5xl transition-transform duration-300 ${
                          isHovered ? "scale-110" : ""
                        }`}
                      >
                        {item.icon}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-white text-lg mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 h-10">
                        {item.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex justify-center mb-4">
                      <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-lg">
                        <span className="text-yellow-400">💰</span>
                        <span className="text-yellow-400 font-bold text-lg">
                          {item.price.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    {/* Buy Button */}
                    <Button
                      onClick={() => buyItem(item)}
                      disabled={!canAfford}
                      className={`w-full rounded-xl font-semibold transition-all duration-200 ${
                        canAfford
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                          : "bg-white/5 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? "Comprar" : "Sem moedas"}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() =>
                    setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
                  }
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-semibold transition-all"
                >
                  Carregar mais ({filteredItems.length - visibleCount}{" "}
                  restantes)
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Nenhum item encontrado
            </h3>
            <p className="text-slate-400 mb-6">
              Tente mudar os filtros ou pesquisar por outro termo.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todos");
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-xl"
            >
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Stats Bar */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mt-8 rounded-2xl">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Estatísticas da Loja
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-blue-400">
                {stats.total}
              </p>
              <p className="text-slate-400 text-sm">Total de Itens</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-orange-400">
                {stats.byCat["Comida"] ?? 0}
              </p>
              <p className="text-slate-400 text-sm">Comidas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-purple-400">
                {stats.byCat["Boost"] ?? 0}
              </p>
              <p className="text-slate-400 text-sm">Boosts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-pink-400">
                {stats.byCat["Roupa"] ?? 0}
              </p>
              <p className="text-slate-400 text-sm">Roupas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-cyan-400">
                {stats.byCat["Acessório"] ?? 0}
              </p>
              <p className="text-slate-400 text-sm">Acessórios</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-yellow-400">
                💰 {stats.avgPrice.toLocaleString("pt-BR")}
              </p>
              <p className="text-slate-400 text-sm">Preço Médio</p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 text-slate-500 text-sm">
          <p>
            CapyZen Shop &mdash; {stats.total} itens para sua capivara ficar
            feliz! 🐹
          </p>
        </div>
      </div>

      <VerityHelper
        onPurchase={(callback) => {
          verityPurchaseCallbackRef.current = callback;
        }}
      />
    </div>
  );
}
