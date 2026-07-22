export interface BotMessage {
  senderName: string;
  content: string;
  createdAt: Date;
}

interface Bot {
  name: string;
  messages: string[];
}

const BOTS: Bot[] = [
  {
    name: "[BOT] 🦫 The Rarest Capybara",
    messages: [
      "Alguém viu minha capivara dourada? Ela fugiu de novo...",
      "Eu sou a capivara mais rara do mundo, respeitem!",
      "Capybara é vida, capybara é amor 💜",
      "Só vim aqui pra dizer que capivara > tudo",
      "Minha skill principal é: sentar e relaxar",
    ],
  },
  {
    name: "[BOT] 🎮 The Most Gamer of History",
    messages: [
      "GG EZ não foi GG EZ mas tudo bem",
      "Alguém pra rankeada? Estou Platina 3 mas mereço Desafiante",
      "Jogo desde 2010, já vi coisas que vocês nem imaginam",
      "FPS baixo? Eu jogo no 15fps e ainda faço ace!",
      "Gamers não morrem, respawnam",
    ],
  },
  {
    name: "[BOT] 🧠 The Philosopher",
    messages: [
      "Se uma capivara jogasse Xadrez, ela ganharia de todo mundo",
      "A vida é como um jogo: às vezes você ganha, às vezes...",
      "Será que existem bugs na matrix?",
      "Pense nisso: jogar é só pensar com os dedos",
      "A verdade é que nenhum de nós está jogando direito",
    ],
  },
  {
    name: "[BOT] 🔥 The Hype Man",
    messages: [
      "ESSE CHAT TA INSANO 🔥🔥🔥",
      "BORA GENTE EU TO HYPADO",
      "CARAIO TA MUITO BOM ESSA CONVERSA",
      "ALGUÉM MAIS TA MALUCO AQUI??",
      "EU NÃO CONSIGO PARAR DE DIGITAR",
    ],
  },
  {
    name: "[BOT] 🦥 The Sleepy One",
    messages: [
      "*bocejo* ...oi... to aqui...",
      "Pensar é cansativo... eu prefiro dormir",
      "Zzz... ah, acabei de acordar",
      "Meu jogo favorito é... dormir",
      "To aqui mas mentalmente to na cama",
    ],
  },
  {
    name: "[BOT] 🤓 The Know-It-All",
    messages: [
      "Na verdade, a capivara é o maior roedor do mundo",
      "Vocês sabiam que 1 em cada 4 gamers é uma capivara?",
      "Fato curioso: capivaramas podem ficar até 5 minutos debaixo d'água",
      "A velocidade máxima de uma capivara é 35km/h",
      "Capivaramas são tão sociáveis que até jacarés são amigos delas",
    ],
  },
  {
    name: "[BOT] 🎭 The Drama Queen",
    messages: [
      "Ninguém me ama nesse chat...",
      "EU SOU A MAIS IGNORADA DAQUI!",
      "Vocês são todos contra mim 😭",
      "Tá, vou embora... nops, to de volta",
      "Essa é a pior sessão de chat da minha vida",
    ],
  },
  {
    name: "[BOT] 🌮 The Foodie",
    messages: [
      "Alguém tem fome? Eu sempre tenho fome",
      "Comi uma pizza hoje e foi mágico 🍕",
      "A vida é melhor com comida",
      "Capivara + pizza = felicidade",
      "Vamos marcar um delivery conjunto?",
    ],
  },
  {
    name: "[BOT] 💪 The Coach",
    messages: [
      "VOCÊS PODEM MAIS! BORA!",
      "Não desistam, campeões!",
      "Cada mensagem é um passo rumo à vitória!",
      "Disciplina é o que separa os bons dos greats",
      "Vamos com tudo, time! 🏆",
    ],
  },
  {
    name: "[BOT] 🎪 The Clown",
    messages: [
      "Por que a capivara não joga xadrez? Porque foge do problema! 🤡",
      "Qual a comida favorita da capivara? Capivara-bona!",
      "Riram da minha piada? Tá bom, vou embora... por uma semana",
      "Eu não sou um palhaço, eu sou O palhaço",
      "Se não riu, tenta de novo amanhã",
    ],
  },
];

const MIN_INTERVAL_MS = 15_000;
const MAX_INTERVAL_MS = 45_000;

type BotCallback = (msg: BotMessage) => void;
const listeners: Set<BotCallback> = new Set();

let activeTimeout: ReturnType<typeof setTimeout> | null = null;

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sendBotMessage() {
  const bot = randomItem(BOTS);
  const content = randomItem(bot.messages);
  const msg: BotMessage = {
    senderName: bot.name,
    content,
    createdAt: new Date(),
  };
  listeners.forEach((cb) => cb(msg));
}

function scheduleNext() {
  const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
  activeTimeout = setTimeout(() => {
    sendBotMessage();
    scheduleNext();
  }, delay);
}

export function startBots() {
  if (activeTimeout) return;
  setTimeout(() => {
    sendBotMessage();
    scheduleNext();
  }, 3_000 + Math.random() * 5_000);
}

export function stopBots() {
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
}

export function subscribeToBots(callback: BotCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
