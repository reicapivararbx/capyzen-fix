import { useState, useCallback } from 'react';
import type { CurrentUser } from '@/types/game';

interface UseGameAuthReturn {
  currentUser: CurrentUser | null;
  loginError: string;
  createError: string;
  isCreatingUser: boolean;
  login: (username: string, password: string) => boolean;
  createUser: (username: string, password: string) => boolean;
  logout: () => void;
  setLoginError: (error: string) => void;
  setCreateError: (error: string) => void;
  setIsCreatingUser: (creating: boolean) => void;
}

/**
 * Hook customizado para gerenciar autenticação do jogo
 * Centraliza login, criação de usuário e validações
 */
export function useGameAuth(): UseGameAuthReturn {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const saved = localStorage.getItem('capyzen_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loginError, setLoginError] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Validar username
  const validateUsername = useCallback((username: string): string | null => {
    if (username.length < 3 || username.length > 20) {
      return 'Usuário deve ter entre 3 e 20 caracteres!';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Usuário deve conter apenas letras, números, - e _!';
    }
    return null;
  }, []);

  // Validar password
  const validatePassword = useCallback((password: string): string | null => {
    if (password.length < 3 || password.length > 50) {
      return 'Senha deve ter entre 3 e 50 caracteres!';
    }
    return null;
  }, []);

  // Fazer login
  const login = useCallback((username: string, password: string): boolean => {
    // Validar entrada
    const usernameError = validateUsername(username);
    if (usernameError) {
      setLoginError(usernameError);
      return false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setLoginError(passwordError);
      return false;
    }

    try {
      const users = JSON.parse(localStorage.getItem('capyzen_users') || '{}');
      if (users[username] && users[username] === password) {
        const user = { username, password };
        setCurrentUser(user);
        try {
          localStorage.setItem('capyzen_current_user', JSON.stringify(user));
        } catch (e) {
          // Ignorar erro de quota
        }
        setLoginError('');
        return true;
      } else {
        setLoginError('Usuario ou senha incorretos!');
        return false;
      }
    } catch (e) {
      setLoginError('Erro ao carregar dados de usuário!');
      return false;
    }
  }, [validateUsername, validatePassword]);

  // Criar usuário
  const createUser = useCallback((username: string, password: string): boolean => {
    // Validar entrada
    const usernameError = validateUsername(username);
    if (usernameError) {
      setCreateError(usernameError);
      return false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setCreateError(passwordError);
      return false;
    }

    try {
      const users = JSON.parse(localStorage.getItem('capyzen_users') || '{}');
      if (users[username]) {
        setCreateError('Usuário já existe!');
        return false;
      }

      users[username] = password;
      try {
        localStorage.setItem('capyzen_users', JSON.stringify(users));
      } catch (e) {
        // Ignorar erro de quota
      }

      const user = { username, password };
      setCurrentUser(user);
      try {
        localStorage.setItem('capyzen_current_user', JSON.stringify(user));
      } catch (e) {
        // Ignorar erro de quota
      }

      setCreateError('');
      return true;
    } catch (e) {
      setCreateError('Erro ao criar usuário!');
      return false;
    }
  }, [validateUsername, validatePassword]);

  // Fazer logout
  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('capyzen_current_user');
    } catch (e) {
      // Ignorar erro
    }
  }, []);

  return {
    currentUser,
    loginError,
    createError,
    isCreatingUser,
    login,
    createUser,
    logout,
    setLoginError,
    setCreateError,
    setIsCreatingUser,
  };
}
