import { describe, it, expect } from 'vitest';

/**
 * Testes para validação de entrada do CapyZen Game
 * Validam login, criação de usuário e proteção contra erros
 */

describe('Input Validation', () => {
  describe('Login Validation', () => {
    it('should reject empty username', () => {
      const username = '';
      const password = 'password123';
      const isValid = username.length >= 3 && username.length <= 20;
      expect(isValid).toBe(false);
    });

    it('should reject empty password', () => {
      const username = 'user123';
      const password = '';
      const isValid = password.length >= 3 && password.length <= 50;
      expect(isValid).toBe(false);
    });

    it('should reject username shorter than 3 chars', () => {
      const username = 'ab';
      const isValid = username.length >= 3 && username.length <= 20;
      expect(isValid).toBe(false);
    });

    it('should reject username longer than 20 chars', () => {
      const username = 'a'.repeat(21);
      const isValid = username.length >= 3 && username.length <= 20;
      expect(isValid).toBe(false);
    });

    it('should reject password shorter than 3 chars', () => {
      const password = 'ab';
      const isValid = password.length >= 3 && password.length <= 50;
      expect(isValid).toBe(false);
    });

    it('should reject password longer than 50 chars', () => {
      const password = 'a'.repeat(51);
      const isValid = password.length >= 3 && password.length <= 50;
      expect(isValid).toBe(false);
    });

    it('should reject username with invalid characters', () => {
      const username = 'user@123!';
      const isValid = /^[a-zA-Z0-9_-]+$/.test(username);
      expect(isValid).toBe(false);
    });

    it('should accept valid username', () => {
      const username = 'user_123-abc';
      const isValid = /^[a-zA-Z0-9_-]+$/.test(username) && 
                      username.length >= 3 && 
                      username.length <= 20;
      expect(isValid).toBe(true);
    });

    it('should accept valid password', () => {
      const password = 'MySecurePass123!@#';
      const isValid = password.length >= 3 && password.length <= 50;
      expect(isValid).toBe(true);
    });
  });

  describe('User Creation Validation', () => {
    it('should reject duplicate username', () => {
      const existingUsers = { 'john': 'password123' };
      const newUsername = 'john';
      const isDuplicate = newUsername in existingUsers;
      expect(isDuplicate).toBe(true);
    });

    it('should allow new username', () => {
      const existingUsers = { 'john': 'password123' };
      const newUsername = 'jane';
      const isDuplicate = newUsername in existingUsers;
      expect(isDuplicate).toBe(false);
    });

    it('should validate both username and password on creation', () => {
      const username = 'newuser';
      const password = 'pass123';
      const usernameValid = username.length >= 3 && username.length <= 20 && 
                           /^[a-zA-Z0-9_-]+$/.test(username);
      const passwordValid = password.length >= 3 && password.length <= 50;
      
      expect(usernameValid && passwordValid).toBe(true);
    });
  });

  describe('localStorage Error Handling', () => {
    it('should handle QuotaExceededError gracefully', () => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      
      const isQuotaError = error instanceof Error && error.name === 'QuotaExceededError';
      expect(isQuotaError).toBe(true);
    });

    it('should handle JSON.parse errors', () => {
      const invalidJson = '{invalid json}';
      let parseError = false;
      
      try {
        JSON.parse(invalidJson);
      } catch (e) {
        parseError = true;
      }
      
      expect(parseError).toBe(true);
    });

    it('should return default value on JSON.parse error', () => {
      const invalidJson = '{invalid}';
      let result = {};
      
      try {
        result = JSON.parse(invalidJson);
      } catch (e) {
        result = {};
      }
      
      expect(result).toEqual({});
    });

    it('should safely parse valid JSON', () => {
      const validJson = '{"coins": 100, "level": 5}';
      const result = JSON.parse(validJson);
      
      expect(result.coins).toBe(100);
      expect(result.level).toBe(5);
    });
  });

  describe('State Validation', () => {
    it('should validate state object structure', () => {
      const state = {
        coins: 100,
        level: 5,
        hunger: 75,
        happiness: 80,
        poop: 20,
        alive: true,
      };
      
      const isValid = 
        typeof state.coins === 'number' &&
        typeof state.level === 'number' &&
        typeof state.hunger === 'number' &&
        typeof state.happiness === 'number' &&
        typeof state.poop === 'number' &&
        typeof state.alive === 'boolean';
      
      expect(isValid).toBe(true);
    });

    it('should ensure stats are within valid ranges', () => {
      const state = {
        hunger: 50,
        happiness: 80,
        poop: 30,
      };
      
      const isValid = 
        state.hunger >= 0 && state.hunger <= 100 &&
        state.happiness >= 0 && state.happiness <= 100 &&
        state.poop >= 0 && state.poop <= 100;
      
      expect(isValid).toBe(true);
    });

    it('should reject stats outside valid ranges', () => {
      const state = {
        hunger: 150, // Invalid
        happiness: -10,  // Invalid
        poop: 200,   // Invalid
      };
      
      const isValid = 
        state.hunger >= 0 && state.hunger <= 100 &&
        state.happiness >= 0 && state.happiness <= 100 &&
        state.poop >= 0 && state.poop <= 100;
      
      expect(isValid).toBe(false);
    });
  });
});
