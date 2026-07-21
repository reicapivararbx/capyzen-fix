/**
 * Tipos para o jogo CapyZen
 */

export interface GameState {
  coins: number;
  level: number;
  xp: number;
  food: number;
  poop: number;
  hunger: number;
  happiness: number;
  sus: number;
  x: number;
  y: number;
  speed: number;
  alive: boolean;
  capyColor: string;
  capySize: number;
  totalScore: number;
  totalXP: number;
  foodEaten: number;
  gamesPlayed: number;
  workCount: number;
  affectionCount: number;
  bathroomCount: number;
  colorChanges: number;
  size: number;
  inventory: Inventory;
  energy: number;
  thirst: number;
  hygiene: number;
  health: number;
  equippedItems: string[];
  ownedClothing: string[];
  playerName: string;
  capyName: string;
  age: number;
  fnfSongsCompleted: number;
  fnfHighestCombo: number;
  millionRewardClaimed: boolean;
  speedBoost: number;
  shieldActive: boolean;
  luckBoost: number;
  xpBoost: number;
  coinBoost: number;
}

export interface Inventory {
  grama: number;
  batata: number;
  hamburger: number;
  refri: number;
  feijao: number;
  hotdog: number;
  pizza: number;
  sushi: number;
  tacos: number;
  sorvete: number;
  bolo: number;
  chocolate: number;
  maçã: number;
  banana: number;
  melancia: number;
  morango: number;
  uva: number;
  cenoura: number;
  brócolis: number;
  espinafre: number;
  tomate: number;
  queijo: number;
  iogurte: number;
  leite: number;
  pão: number;
  arroz: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked?: boolean;
}

export interface Food {
  name: string;
  poop: number;
  hunger: number;
  cost: number;
}

export interface Game {
  id: string;
  name: string;
  cost: number;
  description: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  level: number;
  timestamp: number;
}

export interface CurrentUser {
  username: string;
  password: string;
}
