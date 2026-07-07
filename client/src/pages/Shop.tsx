import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

// Gerar 1000 itens dinamicamente
function generateShopItems() {
  const items = [];
  let id = 1;

  // COMIDAS (400 itens)
  const foods = [
    { name: "Maçã", icon: "🍎", basePrice: 50 },
    { name: "Banana", icon: "🍌", basePrice: 45 },
    { name: "Laranja", icon: "🍊", basePrice: 55 },
    { name: "Morango", icon: "🍓", basePrice: 60 },
    { name: "Melancia", icon: "🍉", basePrice: 70 },
    { name: "Abacaxi", icon: "🍍", basePrice: 90 },
    { name: "Uva", icon: "🍇", basePrice: 65 },
    { name: "Pêssego", icon: "🍑", basePrice: 75 },
    { name: "Pera", icon: "🍐", basePrice: 50 },
    { name: "Cereja", icon: "🍒", basePrice: 55 },
    { name: "Limão", icon: "🍋", basePrice: 40 },
    { name: "Coco", icon: "🥥", basePrice: 85 },
    { name: "Melão", icon: "🍈", basePrice: 80 },
    { name: "Kiwi", icon: "🥝", basePrice: 70 },
    { name: "Manga", icon: "🥭", basePrice: 75 },
    { name: "Peixe", icon: "🐟", basePrice: 100 },
    { name: "Camarão", icon: "🦐", basePrice: 120 },
    { name: "Caranguejo", icon: "🦀", basePrice: 150 },
    { name: "Cenoura", icon: "🥕", basePrice: 35 },
    { name: "Milho", icon: "🌽", basePrice: 40 },
  ];

  for (let i = 0; i < 20; i++) {
    for (let j = 1; j <= 20; j++) {
      items.push({
        id: id++,
        name: `${foods[i].name} ${j}`,
        icon: foods[i].icon,
        price: foods[i].basePrice + j * 5,
        description: `Alimento delicioso #${j}`,
        category: "Comida",
      });
    }
  }

  // BOOSTS (300 itens)
  const boosts = [
    { name: "Poção de Energia", icon: "⚡", basePrice: 100 },
    { name: "Poção de Felicidade", icon: "💖", basePrice: 120 },
    { name: "Poção de Saúde", icon: "💊", basePrice: 150 },
    { name: "Elixir Mágico", icon: "🧪", basePrice: 200 },
    { name: "Cristal Brilhante", icon: "💎", basePrice: 250 },
    { name: "Estrela Dourada", icon: "⭐", basePrice: 180 },
    { name: "Chama Sagrada", icon: "🔥", basePrice: 160 },
    { name: "Gelo Eterno", icon: "❄️", basePrice: 140 },
    { name: "Vento Místico", icon: "💨", basePrice: 130 },
    { name: "Terra Antiga", icon: "🪨", basePrice: 110 },
    { name: "Água Pura", icon: "💧", basePrice: 90 },
    { name: "Luz Celestial", icon: "✨", basePrice: 170 },
    { name: "Sombra Negra", icon: "🌑", basePrice: 190 },
    { name: "Raio Divino", icon: "⚡", basePrice: 210 },
    { name: "Trovão Ancestral", icon: "🌩️", basePrice: 220 },
  ];

  for (let i = 0; i < 15; i++) {
    for (let j = 1; j <= 20; j++) {
      items.push({
        id: id++,
        name: `${boosts[i].name} ${j}`,
        icon: boosts[i].icon,
        price: boosts[i].basePrice + j * 10,
        description: `Boost poderoso #${j}`,
        category: "Boost",
      });
    }
  }

  // ROUPAS (200 itens)
  const clothes = [
    { name: "Camiseta Vermelha", icon: "👕", basePrice: 75 },
    { name: "Camiseta Azul", icon: "👕", basePrice: 75 },
    { name: "Camiseta Verde", icon: "👕", basePrice: 75 },
    { name: "Jaqueta de Couro", icon: "🧥", basePrice: 150 },
    { name: "Suéter Quentinho", icon: "🧶", basePrice: 100 },
    { name: "Calça Jeans", icon: "👖", basePrice: 120 },
    { name: "Shorts Confortável", icon: "🩳", basePrice: 80 },
    { name: "Vestido Elegante", icon: "👗", basePrice: 180 },
    { name: "Saia Colorida", icon: "👗", basePrice: 110 },
    { name: "Terno Formal", icon: "🤵", basePrice: 250 },
  ];

  for (let i = 0; i < 10; i++) {
    for (let j = 1; j <= 20; j++) {
      items.push({
        id: id++,
        name: `${clothes[i].name} ${j}`,
        icon: clothes[i].icon,
        price: clothes[i].basePrice + j * 8,
        description: `Roupa estilosa #${j}`,
        category: "Roupa",
      });
    }
  }

  // ACESSÓRIOS (100 itens)
  const accessories = [
    { name: "Óculos Escuros", icon: "😎", basePrice: 80 },
    { name: "Chapéu de Festa", icon: "🎩", basePrice: 60 },
    { name: "Coroa Dourada", icon: "👑", basePrice: 200 },
    { name: "Colar de Ouro", icon: "📿", basePrice: 150 },
    { name: "Anel Brilhante", icon: "💍", basePrice: 120 },
    { name: "Pulseira Mágica", icon: "⌚", basePrice: 100 },
    { name: "Brinco de Diamante", icon: "💎", basePrice: 140 },
    { name: "Lenço Colorido", icon: "🧣", basePrice: 50 },
    { name: "Bolsa de Couro", icon: "👜", basePrice: 110 },
    { name: "Sapato Elegante", icon: "👞", basePrice: 130 },
  ];

  for (let i = 0; i < 10; i++) {
    for (let j = 1; j <= 10; j++) {
      items.push({
        id: id++,
        name: `${accessories[i].name} ${j}`,
        icon: accessories[i].icon,
        price: accessories[i].basePrice + j * 5,
        description: `Acessório especial #${j}`,
        category: "Acessório",
      });
    }
  }

  return items;
}

const SHOP_ITEMS = generateShopItems();

export default function Shop() {
  const [gameState, setGameState] = useState<any>(null);
  const [notification, setNotification] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

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
    };

    setGameState(updated);
    localStorage.setItem("capyzen_game", JSON.stringify(updated));
    setNotification(`✅ Comprou ${item.name}!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const filteredItems = SHOP_ITEMS.filter((item) => {
    const matchCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

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
            <Link href="/">
              <Button variant="outline">🐹 Jogo</Button>
            </Link>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
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
              <p className="text-2xl font-bold text-blue-400">{SHOP_ITEMS.length}</p>
            </div>
            <div>
              <p className="text-slate-400">Comidas</p>
              <p className="text-2xl font-bold text-orange-400">
                {SHOP_ITEMS.filter((i) => i.category === "Comida").length}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Boosts</p>
              <p className="text-2xl font-bold text-purple-400">
                {SHOP_ITEMS.filter((i) => i.category === "Boost").length}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Roupas</p>
              <p className="text-2xl font-bold text-pink-400">
                {SHOP_ITEMS.filter((i) => i.category === "Roupa").length}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Acessórios</p>
              <p className="text-2xl font-bold text-cyan-400">
                {SHOP_ITEMS.filter((i) => i.category === "Acessório").length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
