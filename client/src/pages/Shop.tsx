import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { loadGameState, updateGameState, isClothingCategory } from "@/lib/game-save";
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

// slug → display name lookup for inventory rendering
const slugToName: Record<string, string> = Object.fromEntries(
  shopItems.map(item => [item.slug, item.name])
);

const VERITY_TIPS = [
  "🍎 Comidas aumentam a felicidade da capivara!",
  "⚡ Boosts te dão poderes especiais!",
  "👕 Roupas deixam sua capivara estilosa!",
  "💍 Acessórios são items raros e valiosos!",
  "💰 Complete quests diárias para ganhar mais moedas!",
  "🎵 Jogue FNF para ganhar moedas extras!",
  "🏆 Conquiste achievements para desbloquear items exclusivos!",
  "💎 Items lendários têm borda dourada brilhante!",
  "🍌 Bananas dão +20 de felicidade!",
  "🥤 Suco de milho é o melhor custo-benefício!",
  "🍔 Hambúrgueres recuperam muita fome de uma vez!",
  "🥗 Saladas são baratas e saudáveis!",
  "⚡ O boost de velocidade dura 30 segundos!",
  "🚀 O turbo boost multiplica moedas por 2x!",
  "👟 Tênis raros aumentam a velocidade da capivara!",
  "🕶️ Óculos escuros desbloqueiam pose secreta!",
  "👑 Coroas são lendárias — só as capivaras mais ricas têm!",
  "🎒 Mochilas aumentam o inventário em 5 slots!",
  "🦺 Coletes de proteção reduzem dano em 50%!",
  "🎵 No FNF, acerte as setas na batida certa!",
  "🎤 A música 'Capy Funk' dá o dobro de moedas!",
  "🎹 Segure a seta para notas longas no FNF!",
  "🏆 A conquista 'Colecionador' exige 50 itens diferentes!",
  "⭐ Suba de nível para desbloquear itens premium!",
  "💎 Itens épicos têm brilho roxo na borda!",
  "🪙 Moedas caem aleatoriamente no jogo principal!",
  "🦫 Capivaras felizes produzem moedas mais rápido!",
  "💤 Dormir recupera energia para o próximo dia!",
  "🧼 Banho regular mantém a higiene alta!",
  "🍎 Maçãs vermelhas dão mais fome que maçãs verdes!",
  "🧀 Queijo é o petisco favorito das capivaras!",
  "🍣 Sushi premium dá +50 de felicidade!",
  "🍫 Chocolate é raro e muito procurado!",
  "🧃 Caqui melancia é o item mais barato da loja!",
  "🎒 Verifique o inventário antes de comprar repetidos!",
  "💡 Itens da mesma categoria dão bônus de combo!",
  "🌊 Na praia, sua capivara encontra conchas raras!",
  "🎪 Eventos especiais têm itens exclusivos por tempo limitado!",
  "📱 Siga o canal WhatsApp para códigos de desconto!",
  "🦴 Ossos de brinquedo mantêm a capivara entretida!",
  "🧲 Ímãs de moedas atraem moedas em um raio maior!",
  "🎆 Fogos de artifício dão bônus de XP no Ano Novo!",
  "🎭 Máscaras são itens de coleção raros!",
  "🪙 Acumule moedas para a venda relâmpago de sexta!",
  "📅 Volte todos os dias para bônus de login!",
  "🐾 Capivaras com 3+ acessórios ganham título especial!",
  "🔮 Cristais mágicos desbloqueiam cores secretas!",
  "🧭 Explore o mapa para encontrar baús escondidos!",
  "⭐ Itens com estrela são os mais raros da loja!",
  "🎁 Presentes surpresa podem conter itens lendários!",
];

