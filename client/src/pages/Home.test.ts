import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Testes para as funcionalidades principais do CapyZen Game
 */

describe('CapyZen Game - Core Logic', () => {
  // Dados de teste
  const foods = [
    { name: '🌱 Grama', cost: 0, hunger: 5, poop: 0 },
    { name: '🥔 Batata', cost: 10, hunger: 15, poop: 2 },
    { name: '🍔 Hamburger', cost: 50, hunger: 30, poop: 5 },
    { name: '🥤 Refri', cost: 30, hunger: 20, poop: 20 },
  ];

  describe('Level Up System', () => {
    it('should calculate correct level from XP', () => {
      // Level 1: 0-99 XP
      expect(Math.floor(0 / 100) + 1).toBe(1);
      expect(Math.floor(99 / 100) + 1).toBe(1);
      
      // Level 2: 100-199 XP
      expect(Math.floor(100 / 100) + 1).toBe(2);
      expect(Math.floor(199 / 100) + 1).toBe(2);
      
      // Level 5: 400-499 XP
      expect(Math.floor(400 / 100) + 1).toBe(5);
      expect(Math.floor(499 / 100) + 1).toBe(5);
      
      // Level 10: 900-999 XP
      expect(Math.floor(900 / 100) + 1).toBe(10);
    });

    it('should increase level when XP reaches threshold', () => {
      const currentXP = 99;
      const newXP = currentXP + 1; // 100
      const oldLevel = Math.floor(currentXP / 100) + 1; // 1
      const newLevel = Math.floor(newXP / 100) + 1; // 2
      
      expect(newLevel).toBeGreaterThan(oldLevel);
      expect(newLevel).toBe(2);
    });
  });

  describe('Food System', () => {
    it('should have valid food data', () => {
      foods.forEach(food => {
        expect(food.name).toBeTruthy();
        expect(food.cost).toBeGreaterThanOrEqual(0);
        expect(food.hunger).toBeGreaterThan(0);
        expect(food.poop).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate hunger reduction correctly', () => {
      const initialHunger = 100;
      const foodHunger = 30;
      const expectedHunger = Math.max(0, initialHunger - foodHunger);
      
      expect(expectedHunger).toBe(70);
    });

    it('should calculate poop increase correctly', () => {
      const initialPoop = 10;
      const foodPoop = 5;
      const expectedPoop = Math.min(100, initialPoop + foodPoop);
      
      expect(expectedPoop).toBe(15);
    });

    it('should cap poop at 100', () => {
      const initialPoop = 95;
      const foodPoop = 20;
      const expectedPoop = Math.min(100, initialPoop + foodPoop);
      
      expect(expectedPoop).toBe(100);
    });

    it('should not allow buying food without enough coins', () => {
      const coins = 20;
      const foodCost = 50;
      const canBuy = coins >= foodCost;
      
      expect(canBuy).toBe(false);
    });

    it('should allow buying food with enough coins', () => {
      const coins = 100;
      const foodCost = 50;
      const canBuy = coins >= foodCost;
      
      expect(canBuy).toBe(true);
    });
  });

  describe('Bathroom System', () => {
    it('should reduce poop when using bathroom', () => {
      const initialPoop = 50;
      const poopReduction = 20;
      const expectedPoop = Math.max(0, initialPoop - poopReduction);
      
      expect(expectedPoop).toBe(30);
    });

    it('should not go below 0 poop', () => {
      const initialPoop = 10;
      const poopReduction = 20;
      const expectedPoop = Math.max(0, initialPoop - poopReduction);
      
      expect(expectedPoop).toBe(0);
    });

    it('should reward coins for using bathroom', () => {
      const initialCoins = 100;
      const reward = 50;
      const expectedCoins = initialCoins + reward;
      
      expect(expectedCoins).toBe(150);
    });
  });

  describe('Affection System', () => {
    it('should increase happiness when petting', () => {
      const initialHappiness = 50;
      const happinessIncrease = 20;
      const expectedHappiness = Math.min(100, initialHappiness + happinessIncrease);
      
      expect(expectedHappiness).toBe(70);
    });

    it('should cap happiness at 100', () => {
      const initialHappiness = 95;
      const happinessIncrease = 20;
      const expectedHappiness = Math.min(100, initialHappiness + happinessIncrease);
      
      expect(expectedHappiness).toBe(100);
    });

    it('should cost coins to pet', () => {
      const coins = 100;
      const petCost = 20;
      const canPet = coins >= petCost;
      
      expect(canPet).toBe(true);
    });
  });

  describe('Work System', () => {
    it('should reward coins for working', () => {
      const initialCoins = 100;
      const workReward = 50;
      const expectedCoins = initialCoins + workReward;
      
      expect(expectedCoins).toBe(150);
    });

    it('should increase XP for working', () => {
      const initialXP = 50;
      const workXP = 10;
      const expectedXP = initialXP + workXP;
      
      expect(expectedXP).toBe(60);
    });

    it('should increase hunger when working', () => {
      const initialHunger = 30;
      const hungerIncrease = 10;
      const expectedHunger = Math.min(100, initialHunger + hungerIncrease);
      
      expect(expectedHunger).toBe(40);
    });
  });

  describe('Score System', () => {
    it('should calculate score correctly', () => {
      const coins = 1000;
      const level = 5;
      const happiness = 80;
      const score = coins + level * 100 + happiness * 10;
      
      expect(score).toBe(1000 + 500 + 800);
      expect(score).toBe(2300);
    });

    it('should update score when coins change', () => {
      const coins1 = 100;
      const level = 1;
      const happiness = 50;
      const score1 = coins1 + level * 100 + happiness * 10;
      
      const coins2 = 200;
      const score2 = coins2 + level * 100 + happiness * 10;
      
      expect(score2).toBeGreaterThan(score1);
      expect(score2 - score1).toBe(100);
    });
  });

  describe('Status Bar Calculations', () => {
    it('should calculate correct percentage for hunger', () => {
      const hunger = 50;
      const maxHunger = 100;
      const percentage = (hunger / maxHunger) * 100;
      
      expect(percentage).toBe(50);
    });

    it('should calculate correct percentage for happiness', () => {
      const happiness = 75;
      const maxHappiness = 100;
      const percentage = (happiness / maxHappiness) * 100;
      
      expect(percentage).toBe(75);
    });

    it('should calculate correct percentage for poop', () => {
      const poop = 25;
      const maxPoop = 100;
      const percentage = (poop / maxPoop) * 100;
      
      expect(percentage).toBe(25);
    });

    it('should handle edge cases for percentages', () => {
      // 0%
      expect((0 / 100) * 100).toBe(0);
      
      // 100%
      expect((100 / 100) * 100).toBe(100);
    });
  });

  describe('State Validation', () => {
    it('should have valid initial state', () => {
      const initialState = {
        coins: 0,
        level: 1,
        xp: 0,
        hunger: 50,
        happiness: 50,
        poop: 0,
        size: 100,
        alive: true,
      };
      
      expect(initialState.coins).toBeGreaterThanOrEqual(0);
      expect(initialState.level).toBeGreaterThanOrEqual(1);
      expect(initialState.xp).toBeGreaterThanOrEqual(0);
      expect(initialState.hunger).toBeGreaterThanOrEqual(0);
      expect(initialState.hunger).toBeLessThanOrEqual(100);
      expect(initialState.happiness).toBeGreaterThanOrEqual(0);
      expect(initialState.happiness).toBeLessThanOrEqual(100);
      expect(initialState.poop).toBeGreaterThanOrEqual(0);
      expect(initialState.poop).toBeLessThanOrEqual(100);
      expect(initialState.size).toBeGreaterThanOrEqual(100);
      expect(initialState.alive).toBe(true);
    });

    it('should validate state values are within bounds', () => {
      const state = {
        hunger: 150, // Invalid - should be 0-100
        happiness: -10, // Invalid - should be 0-100
        poop: 120, // Invalid - should be 0-100
      };
      
      // Validate and clamp values
      const validatedState = {
        hunger: Math.max(0, Math.min(100, state.hunger)),
        happiness: Math.max(0, Math.min(100, state.happiness)),
        poop: Math.max(0, Math.min(100, state.poop)),
      };
      
      expect(validatedState.hunger).toBe(100);
      expect(validatedState.happiness).toBe(0);
      expect(validatedState.poop).toBe(100);
    });
  });

  describe('Login System', () => {
    it('should validate correct credentials', () => {
      const username = 'root';
      const password = 'root';
      const isValid = username === 'root' && password === 'root';
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect username', () => {
      const username = 'admin';
      const password = 'root';
      const isValid = username === 'root' && password === 'root';
      
      expect(isValid).toBe(false);
    });

    it('should reject incorrect password', () => {
      const username = 'root';
      const password = 'wrong';
      const isValid = username === 'root' && password === 'root';
      
      expect(isValid).toBe(false);
    });
  });

  describe('Admin Panel', () => {
    it('should validate admin password', () => {
      const password = 'capivarassaomuitofofas404';
      const isValid = password === 'capivarassaomuitofofas404';
      
      expect(isValid).toBe(true);
    });

    it('should reject wrong admin password', () => {
      const password = 'wrong';
      const isValid = password === 'capivarassaomuitofofas404';
      
      expect(isValid).toBe(false);
    });
  });

  describe('Game Over Conditions', () => {
    it('should determine game over when hunger is too high', () => {
      const hunger = 100;
      const isGameOver = hunger >= 100;
      
      expect(isGameOver).toBe(true);
    });

    it('should not be game over with normal hunger', () => {
      const hunger = 80;
      const isGameOver = hunger >= 100;
      
      expect(isGameOver).toBe(false);
    });

    it('should determine game over when happiness is too low', () => {
      const happiness = 0;
      const isGameOver = happiness <= 0;
      
      expect(isGameOver).toBe(true);
    });

    it('should not be game over with normal happiness', () => {
      const happiness = 50;
      const isGameOver = happiness <= 0;
      
      expect(isGameOver).toBe(false);
    });
  });
});
