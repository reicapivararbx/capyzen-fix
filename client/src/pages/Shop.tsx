import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

const SHOP_ITEMS = [
  { id: 1, name: "Maçã Dourada", icon: "🍎", price: 50, description: "Alimenta muito bem" },
  { id: 2, name: "Bola de Brinquedo", icon: "🎾", price: 75, description: "Aumenta felicidade" },
  { id: 3, name: "Cama Confortável", icon: "🛏️", price: 150, description: "Melhora o descanso" },
  { id: 4, name: "Poção de Energia", icon: "⚡", price: 100, description: "Restaura energia" },
  { id: 5, name: "Peixe Fresco", icon: "🐟", price: 80, description: "Alimento premium" },
  { id: 6, name: "Cenoura Mágica", icon: "🥕", price: 60, description: "Aumenta saúde" },
  { id: 7, name: "Melancia Gelada", icon: "🍉", price: 70, description: "Refresca a capivara" },
  { id: 8, name: "Bolo de Chocolate", icon: "🍰", price: 120, description: "Muito delicioso!" },
  { id: 9, name: "Morango Doce", icon: "🍓", price: 55, description: "Fruta deliciosa" },
  { id: 10, name: "Abacaxi Tropical", icon: "🍍", price: 90, description: "Exótico e saudável" },
  { id: 11, name: "Banana Amarela", icon: "🍌", price: 45, description: "Clássica e nutritiva" },
  { id: 12, name: "Uva Roxa", icon: "🍇", price: 65, description: "Pequena mas poderosa" },
];

export default function Shop() {
  const [gameState, setGameState] = useState<any>(null);
  const [notification, setNotification] = useState("");

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
            <p className="text-slate-400">Compre itens para sua capivara</p>
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
        <div className="max-w-7xl mx-auto mb-4 p-4 bg-slate-700 border border-slate-600 rounded-lg text-center">
          {notification}
        </div>
      )}

      {/* Shop Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_ITEMS.map((item) => (
          <Card
            key={item.id}
            className="bg-slate-800 border-slate-700 p-6 hover:border-blue-500 transition-colors"
          >
            <div className="text-center">
              <div className="text-5xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{item.description}</p>

              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-yellow-400">
                  💰 {item.price}
                </span>
              </div>

              <Button
                onClick={() => buyItem(item)}
                disabled={gameState.player.coins < item.price}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                Comprar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