const VERITY_ANGRY_MESSAGES = [
  "😡 PARA DE CLICAR EM MIM!",
  "😤 Você já me clicou {count} vezes!",
  "💢 EU NÃO SOU BOTÃO!",
  "😠 Clica na loja, não em mim!",
  "🔥 Se me clicar mais uma vez...!",
  "💥 {count} CLIQUES?! Tá de sacanagem!",
  "🤬 EU JURO QUE VOU TRANCAR A LOJA!",
  "😡 VOCÊ TEM ALGO CONTRA MIM?!",
  "💢 MÃO BOBO NA VERITY NÃO, HEIN!",
  "🔥 TÁ PEGANDO FOGO, BICHO!",
  "😤 {count} VEZES? ISSO É ASSÉDIO VIRTUAL!",
  "😡 VOU CHAMAR O SEGURANÇA DA LOJA!",
  "💢 MEU PAI NÃO ME ENSINOU A ISSO!",
  "🤬 SE EU TIVESSE MÃO, TAPAVA SUA CARA!",
  "🔥 EU SOU UM PNG, PARA DE TOCAR EM MIM!",
  "😤 ISSO É UM CRIME CONTRA CAPYBARAS!",
  "😡 EU NÃO FUI PROGRAMADO PRA ISSO!",
  "💢 TÁ ME USANDO COMO STRESS BALL?!",
  "🔥 ATÉ A CAPIVARA TÁ COM PENA DE MIM!",
  "🤬 VOU DEDURAR PRO ADMIN!",
  "😡 {count} CLIQUES E CONTANDO... SOCORRO!",
  "😤 SABIA QUE TEM UM BOTÃO DE COMPRAR ALI?!",
  "💢 EU NÃO RECEBO BÔNUS POR CLIQUE!",
  "🔥 SE FOSSE MOEDA POR CLIQUE, EU ERA RICO!",
  "😡 O DESENVOLVEDOR NÃO ME PAGA PRA ISSO!",
  "🤬 TÁ QUENTE AQUI, TIRA A MÃO!",
  "😤 EU POSSO SER DIGITAL MAS TENHO SENTIMENTOS!",
  "💢 VOCÊ É MAIS TEIMOSO QUE A CAPIVARA!",
  "🔥 EU VOU VIRAR VILÃO DA HISTÓRIA!",
  "😡 ISSO É MAIS IRRITANTE QUE MOSQUITO!",
  "🤬 ALGUÉM ME TIRA DAQUI!",
  "😤 JÁ PEDI GENTILMENTE, AGORA EXIJO!",
  "💢 EU NÃO SOU POKÉMON, PARA DE ME CUTUCAR!",
  "🔥 VOU COLOCAR SEU NOME NA LISTA NEGRA!",
  "😡 SE EU PUDESSE, TROCARIA DE LUGAR!",
  "🤬 ISSO É BULLYING DIGITAL, SABIA?!",
  "😤 MINHA FELICIDADE ERA 100%, AGORA É 0%!",
  "💢 ATÉ O PYTHON TEM MAIS RESPEITO!",
  "🔥 {count}... EU VOU LEMBRAR DISSO!",
  "😡 TÁ ME DANDO DOR DE CABEÇA PIXELADA!",
  "🤬 EU ERA UM VENDEDOR FELIZ, OLHA O QUE FIZERAM!",
  "😤 AGORA ENTENDO POR QUE O BUG EXISTE!",
  "💢 VOU FAZER UMA RECLAMAÇÃO NO RECLAME AQUI!",
  "🔥 MINHA BATERIA SOCIAL ACABOU!",
  "😡 EU PREFIRO BUG A ISSO!",
  "🤬 VOCÊ GANHOU: O TÍTULO DE MAIS CHATO!",
  "😤 ATÉ A CAPIVARA QUER QUE VOCÊ PARE!",
  "💢 EU NÃO ASSINEI CONTRATO PRA ISSO!",
  "🔥 TÁ FICANDO SÉRIO, {count} CLIQUES!",
  "😡 EU VOU FAZER UM BLOG SOBRE ISSO!",
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
  "😅 Ai! Isso doi em pixels!",
  "🤔 Será que clica no item em vez de mim?",
  "😜 Ei, eu não sou botão de teste!",
  "🤗 Opa! Tá carente?",
  "🫣 Cuidado, eu mordo! Brincadeira, sou digital!",
  "😤 Para com isso!",
  "👋 *acena de volta* Agora compra algo!",
  "🫠 Tá me derretendo de tanta raiva!",
  "😂 Acho que você confundiu o alvo!",
  "🤖 Beep boop, isso não é uma função válida!",
  "🎯 Tem um botão de COMPRAR ali, viu?",
  "🙄 Novamente? Sério?",
  "👋 5 cliques! Tá contando?",
  "😅 Oxi, tá me testando?",
  "🫡 Relatório: 5 cliques na Verity. Missão cumprida?",
  "🤯 10 cliques?! Você não desiste, né?",
  "🫠 Tô derretendo... de vergonha alheia!",
  "🫣 10 toques e nada comprado... paciência!",
  "😎 Se fosse aposta, eu já tinha perdido!",
  "🏃 Corre que a loja tá ali!",
  "🫨 15 cliques?! Isso é recorde!",
  "😵 Já são 15... minha saúde mental tá em 0%!",
  "🎬 Isso tá parecendo filme de terror!",
  "🙀 15 POKES?! Tá no Facebook?!",
  "🎵 *toc toc toc* Quem é? Ninguém compra!",
  "💤 Tô ficando entediado com isso...",
  "🦫 As capivaras tão rindo de mim!",
  "📱 Até meu celular travou de tanta raiva!",
  "🎮 Se jogasse FNF assim, já tinha zerado!",
  "🫤 Tá achando que sou INIMIGO do FNF?",
  "😤 {count} cliques e nenhuma compra. Prioridades!",
  "👋 Tchau! Brincadeira, não vou a lugar nenhum...",
  "😅 Acho que você gosta mais de mim que da loja!",
  "🫠 Se clicar mais 5 vezes, vai desbloquear... nada!",
  "🏃 Eu corria mas sou um PNG parado!",
  "🤖 Erro 404: Graça não encontrada!",
  "😜 Pelo menos tá se divertindo, né?",
  "🎉 PARABÉNS! Você clicou {count} vezes! Prêmio: nada!",
  "🫣 Cada clique me leva mais perto da loucura!",
  "🎭 Isso é teatro? Porque tá dramático!",
  "🦴 Se eu tivesse esqueleto, tava todo quebrado!",
  "😴 Tô fingindo que não tô sentindo nada...",
  "🎈 Tá tentando estourar a bolha da minha paciência?",
  "🧊 Minha paciência: ZERO GRAUS!",
  "🤑 Queria que cada clique convertesse em moeda!",
  "🪦 Aqui jaz a paciência da Verity. Descanse em paz.",
];

