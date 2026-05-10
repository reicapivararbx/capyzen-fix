import { useRef, useState, useEffect } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stateRef = useRef<any>(null);

  // User system
  const [currentUser, setCurrentUser] = useState<{ username: string; password: string } | null>(() => {
    const saved = localStorage.getItem("capyzen_current_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  // Carregar estado do localStorage
  const [state, setState] = useState(() => {
    try {
      const userKey = currentUser ? `capyzen_state_${currentUser.username}` : "capyzen_state";
      const saved = localStorage.getItem(userKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Sempre garantir que alive é true ao carregar
          if (parsed) parsed.alive = true;
          return parsed || getInitialState();
        } catch {
          return getInitialState();
        }
      }
      return getInitialState();
    } catch {
      return getInitialState();
    }
  });

  function getInitialState() {
    return {
      coins: 0,
      level: 1,
      xp: 0,
      food: 0,
      poop: 0,
      hunger: 100,
      happy: 100,
      sus: 0,
      x: 150,
      y: 150,
      speed: 3,
      alive: true,
      capyColor: "#8B6914",
      capySize: 1,
      totalScore: 0,
      inventory: {
        grama: 0, batata: 0, hamburger: 0, refri: 0, feijao: 0, hotdog: 0,
        pizza: 0, sushi: 0, tacos: 0, sorvete: 0, bolo: 0, chocolate: 0,
        maçã: 0, banana: 0, melancia: 0, morango: 0, uva: 0, cenoura: 0,
        brócolis: 0, espinafre: 0, tomate: 0, queijo: 0, iogurte: 0, leite: 0,
        pão: 0, arroz: 0,
      },
    };
  }

  // Achievements
  const [achievements, setAchievements] = useState(() => {
    try {
      const userKey = currentUser ? `capyzen_achievements_${currentUser.username}` : "capyzen_achievements";
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const saved = localStorage.getItem("capyzen_leaderboard");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cooldown, setCooldown] = useState(false);
  const [susCooldown, setSusCooldown] = useState(false);
  const [message, setMessage] = useState("✨ Bem-vindo ao CapyZen! Clique em 'Trabalhar' para ganhar moedas!");
  const [selectedFood, setSelectedFood] = useState(() => {
    try {
      const userKey = currentUser ? `capyzen_selected_food_${currentUser.username}` : "capyzen_selected_food";
      const saved = localStorage.getItem(userKey);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [godMode, setGodMode] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [bugText, setBugText] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [minigameType, setMinigameType] = useState("");
  const [showCustomize, setShowCustomize] = useState(false);
  const [playerName, setPlayerName] = useState(() => {
    try {
      const userKey = currentUser ? `capyzen_player_name_${currentUser.username}` : "capyzen_player_name";
      return localStorage.getItem(userKey) || "Anônimo";
    } catch {
      return "Anônimo";
    }
  });
  const [minigameCooldown, setMinigameCooldown] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [closeAdminPassword, setCloseAdminPassword] = useState("");
  const [showCloseAdminPasswordPrompt, setShowCloseAdminPasswordPrompt] = useState(false);

  // Sincronizar stateRef com state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Garantir que a capivara está sempre viva (remover este useEffect pois agora está no lifeLoop)
  // useEffect(() => {
  //   if (!state.alive) {
  //     setState((prev: any) => ({ ...prev, alive: true }));
  //   }
  // }, []);

  // Salvar estado no localStorage
  useEffect(() => {
    const userKey = currentUser ? `capyzen_state_${currentUser.username}` : "capyzen_state";
    localStorage.setItem(userKey, JSON.stringify(state));
  }, [state, currentUser]);

  // Salvar comida selecionada
  useEffect(() => {
    const userKey = currentUser ? `capyzen_selected_food_${currentUser.username}` : "capyzen_selected_food";
    localStorage.setItem(userKey, String(selectedFood));
  }, [selectedFood, currentUser]);

  // Salvar achievements
  useEffect(() => {
    const userKey = currentUser ? `capyzen_achievements_${currentUser.username}` : "capyzen_achievements";
    localStorage.setItem(userKey, JSON.stringify(achievements));
  }, [achievements, currentUser]);

  // Salvar leaderboard
  useEffect(() => {
    localStorage.setItem("capyzen_leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Salvar player name
  useEffect(() => {
    const userKey = currentUser ? `capyzen_player_name_${currentUser.username}` : "capyzen_player_name";
    localStorage.setItem(userKey, playerName);
  }, [playerName, currentUser]);

  // Função para tocar sons
  const playSound = (type: "eat" | "work" | "levelup" | "achievement") => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case "eat":
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case "work":
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case "levelup":
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1000, now + 0.3);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case "achievement":
          osc.frequency.setValueAtTime(1000, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
      }
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  const foods = [
    { name: "🌱 Grama", poop: 0, hunger: 10, cost: 0 },
    { name: "🥔 Batata", poop: 2, hunger: 15, cost: 5 },
    { name: "🍔 Hamburger", poop: 5, hunger: 25, cost: 15 },
    { name: "🥤 Refri", poop: 20, hunger: 5, cost: 10 },
    { name: "🫘 Feijão", poop: 10, hunger: 20, cost: 8 },
    { name: "🌭 Hot Dog", poop: 8, hunger: 18, cost: 12 },
    { name: "🍕 Pizza", poop: 12, hunger: 30, cost: 20 },
    { name: "🍣 Sushi", poop: 3, hunger: 22, cost: 25 },
    { name: "🌮 Tacos", poop: 7, hunger: 20, cost: 14 },
    { name: "🍦 Sorvete", poop: 15, hunger: 12, cost: 18 },
    { name: "🎂 Bolo", poop: 18, hunger: 25, cost: 22 },
    { name: "🍫 Chocolate", poop: 16, hunger: 10, cost: 16 },
    { name: "🍎 Maçã", poop: 1, hunger: 12, cost: 4 },
    { name: "🍌 Banana", poop: 2, hunger: 14, cost: 5 },
    { name: "🍉 Melancia", poop: 1, hunger: 16, cost: 6 },
    { name: "🍓 Morango", poop: 1, hunger: 11, cost: 7 },
    { name: "🍇 Uva", poop: 1, hunger: 13, cost: 6 },
    { name: "🥕 Cenoura", poop: 3, hunger: 14, cost: 5 },
    { name: "🥦 Brócolis", poop: 4, hunger: 16, cost: 6 },
    { name: "🍃 Espinafre", poop: 2, hunger: 15, cost: 5 },
    { name: "🍅 Tomate", poop: 2, hunger: 12, cost: 4 },
    { name: "🧀 Queijo", poop: 6, hunger: 18, cost: 10 },
    { name: "🥛 Iogurte", poop: 5, hunger: 14, cost: 8 },
    { name: "🥛 Leite", poop: 4, hunger: 16, cost: 7 },
    { name: "🍞 Pão", poop: 5, hunger: 17, cost: 6 },
    { name: "🍚 Arroz", poop: 6, hunger: 19, cost: 8 },
  ];

  const games = [
    { name: "🎮 Brawl Stars", level: 1, cost: 50 },
    { name: "🎮 Roblox", level: 3, cost: 100 },
    { name: "🎮 Gacha Life", level: 5, cost: 150 },
    { name: "🎮 Minecraft", level: 2, cost: 80 },
    { name: "🎮 Fortnite", level: 4, cost: 120 },
    { name: "🎮 Among Us", level: 2, cost: 60 },
    { name: "🎮 Clash Royale", level: 3, cost: 90 },
    { name: "🎮 Candy Crush", level: 1, cost: 40 },
  ];

  const achievementsList = [
    { id: "first_work", name: "🏆 Primeiro Trabalho", description: "Trabalhe pela primeira vez" },
    { id: "first_feed", name: "🍽️ Primeira Refeição", description: "Alimente a capivara" },
    { id: "level_5", name: "⭐ Nível 5", description: "Alcance nível 5" },
    { id: "level_10", name: "⭐⭐ Nível 10", description: "Alcance nível 10" },
    { id: "rich", name: "💰 Milionário", description: "Ganhe 1000 moedas" },
    { id: "happy", name: "😄 Muito Feliz", description: "Deixe a capivara com 100% de felicidade" },
    { id: "fed", name: "🍔 Bem Alimentado", description: "Deixe a capivara com 100% de fome" },
    { id: "clean", name: "🚽 Limpo", description: "Reduza o coco para 0" },
    { id: "gamer", name: "🎮 Gamer", description: "Jogue 5 minigames" },
    { id: "collector", name: "🎁 Colecionador", description: "Coma 10 tipos diferentes de comida" },
    { id: "speedrun", name: "⚡ Speedrun", description: "Alcance nível 5 em menos de 5 minutos" },
    { id: "survivor", name: "🧟 Sobrevivente", description: "Mantenha a capivara viva por 10 minutos" },
    { id: "rich_2", name: "💎 Bilionário", description: "Ganhe 10000 moedas" },
    { id: "level_20", name: "🌟 Lenda", description: "Alcance nível 20" },
    { id: "all_foods", name: "🍽️ Gourmand", description: "Coma todos os tipos de comida" },
    { id: "no_poop", name: "✨ Higienista", description: "Mantenha coco em 0 por 1 minuto" },
    { id: "sus_master", name: "🔴 Sus Master", description: "Acumule 100 de sus" },
    { id: "affection_master", name: "❤️ Carinhoso", description: "Use carinho 50 vezes" },
    { id: "work_master", name: "💼 Trabalhador", description: "Trabalhe 100 vezes" },
    { id: "bathroom_master", name: "🚽 Banheiro Master", description: "Use o banheiro 50 vezes" },
    { id: "level_50", name: "👑 Rei", description: "Alcance nível 50" },
    { id: "rich_3", name: "🏦 Banco", description: "Ganhe 50000 moedas" },
    { id: "perfect_day", name: "😇 Dia Perfeito", description: "Tenha 100% em todos os stats" },
    { id: "resurrection", name: "🔄 Ressurreição", description: "Reviva a capivara 10 vezes" },
    { id: "color_master", name: "🎨 Artista", description: "Mude a cor da capivara 5 vezes" },
    { id: "score_1000", name: "📊 Score 1000", description: "Alcance score de 1000" },
    { id: "score_5000", name: "📊 Score 5000", description: "Alcance score de 5000" },
    { id: "score_10000", name: "📊 Score 10000", description: "Alcance score de 10000" },
    { id: "marathon", name: "🏃 Maratona", description: "Jogue por 30 minutos seguidos" },
    { id: "speedster", name: "⚡ Velocista", description: "Mova a capivara 1000 vezes" },
    { id: "size_giant", name: "📏 Gigante", description: "Deixe a capivara com tamanho 500%" },
    { id: "size_tiny", name: "📏 Minúsculo", description: "Deixe a capivara com tamanho 50%" },
    { id: "xp_master", name: "✨ Mestre XP", description: "Ganhe 10000 XP total" },
    { id: "game_master", name: "🎮 Mestre dos Jogos", description: "Jogue todos os 8 minigames" },
    { id: "food_lover", name: "🍽️ Amante de Comida", description: "Coma 100 vezes" },
    { id: "poop_collector", name: "💩 Colecionador", description: "Acumule 500 de coco" },
    { id: "happy_collector", name: "😄 Felicidade", description: "Ganhe 1000 de felicidade total" },
    { id: "hunger_collector", name: "🍔 Comilão", description: "Ganhe 1000 de fome total" },
    { id: "level_100", name: "🔥 Lendário", description: "Alcance nível 100" },
    { id: "coins_100k", name: "💰 Mega Riqueza", description: "Ganhe 100000 moedas" },
    { id: "perfect_stats", name: "⚖️ Equilíbrio Perfeito", description: "Tenha todos os stats iguais" },
    { id: "first_game", name: "🎮 Primeiro Jogo", description: "Jogue o primeiro minigame" },
    { id: "first_color", name: "🎨 Primeira Cor", description: "Mude a cor da capivara" },
    { id: "first_achievement", name: "🏅 Primeira Conquista", description: "Desbloqueie a primeira conquista" },
    { id: "all_achievements", name: "🏆 Todas as Conquistas", description: "Desbloqueie todas as conquistas" },
    { id: "time_master", name: "⏰ Mestre do Tempo", description: "Jogue por 1 hora" },
    { id: "sus_collector", name: "🔴 Sus Collector", description: "Acumule 1000 de sus" },
    { id: "affection_100", name: "❤️ Amor Infinito", description: "Deixe a capivara com 100% de felicidade 10 vezes" },
  ];

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("capyzen_users") || "{}");
    if (users[loginUsername] && users[loginUsername] === loginPassword) {
      setCurrentUser({ username: loginUsername, password: loginPassword });
      localStorage.setItem("capyzen_current_user", JSON.stringify({ username: loginUsername, password: loginPassword }));
      // Garantir que a capivara está viva ao fazer login
      setState((prev: any) => ({ ...prev, alive: true }));
      setLoginError("");
      setLoginUsername("");
      setLoginPassword("");
    } else {
      setLoginError("Usuario ou senha incorretos!");
    }
  };

  const handleCreateUser = () => {
    if (!createUsername || !createPassword) {
      setMessage("Preencha usuário e senha!");
      return;
    }
    const users = JSON.parse(localStorage.getItem("capyzen_users") || "{}");
    if (users[createUsername]) {
      setMessage("Usuário já existe!");
      return;
    }
    users[createUsername] = createPassword;
    localStorage.setItem("capyzen_users", JSON.stringify(users));
    setCurrentUser({ username: createUsername, password: createPassword });
    localStorage.setItem("capyzen_current_user", JSON.stringify({ username: createUsername, password: createPassword }));
    // Garantir que a capivara está viva ao criar novo usuário
    setState((prev: any) => ({ ...prev, alive: true }));
    setCreateError("");
    setCreateUsername("");
    setCreatePassword("");
    setIsCreatingUser(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("capyzen_current_user");
    setState(getInitialState());
    setIsAdminAuthenticated(false);
  };

  const work = () => {
    if (cooldown) return;
    const coins = Math.floor(Math.random() * 30) + 10;
    const xpGain = Math.floor(Math.random() * 15) + 5;
    setState((prev: any) => {
        let newXp = prev.xp + xpGain;
        const newLevel = Math.floor(newXp / 100) + 1;
        const newSize = 1 + (newLevel - 1) * 0.15;
        let newState = {
        ...prev,
        coins: prev.coins + coins,
        xp: newXp % 100,
        level: newLevel,
        capySize: newSize,
        totalScore: prev.totalScore + coins + xpGain,
      };
      if (newLevel > prev.level) {
        playSound("levelup");
        setMessage(`🎉 Level Up! Nível ${newLevel}!`);
      }
      return newState;
    });
    setMessage(`💼 Trabalhou! +${coins} 💰 +${xpGain} XP`);
    playSound("work");
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);
  };

  const feed = () => {
    if (!state.alive || state.inventory[foods[selectedFood]?.name?.split(" ")[1]?.toLowerCase()] === 0) return;
    const food = foods[selectedFood];
    if (!food) return;
    
    const foodKey = food.name.split(" ")[1].toLowerCase();
    setState((prev: any) => ({
      ...prev,
      hunger: Math.max(0, prev.hunger - food.hunger),
      poop: prev.poop + food.poop,
      happy: Math.min(100, prev.happy + 10),
      totalScore: prev.totalScore + 5,
      inventory: {
        ...prev.inventory,
        [foodKey]: (prev.inventory as any)[foodKey] - 1,
      },
    }));
    setMessage(`🍔 comeu ${food.name}! +${food.poop} 💩, +${food.hunger} 🍽️`);
    playSound("eat");
  };

  const bathroom = () => {
    if (state.poop === 0) {
      setMessage("💩 Já está limpo!");
      return;
    }
    setState((prev: any) => ({
      ...prev,
      poop: Math.max(0, prev.poop - 20),
      coins: prev.coins + 50,
      totalScore: prev.totalScore + 50,
    }));
    setMessage("💩 Deu uma cagada remunerada! -20 coco");
  };

  const affection = () => {
    if (susCooldown) return;
    setState((prev: any) => ({
      ...prev,
      happy: Math.min(100, prev.happy + 15),
      sus: Math.max(0, prev.sus - 5),
      totalScore: prev.totalScore + 10,
    }));
    setMessage("❤️ Carinho! +15 😄");
    setSusCooldown(true);
    setTimeout(() => setSusCooldown(false), 2000);
  };

  const buyFood = (index: number) => {
    const food = foods[index];
    if (!food || state.coins < food.cost) {
      setMessage("💰 Moedas insuficientes!");
      return;
    }
    const foodKey = food.name.split(" ")[1].toLowerCase();
    setState((prev: any) => ({
      ...prev,
      coins: prev.coins - food.cost,
      inventory: {
        ...prev.inventory,
        [foodKey]: ((prev.inventory as any)[foodKey] || 0) + 1,
      },
    }));
    setMessage(`🛒 Comprou ${food.name}!`);
  };

  const playGame = (index: number) => {
    const game = games[index];
    if (!game || state.level < game.level || state.coins < game.cost) {
      setMessage("❌ Nível ou moedas insuficientes!");
      return;
    }
    if (minigameCooldown) return;
    setState((prev: any) => ({
      ...prev,
      coins: prev.coins - game.cost,
      happy: Math.min(100, prev.happy + 20),
      totalScore: prev.totalScore + game.cost,
    }));
    setMessage(`🎮 Jogou ${game.name}! +20 😄`);
    playSound("achievement");
    setMinigameCooldown(true);
    setTimeout(() => setMinigameCooldown(false), 2000);
  };

  const handleAdminCommand = (command: string) => {
    if (command === "god") setGodMode(!godMode);
    else if (command === "normal") setGodMode(false);
    else if (command === "reset") {
      setState(getInitialState());
      setMessage("🔄 Jogo resetado!");
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const currentState = state; // Use state directly, not stateRef

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!currentState.alive) {
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText("💀", canvas.width / 2, canvas.height / 2);
      ctx.font = "20px Arial";
      ctx.fillText("Clique em 'Reviver' para trazer de volta", canvas.width / 2, canvas.height / 2 + 40);
      return;
    }

    // Draw capybara
    const size = 30 * currentState.capySize;
    ctx.fillStyle = currentState.capyColor;
    ctx.beginPath();
    ctx.ellipse(currentState.x, currentState.y, size, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(currentState.x - size * 0.3, currentState.y - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(currentState.x + size * 0.3, currentState.y - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.arc(currentState.x, currentState.y + size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(currentState.x, currentState.y + size * 0.2, size * 0.15, 0, Math.PI);
    ctx.stroke();

    // Ears
    ctx.fillStyle = currentState.capyColor;
    ctx.beginPath();
    ctx.ellipse(currentState.x - size * 0.4, currentState.y - size * 0.5, size * 0.15, size * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(currentState.x + size * 0.4, currentState.y - size * 0.5, size * 0.15, size * 0.25, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = currentState.capyColor;
    ctx.lineWidth = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(currentState.x + size * 0.5, currentState.y);
    ctx.quadraticCurveTo(currentState.x + size * 0.7, currentState.y + size * 0.3, currentState.x + size * 0.6, currentState.y + size * 0.6);
    ctx.stroke();

    // Paws
    ctx.fillStyle = currentState.capyColor;
    ctx.beginPath();
    ctx.ellipse(currentState.x - size * 0.25, currentState.y + size * 0.5, size * 0.12, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(currentState.x + size * 0.25, currentState.y + size * 0.5, size * 0.12, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBars = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const currentState = state; // Use state directly, not stateRef

    const barWidth = 120;
    const barHeight = 16;
    const startX = 10;
    const startY = 10;
    const spacing = 22;

    const bars = [
      { label: "🍽️", value: Math.max(0, 100 - currentState.hunger), color: "#10b981", max: 100 },
      { label: "😄", value: currentState.happy, color: "#f59e0b", max: 100 },
      { label: "💩", value: Math.min(100, currentState.poop), color: "#8b7355", max: 100 },
      { label: "🔴", value: currentState.sus, color: "#ef4444", max: 100 },
    ];

    bars.forEach((bar, i) => {
      const y = startY + i * spacing;
      
      // Background
      ctx.fillStyle = "#e5e7eb";
      ctx.beginPath();
      ctx.roundRect(startX, y, barWidth, barHeight, 4);
      ctx.fill();

      // Bar with gradient
      const gradient = ctx.createLinearGradient(startX, y, startX + barWidth, y);
      gradient.addColorStop(0, bar.color);
      gradient.addColorStop(1, bar.color + "80");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(startX, y, (bar.value / bar.max) * barWidth, barHeight, 4);
      ctx.fill();

      // Border
      ctx.strokeStyle = bar.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(startX, y, barWidth, barHeight, 4);
      ctx.stroke();

      // Label and percentage
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "left";
      ctx.fillText(bar.label, startX - 20, y + 12);
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(bar.value)}%`, startX + barWidth + 5, y + 12);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gameLoop = setInterval(() => {
      draw();
      drawBars();
    }, 1000 / 30);

    const lifeLoop = setInterval(() => {
      setState((prev: any) => {
        let newState = { ...prev };
        // Sempre garantir que a capivara está viva
        newState.alive = true;
        // Aumentar fome mais lentamente
        newState.hunger = Math.min(100, prev.hunger + 0.05);
        // Diminuir felicidade mais lentamente
        newState.happy = Math.max(0, prev.happy - 0.02);
        newState.sus = Math.max(0, prev.sus - 0.01);
        return newState;
      });
    }, 500);

    const keyHandler = (e: KeyboardEvent) => {
      const speed = stateRef.current?.speed || 3;
      setState((prev: any) => {
        let newX = prev.x;
        let newY = prev.y;
        if (e.key === "ArrowUp") newY = Math.max(30, prev.y - speed);
        if (e.key === "ArrowDown") newY = Math.min(370, prev.y + speed);
        if (e.key === "ArrowLeft") newX = Math.max(30, prev.x - speed);
        if (e.key === "ArrowRight") newX = Math.min(370, prev.x + speed);
        return { ...prev, x: newX, y: newY };
      });
    };

    window.addEventListener("keydown", keyHandler);
    return () => {
      clearInterval(gameLoop);
      clearInterval(lifeLoop);
      window.removeEventListener("keydown", keyHandler);
    };
  }, []);

  const passiveCoinGain = setInterval(() => {
    setState((prev: any) => ({
      ...prev,
      coins: prev.coins + 1,
      totalScore: prev.totalScore + 1,
    }));
  }, 3000);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-pink-400">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">🐹</div>
            <h1 className="text-4xl font-bold text-pink-600 mb-2">Capyzen</h1>
            <p className="text-gray-700">Bem-vindo ao jogo da capivara fofinha!</p>
          </div>

          {!isCreatingUser ? (
            <>
              <div className="mb-4">
                <label className="block text-blue-600 font-bold mb-2">👤 Usuário:</label>
                <input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-pink-400 rounded-xl focus:outline-none focus:border-pink-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-yellow-600 font-bold mb-2">🔒 Senha:</label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-pink-400 rounded-xl focus:outline-none focus:border-pink-600"
                />
              </div>
              {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl mb-3 transition"
              >
                ✨ Entrar
              </button>
              <button
                onClick={() => setIsCreatingUser(true)}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition"
              >
                🎉 Criar Usuário
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">👑 Teste: root / root</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-blue-600 font-bold mb-2">👤 Novo Usuário:</label>
                <input
                  type="text"
                  placeholder="Digite um usuário"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-pink-400 rounded-xl focus:outline-none focus:border-pink-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-yellow-600 font-bold mb-2">🔒 Senha:</label>
                <input
                  type="password"
                  placeholder="Digite uma senha"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-pink-400 rounded-xl focus:outline-none focus:border-pink-600"
                />
              </div>
              {createError && <p className="text-red-500 text-sm mb-4">{createError}</p>}
              <button
                onClick={handleCreateUser}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl mb-3 transition"
              >
                ✅ Criar
              </button>
              <button
                onClick={() => setIsCreatingUser(false)}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition"
              >
                ❌ Voltar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl p-4 mb-4 shadow-lg">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🐹</span>
              <span className="text-2xl font-bold text-white">👤 {currentUser.username}</span>
            </div>
            <div className="flex gap-4 text-white font-bold flex-wrap justify-center">
              <div>💰 Moedas: {state.coins}</div>
              <div>⭐ Nível: {state.level}</div>
              <div>📊 XP: {state.xp}/100</div>
              <div>📏 Tamanho: {Math.round(state.capySize * 100)}%</div>
              <div>💩 Coco: {Math.round(state.poop)}</div>
              <div>📈 Score: {state.totalScore}</div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-pink-300">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full border-4 border-dashed border-pink-400 rounded-xl bg-gradient-to-b from-pink-50 to-purple-50"
              />
              <p className="text-center text-sm text-gray-600 mt-2">Use as setas para mover a capivara</p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-yellow-300">
              <label className="block text-sm font-bold text-gray-700 mb-2">🍔 Comida:</label>
              <select
                value={selectedFood}
                onChange={(e) => setSelectedFood(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg focus:outline-none text-sm"
              >
                {foods.map((food, i) => (
                  <option key={i} value={i}>
                    {food.name} (💩 {food.poop}) - {state.inventory[food.name.split(" ")[1].toLowerCase() as any] || 0}x
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={work}
              disabled={cooldown}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              💼 Trabalhar
            </button>
            <button
              onClick={feed}
              disabled={!state.alive || (state.inventory as any)[foods[selectedFood]?.name?.split(" ")[1]?.toLowerCase()] === 0}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              🍔 Comer
            </button>
            <button
              onClick={bathroom}
              disabled={state.poop === 0}
              className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              🚽 Banheiro
            </button>
            <button
              onClick={affection}
              disabled={susCooldown}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              ❤️ Carinho
            </button>
            <button
              onClick={() => setShowShop(!showShop)}
              className="w-full bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              🛒 Loja
            </button>
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              🎨 Cores
            </button>
            <button
              onClick={() => setShowMinigame(!showMinigame)}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              🎮 Jogos
            </button>
            <button
              onClick={() => setShowAchievements(!showAchievements)}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              🏆 Conquistas
            </button>
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setShowAdminPanel(true);
                } else {
                  setShowAdminPasswordPrompt(true);
                }
              }}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              ⚙️ Admin
            </button>
            <button
              onClick={() => setShowBugReport(!showBugReport)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              🐛 Bug
            </button>
            <button
              onClick={() => setState((prev: any) => ({ ...prev, alive: true }))}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              ✨ Reviver
            </button>
            <button
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              💾 Progresso
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              🚪 Sair
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-4 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-2xl p-4 text-center font-bold text-gray-800 shadow-lg border-4 border-yellow-400">
            {message}
          </div>
        )}

        {/* Admin Password Prompt */}
        {showAdminPasswordPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-slate-400">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">🔐 Admin</h2>
              <input
                type="password"
                placeholder="Digite a senha"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-400 rounded-xl mb-4 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (adminPassword === "capivarassaomuitofofas404") {
                    setIsAdminAuthenticated(true);
                    setShowAdminPanel(true);
                    setShowAdminPasswordPrompt(false);
                    setAdminPassword("");
                  } else {
                    setMessage("❌ Senha incorreta!");
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl mb-2 transition"
              >
                ✅ Entrar
              </button>
              <button
                onClick={() => {
                  setShowAdminPasswordPrompt(false);
                  setAdminPassword("");
                }}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-xl transition"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {showAdminPanel && isAdminAuthenticated && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gradient-to-b from-slate-900 to-purple-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-4 border-purple-500 my-8">
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">⚙️ PAINEL ADMIN</h2>
                <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              </div>

              {/* Moedas */}
              <div className="mb-6 bg-slate-800 rounded-2xl p-4 border-2 border-green-500">
                <h3 className="text-xl font-bold text-green-400 mb-3">💰 MOEDAS</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, coins: prev.coins + 100 }))}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    +100 💰
                  </button>
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, coins: Math.max(0, prev.coins - 100) }))}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    -100 💰
                  </button>
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, coins: 999999 }))}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    ∞ 💰
                  </button>
                </div>
              </div>

              {/* Felicidade */}
              <div className="mb-6 bg-slate-800 rounded-2xl p-4 border-2 border-yellow-500">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">😄 FELICIDADE</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, happy: Math.min(100, prev.happy + 20) }))}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    +20 😄
                  </button>
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, happy: Math.max(0, prev.happy - 20) }))}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    -20 😢
                  </button>
                </div>
              </div>

              {/* Fome */}
              <div className="mb-6 bg-slate-800 rounded-2xl p-4 border-2 border-blue-500">
                <h3 className="text-xl font-bold text-blue-400 mb-3">🍔 FOME</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, hunger: Math.max(0, prev.hunger - 20) }))}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    +20 🍔
                  </button>
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, hunger: Math.min(100, prev.hunger + 20) }))}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    -20 🍔
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6 bg-slate-800 rounded-2xl p-4 border-2 border-amber-500">
                <h3 className="text-xl font-bold text-amber-400 mb-3">💩 STATUS</h3>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, poop: prev.poop + 20 }))}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg text-sm"
                  >
                    +20 💩
                  </button>
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, poop: Math.max(0, prev.poop - 20) }))}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg text-sm"
                  >
                    -20 💩
                  </button>
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, sus: prev.sus + 20 }))}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg text-sm"
                  >
                    +20 🔴
                  </button>
                  <button
                    onClick={() => setState((prev: any) => ({ ...prev, sus: Math.max(0, prev.sus - 20) }))}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg text-sm"
                  >
                    -20 🔴
                  </button>
                </div>
              </div>

              {/* Modo */}
              <div className="mb-6 bg-slate-800 rounded-2xl p-4 border-2 border-indigo-500">
                <h3 className="text-xl font-bold text-indigo-400 mb-3">🎮 MODO</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setGodMode(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    🌟 GOD
                  </button>
                  <button
                    onClick={() => setGodMode(false)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    ⚖️ Normal
                  </button>
                  <button
                    onClick={() => {
                      setState(getInitialState());
                      setMessage("🔄 Jogo resetado!");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition transform hover:scale-110 shadow-lg"
                  >
                    🔄 RESET
                  </button>
                </div>
              </div>

              {/* Fechar */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowAdminPanel(false);
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 shadow-lg"
                >
                  ❌ Fechar Painel
                </button>
                <button
                  onClick={() => setShowCloseAdminPasswordPrompt(true)}
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 shadow-lg"
                >
                  🔐 Fechar com Senha
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Admin with Password */}
        {showCloseAdminPasswordPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-slate-400">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">🔐 Fechar com Senha</h2>
              <input
                type="password"
                placeholder="Digite a senha"
                value={closeAdminPassword}
                onChange={(e) => setCloseAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-400 rounded-xl mb-4 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (closeAdminPassword === "capivarassaomuitofofas404") {
                    setShowAdminPanel(false);
                    setIsAdminAuthenticated(false);
                    setShowCloseAdminPasswordPrompt(false);
                    setCloseAdminPassword("");
                    setMessage("✅ Painel fechado com sucesso!");
                  } else {
                    setMessage("❌ Senha incorreta!");
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl mb-2 transition"
              >
                ✅ Confirmar
              </button>
              <button
                onClick={() => {
                  setShowCloseAdminPasswordPrompt(false);
                  setCloseAdminPassword("");
                }}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-xl transition"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Shop Modal */}
        {showShop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border-4 border-purple-400 my-8">
              <h2 className="text-3xl font-bold text-purple-600 mb-4">🛒 Loja</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {foods.map((food, i) => (
                  <button
                    key={i}
                    onClick={() => buyFood(i)}
                    disabled={state.coins < food.cost}
                    className="bg-gradient-to-br from-green-200 to-green-300 hover:from-green-300 hover:to-green-400 disabled:opacity-50 p-3 rounded-xl border-2 border-green-500 transition transform hover:scale-105"
                  >
                    <div className="font-bold text-sm">{food.name}</div>
                    <div className="text-xs text-gray-700">💩 {food.poop} | 🍽️ {food.hunger}</div>
                    <div className="text-sm font-bold text-green-700">{food.cost} 💰</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowShop(false)}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition"
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        )}

        {/* Minigames Modal */}
        {showMinigame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border-4 border-teal-400 my-8">
              <h2 className="text-3xl font-bold text-teal-600 mb-4">🎮 Minigames</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {games.map((game, i) => (
                  <button
                    key={i}
                    onClick={() => playGame(i)}
                    disabled={state.level < game.level || state.coins < game.cost}
                    className="bg-gradient-to-br from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400 disabled:opacity-50 p-3 rounded-xl border-2 border-blue-500 transition transform hover:scale-105"
                  >
                    <div className="font-bold text-sm">{game.name}</div>
                    <div className="text-xs text-gray-700">Nível {game.level}</div>
                    <div className="text-sm font-bold text-blue-700">{game.cost} 💰</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMinigame(false)}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition"
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        )}

        {/* Customize Modal */}
        {showCustomize && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-red-400">
              <h2 className="text-3xl font-bold text-red-600 mb-4">🎨 Cores</h2>
              <div className="grid grid-cols-4 gap-2">
                {["#8B6914", "#FF69B4", "#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FFA500", "#800080"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setState((prev: any) => ({ ...prev, capyColor: color }))}
                    className="w-12 h-12 rounded-lg border-4 border-gray-300 hover:border-black transition transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowCustomize(false)}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition"
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        )}

        {/* Achievements Modal */}
        {showAchievements && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border-4 border-amber-400 my-8">
              <h2 className="text-3xl font-bold text-amber-600 mb-4">🏆 Conquistas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {achievementsList.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border-2 ${
                      achievements[ach.id]
                        ? "bg-gradient-to-br from-yellow-200 to-yellow-300 border-yellow-500"
                        : "bg-gray-200 border-gray-400 opacity-50"
                    }`}
                  >
                    <div className="font-bold">{ach.name}</div>
                    <div className="text-sm text-gray-700">{ach.description}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAchievements(false)}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition"
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        )}

        {/* Save Menu */}
        {showSaveMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-indigo-400">
              <h2 className="text-3xl font-bold text-indigo-600 mb-4">💾 Progresso</h2>
              <button
                onClick={() => {
                  const userKey = currentUser ? `capyzen_state_${currentUser.username}` : "capyzen_state";
                  localStorage.setItem(userKey, JSON.stringify(state));
                  setMessage("✅ Progresso salvo!");
                  setShowSaveMenu(false);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl mb-2 transition"
              >
                💾 Continuar Progresso
              </button>
              <button
                onClick={() => {
                  setState(getInitialState());
                  setMessage("🔄 Progresso deletado!");
                  setShowSaveMenu(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl mb-2 transition"
              >
                🗑️ Excluir Progresso
              </button>
              <button
                onClick={() => setShowSaveMenu(false)}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition"
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        )}

        {/* Bug Report */}
        {showBugReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-red-400">
              <h2 className="text-3xl font-bold text-red-600 mb-4">🐛 Reportar Bug</h2>
              <textarea
                value={bugText}
                onChange={(e) => setBugText(e.target.value)}
                placeholder="Descreva o bug..."
                className="w-full px-4 py-2 border-2 border-red-400 rounded-xl mb-4 focus:outline-none h-24"
              />
              <button
                onClick={() => {
                  if (bugText.trim()) {
                    console.log("Bug report:", bugText);
                    setMessage("✅ Bug reportado! Obrigado!");
                    setBugText("");
                    setShowBugReport(false);
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl mb-2 transition"
              >
                ✅ Enviar
              </button>
              <button
                onClick={() => {
                  setShowBugReport(false);
                  setBugText("");
                }}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-xl transition"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
