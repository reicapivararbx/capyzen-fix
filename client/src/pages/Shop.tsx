import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import shopItems from "@shared/shop-items.json";

const ITEMS_PER_PAGE = 50;

export default function Shop() {
  const [gameState, setGameState] = useState<any>(null);
  const [notification, setNotification] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("capyzen_game");
      if (saved) {
        setGameState(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    }
  }, []);

  const buyItem = (item: any) => {
    if (!gameState) return;

    if (gameState.player.coins < item.price) {
      setNotification("❌ Moedas insuficientes!");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const updated = {
      ...gameState,
      player: {
        ...gameState.player,
        coins: gameState.player.coins - item.price,
      },
      capybara: {
        ...gameState.capybara,
        equippedItems: [...gameState.capybara.equippedItems, item.name],
      },
    };

    setGameState(updated);
    localStorage.setItem("capyzen_game", JSON.stringify(updated));
    setNotification(`✅ Comprou ${item.name}! A capivara está usando agora!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const filteredItems = shopItems.filter((item) => {
    const matchCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const categories = ["Todos", "Comida", "Boost", "Roupa", "Acessório"];

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">🛍️ Loja</h1>
            <p className="text-slate-400">Compre itens para sua capivara (1000+ itens disponíveis!)</p>
          </div>
          <nav className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/'}>🐹 Jogo</Button>
            <Link href="/admin">
              <Button variant="outline">⚙️ Admin</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Coins Display */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Suas Moedas</h2>
            <div className="text-3xl font-bold text-yellow-400">
              💰 {gameState.player.coins}
            </div>
          </div>
        </Card>
      </div>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto mb-6">
          <Card className="bg-slate-700 border-slate-600 p-4">
            <p className="text-center text-lg">{notification}</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">🔍 Filtros</h3>
            <input
              type="text"
              placeholder="Procurar item..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={
                  selectedCategory === cat
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-700 hover:bg-slate-600"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto">
        <p className="text-slate-400 text-sm mb-4">
          A mostrar {displayedItems.length} de {filteredItems.length} itens
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedItems.map((item) => (
            <Card
              key={item.id}
              className="bg-slate-800 border-slate-700 p-4 hover:border-blue-500 transition"
            >
              <div className="text-center">
                <div className="text-5xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-yellow-400 font-bold">💰 {item.price}</span>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
                <Button
                  onClick={() => buyItem(item)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Comprar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
            >
              Carregar mais...
            </Button>
          </div>
        )}

        {filteredItems.length === 0 && (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400 text-xl">Nenhum item encontrado</p>
          </Card>
        )}

        {/* Stats */}
        <Card className="bg-slate-800 border-slate-700 p-6 mt-8">
          <h3 className="font-bold mb-4">📊 Estatísticas da Loja</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-slate-400">Total de Itens</p>
              <p className="text-2xl font-bold text-blue-400">{shopItems.length}</p>
            </div>
            <div>
              <p className="text-slate-400">Comidas</p>
              <p className="text-2xl font-bold text-orange-400">
                {shopItems.filter((i) => i.category === "Comida").length}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Boosts</p>
              <p className="text-2xl font-bold text-purple-400">
                {shopItems.filter((i) => i.category === "Boost").length}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Roupas</p>
              <p className="text-2xl font-bold text-pink-400">
                {shopItems.filter((i) => i.category === "Roupa").length}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Acessórios</p>
              <p className="text-2xl font-bold text-cyan-400">
                {shopItems.filter((i) => i.category === "Acessório").length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