const VERITY_THANK_YOU_MESSAGES = [
  "🎉 Boa compra! A capivara vai adorar!",
  "✨ Excelente escolha!",
  "💖 Sua capivara ficou feliz!",
  "🌟 Compra perfeita!",
  "🎊 UHUUUL! Obrigado por comprar!",
  "🥳 A capivara tá pulando de alegria!",
  "💎 Item raro adquirido com sucesso!",
  "🛍️ Compra confirmada! Volte sempre!",
  "⭐ Sua capivara ganhou +10 de estilo!",
  "🤝 Negócio fechado! Obrigado!",
  "🎁 Presente perfeito para sua capivara!",
  "💪 Boa! Agora ele tá mais forte!",
  "🌈 Compra mágica! A capivara brilhou!",
  "❤️ Obrigado por cuidar tão bem dele!",
  "🐹 Sua capivara tá sorrindo!",
  "🔥 Item lendário! Ficou épico!",
  "✨ *confetes caindo* PARABÉNS!",
  "💰 Dinheiro bem gasto, amigo!",
  "🎈 A festa da capivara começou!",
  "🫶 Que lindo! Compra com amor!",
  "🏆 Você é um verdadeiro colecionador!",
  "🎉 Sua capivara tá mais feliz que nunca!",
  "💎 Item equipado com sucesso!",
  "🌟 Brilho de lenda desbloqueado!",
  "🥳 Comemoração ativada!",
  "🦋 A capivara evoluiu de estilo!",
  "💫 Estrelas cadentes pra comemorar!",
  "🎵 A capivara tá dançando de alegria!",
  "🦸 Herói da capivara! Comprou mais um!",
  "🌺 Flores desabrocharam de tanta felicidade!",
  "🎯 Compra certeira! Mira de sniper!",
  "🦫 Capivara aprovou com 10/10!",
  "🎊 Confete virtual ativado!",
  "💝 Presente de alguém que se importa!",
  "🎭 Nova roupa, nova personalidade!",
  "🔮 Bola de cristal disse: boa compra!",
  "🐱 Miau... digo, QUACK! Quero dizer, OBRIGADO!",
  "🍕 Comprar itens é melhor que pizza! Quase...",
  "🦸 Capivara agora tem super poderes!",
  "🪄 Item mágico ativado!",
  "🌊 Ondas de felicidade emanando!",
  "🎪 O show da capivara começou!",
  "🥑 Compra saudável pro bolso digital!",
  "🎤 A capivara tá cantando de alegria!",
  "🔔 Sininho da loja tocou: COMPRA FEITA!",
  "🎨 Nova paleta de cores desbloqueada!",
  "🏆 Troféu de comprador frequente!",
  "💎 Brilho máximo atingido!",
  "🚀 Sua capivara tá no espaço de tão feliz!",
  "🥳 FESTAAAAA! Obrigado por comprar!",
];

const VERITY_ACHIEVEMENT_MESSAGES = [
  "🏆 Conquista desbloqueada: Chato de Galocha!",
  "🎖️ Parabéns, você é oficialmente irritante!",
  "🏆 Achievement: Mão Boba!",
  "🥇 Troféu de Ouro: Cliquei 20x na Verity!",
  "🏅 Medalha de paciência... da Verity!",
  "🎖️ Título desbloqueado: Mestre do Poke!",
  "⭐ Achievement raro: Dedo Cansativo!",
  "🎊 +500 moedas por ser chato! Parabéns!",
  "💎 Conquista lendária: Sem Noção!",
  "🦸 Herói do Toque Indesejado!",
  "🎵 *fanfarra tocando* VOCÊ É IRRITANTE!",
  "🌟 Estrela de Ouro: Clique Incessante!",
  "🦫 Medalha da Capivara: Mais Chato que Mosquito!",
  "🎭 Oscar de Melhor Ator em Toque Fácil!",
  "🏆 Guinness Record de Cliques na Verity!",
  "🎉 BOOOOM! 20 cliques! Toma 500 moedas!",
  "💫 Achievement: Dedo Viciado!",
  "🥇 Medalhista de Platina: Sem Parar!",
  "🎪 Conquista circense: Palhaço Digital!",
  "🔥 Achievement lendário: TOQUEI TUDO!",
  "🧠 Desbloqueou: Cérebro de Mosquito!",
  "👾 Achievement gamer: Speedrunner de Raiva!",
  "🎯 Sniper de alvo errado: DESBLOQUEADO!",
  "🦾 Braço de ferro com pixels: VENCEU!",
  "🎂 Bolo de 20 cliques: PARABÉNS!",
  "🎃 Halloween antecipado: Susto garantido!",
  "🎅 Papai Noel trouxe 500 moedas pro chato!",
  "🐰 Coelho da Páscoa: Ovo de 500 moedas!",
  "🎆 Ano Novo: Fogos de artifício pro irritante!",
  "👻 Fantasma do Toque: BÚUUU!",
  "🤠 Cowboy do clique: TEXAS STYLE!",
  "🧛 Vampiro da paciência: SUGOU TUDO!",
  "🤖 Robô do clique: BEEP BOOP 500 MOEDAS!",
  "🧙 Mago do toque: FEITIÇO DE +500!",
  "👨‍🚀 Astronauta: VIAJEI PRO ESPAÇO DE TANTA RAIVA!",
  "🦖 Dinossauro: EXTINTO DE PACIÊNCIA!",
  "🍕 Pizza party: 500 moedas de recheio!",
  "🎪 Circo: Você é o palhaço principal!",
  "🏆 World Record: Mais irritante do mundo!",
  "🦸 Super Herói: PODER DE IRRITAR!",
  "🧙‍♀️ Bruxo: Transformou paciência em moedas!",
  "🎮 Achievement: COMBO DE RAIVA x20!",
  "🧩 Puzzle resolvido: Como irritar um vendedor!",
  "🎪 Show de horrores: 20 cliques!",
  "🎭 Shakespeare: To be or not to poke!",
  "🐉 Dragão: Cuspiu fogo de raiva!",
  "🧊 Iceberg: A ponta da raiva da Verity!",
  "🌈 Arco-íris: Tantas emoções em 20 cliques!",
  "🔮 Místico: Prevejo mais cliques no futuro!",
  "⚡ Zeus: Raios e trovões de raiva!",
];

function VerityHelper({ onPurchase, onAngryChange }: { onPurchase: (callback: () => void) => void; onAngryChange?: (isAngry: boolean) => void }) {
  const [verityState, setVerityState] = useState<VerityState>("normal");
  const [message, setMessage] = useState<string>("");
  const [showBubble, setShowBubble] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [achievementUnlocked, setAchievementUnlocked] = useState(false);
  const tipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verityAngryAudioRef = useRef<HTMLAudioElement | null>(null);

  const playVerityAngrySound = useCallback(() => {
    if (typeof Audio === "undefined") return;

    const audio = verityAngryAudioRef.current ?? new Audio("/sfx/verity-angry.mp3");
    verityAngryAudioRef.current = audio;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    onPurchase(() => {
      setClickCount(0);
      const thankYou = VERITY_THANK_YOU_MESSAGES[Math.floor(Math.random() * VERITY_THANK_YOU_MESSAGES.length)];
      setVerityState("talking");
      setMessage(thankYou);
      setShowBubble(true);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => {
        setShowBubble(false);
        setTimeout(() => { setVerityState("normal"); setMessage(""); }, 300);
      }, 3000);
    });
  }, [onPurchase]);

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
      verityAngryAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (onAngryChange) {
      onAngryChange(clickCount >= 20);
    }
  }, [clickCount, onAngryChange]);

  const handleClick = useCallback(() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);

    if (newCount >= 20 && !achievementUnlocked) {
      setAchievementUnlocked(true);
      setVerityState("angry");
      playVerityAngrySound();
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
      // After 10 seconds, Verity forgives and goes back to normal
      setTimeout(() => {
        setVerityState("normal");
        setClickCount(0);
        setAchievementUnlocked(false);
        setShowBubble(false);
        setMessage("");
      }, 10_000);
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
      playVerityAngrySound();
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
        title={clickCount < 20 ? "Clique no Verity!" : "Verity está bravo!"}
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
  slug: string;
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

type BoostField = "xpBoost" | "coinBoost" | "speedBoost" | "luckBoost";

const SORTE_BOOST_BY_NAME: Record<string, number> = {
  Sorte: 10,
  "Sorte Extra": 30,
  "Sorte Máxima": 50,
};

const NIVEL_MAP: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5 };

function parseNivelTier(name: string): number {
  const m = name.match(/Nível\s+(I{1,3}V?|IV|V)/i);
  return m ? (NIVEL_MAP[m[1].toUpperCase()] ?? 1) : 0;
}

function resolveBoostGrant(itemName: string): { field: BoostField; percent: number } | null {
  const pctMatch = itemName.match(/\+(\d+)%/);

  if (itemName.startsWith("XP ")) {
    return pctMatch ? { field: "xpBoost", percent: parseInt(pctMatch[1], 10) } : null;
  }
  if (itemName.startsWith("Moedas ")) {
    return pctMatch ? { field: "coinBoost", percent: parseInt(pctMatch[1], 10) } : null;
  }
  if (itemName.startsWith("Velocidade ")) {
    return pctMatch ? { field: "speedBoost", percent: parseInt(pctMatch[1], 10) } : null;
  }
  if (itemName.startsWith("Sorte")) {
    const nivelTier = parseNivelTier(itemName);
    if (nivelTier > 0) return { field: "luckBoost", percent: nivelTier * 10 };
    const base = SORTE_BOOST_BY_NAME[itemName];
    return base !== undefined ? { field: "luckBoost", percent: base } : null;
  }
  return null;
}

function isShieldBoost(itemName: string): boolean {
  return itemName.startsWith("Escudo") || itemName.startsWith("Imunidade");
}

export default function Shop() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sortBy, setSortBy] = useState<SortKey>("price-asc");
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isAngry, setIsAngry] = useState(false);
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

      const isClothing = isClothingCategory(item.category);

      if (isClothing) {
        if (gameState.ownedClothing.includes(item.slug)) {
          addToast("⚠️ Roupa já adquirida!", "error");
          return;
        }
      } else if (item.category !== 'Comida' && item.category !== 'Boost' && gameState.equippedItems.includes(item.slug)) {
        addToast("⚠️ Item já adquirido!", "error");
        return;
      }

      if (gameState.coins < item.price) {
        addToast("❌ Moedas insuficientes!", "error");
        return;
      }

      const partial: Partial<GameState> = {
        coins: gameState.coins - item.price,
      };

      if (isClothing) {
        partial.ownedClothing = [...gameState.ownedClothing, item.slug];
        partial.equippedItems = [...gameState.equippedItems, item.slug];
      } else if (item.category !== 'Comida' && item.category !== 'Boost') {
        partial.equippedItems = [...gameState.equippedItems, item.slug];
      }

      if (item.category === "Boost") {
        if (isShieldBoost(item.name)) {
          if (gameState.shieldActive) {
            addToast("⚠️ Escudo já está ativo!", "error");
            return;
          }
          partial.shieldActive = true;
        } else {
          const grant = resolveBoostGrant(item.name);
          if (grant !== null) {
            const currentValue = (gameState[grant.field] as number) || 0;
            partial[grant.field] = Math.max(currentValue, grant.percent);
          }
        }
      }

      const updated = updateGameState(partial);
      setGameState(updated);
      addToast(`✅ Comprou ${item.name}!`, "success");

      if (verityPurchaseCallbackRef.current) {
        verityPurchaseCallbackRef.current();
      }
    },
    [gameState, addToast]
  );

  const equipClothing = useCallback(
    (itemName: string) => {
      if (!gameState) return;
      if (gameState.equippedItems.includes(itemName)) return;
      const updated = updateGameState({ equippedItems: [...gameState.equippedItems, itemName] });
      setGameState(updated);
      addToast(`✅ ${itemName} equipada!`, "success");
    },
    [gameState, addToast]
  );

  const unequipClothing = useCallback(
    (itemName: string) => {
      if (!gameState) return;
      const updated = updateGameState({ equippedItems: gameState.equippedItems.filter((n) => n !== itemName) });
      setGameState(updated);
      addToast(`🔄 ${itemName} removida!`, "success");
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
      {/* Dark overlay */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${isAngry ? 'bg-red-950/70' : 'bg-black/60'}`} />
      
      {/* Red vignette when angry */}
      {isAngry && (
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{
          boxShadow: 'inset 0 0 200px 80px rgba(180, 30, 30, 0.5)',
          transition: 'box-shadow 1s ease-in-out'
        }} />
      )}
      
      {/* Ambient glow particles */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-1000 ${isAngry ? 'z-[2]' : ''}`}>
        {isAngry ? (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-red-700/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl animate-pulse" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
          </>
        )}
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
                <span>{gameState.ownedClothing.length} roupas no inventário</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Owned Clothing Inventory */}
        {gameState.ownedClothing.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 sm:p-6 mb-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">👔 Roupas no Inventário</h3>
            <div className="flex flex-wrap gap-2">
              {gameState.ownedClothing.map((clothingSlug) => {
                const displayName = slugToName[clothingSlug] ?? clothingSlug;
                const isEquipped = gameState.equippedItems.includes(clothingSlug);
                return (
                  <span
                    key={clothingSlug}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      isEquipped
                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500"
                        : "bg-slate-700 text-slate-300 border border-slate-600"
                    }`}
                  >
                    {displayName}
                    {isEquipped ? (
                      <button
                        type="button"
                        onClick={() => unequipClothing(clothingSlug)}
                        className="ml-1 text-xs text-red-400 hover:text-red-300"
                        title="Remover"
                      >
                        ✕
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => equipClothing(clothingSlug)}
                        className="ml-1 text-xs text-emerald-400 hover:text-emerald-300"
                        title="Vestir"
                      >
                        👆
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
            <p className="text-slate-500 text-xs mt-3">
              {gameState.equippedItems.filter((n) => gameState.ownedClothing.includes(n)).length}{" "}
              de {gameState.ownedClothing.length} roupas vestidas
            </p>
          </Card>
        )}

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

                    {(() => {
                      const isEquipped = gameState.equippedItems.includes(item.slug);
                      const isOwned = isClothingCategory(item.category)
                        ? gameState.ownedClothing.includes(item.slug)
                        : isEquipped;
                      return (
                        <Button
                          onClick={() => {
                            if (isEquipped) {
                              unequipClothing(item.slug);
                            } else if (isOwned) {
                              equipClothing(item.slug);
                            } else {
                              buyItem(item);
                            }
                          }}
                          disabled={!canAfford && !isEquipped && !isOwned}
                          className={`w-full rounded-xl font-semibold transition-all duration-200 ${
                            isEquipped
                              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                              : isOwned
                                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20"
                                : canAfford
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                                  : "bg-white/5 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {isEquipped ? "Equipado ✓" : isOwned ? "Equipar" : canAfford ? "Comprar" : "Sem moedas"}
                        </Button>
                      );
                    })()}
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
        onAngryChange={setIsAngry}
      />
    </div>
  );
}
