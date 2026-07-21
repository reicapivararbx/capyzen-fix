import { useState, useEffect } from 'react';
import type { CurrentUser } from '@/types/game';

interface LoginScreenProps {
  onLogin: (user: CurrentUser) => void;
  onCreateUser: (user: CurrentUser) => void;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function LoginScreen({ onLogin, onCreateUser }: LoginScreenProps) {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('capyzen_remember_me');
      if (saved) {
        const data = JSON.parse(saved) as { username: string; remember: boolean };
        if (data.remember && data.username) {
          setLoginUsername(data.username);
          setRememberMe(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const validateInput = (username: string, password: string): string | null => {
    if (!username || !password) {
      return 'Usuário e senha são obrigatórios!';
    }
    if (username.length < 3 || username.length > 20) {
      return 'Usuário deve ter entre 3 e 20 caracteres!';
    }
    if (password.length < 3 || password.length > 50) {
      return 'Senha deve ter entre 3 e 50 caracteres!';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Usuário deve conter apenas letras, números, - e _!';
    }
    return null;
  };

  const handleLogin = async () => {
    const error = validateInput(loginUsername, loginPassword);
    if (error) {
      setLoginError(error);
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('capyzen_users') || '{}');
      const hashedPassword = await hashPassword(loginPassword);

      if (users[loginUsername] && users[loginUsername] === hashedPassword) {
        if (rememberMe) {
          localStorage.setItem('capyzen_remember_me', JSON.stringify({ username: loginUsername, remember: true }));
        } else {
          localStorage.removeItem('capyzen_remember_me');
        }
        onLogin({ username: loginUsername, password: hashedPassword });
        setLoginError('');
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError('Usuario ou senha incorretos!');
      }
    } catch {
      setLoginError('Erro ao carregar dados de usuário!');
    }
  };

  const handleCreateUser = async () => {
    const error = validateInput(createUsername, createPassword);
    if (error) {
      setCreateError(error);
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('capyzen_users') || '{}');
      if (users[createUsername]) {
        setCreateError('Usuário já existe!');
        return;
      }

      const hashedPassword = await hashPassword(createPassword);
      users[createUsername] = hashedPassword;

      try {
        localStorage.setItem('capyzen_users', JSON.stringify(users));
      } catch {
        setCreateError('Erro ao salvar dados!');
        return;
      }

      onCreateUser({ username: createUsername, password: hashedPassword });
      setCreateError('');
      setCreateUsername('');
      setCreatePassword('');
      setIsCreatingUser(false);
    } catch {
      setCreateError('Erro ao criar usuário!');
    }
  };

  if (isCreatingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-pink-400">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">✨</div>
            <h1 className="text-4xl font-bold text-pink-600 mb-2">Novo Usuário</h1>
            <p className="text-gray-700">Bem-vindo ao CapyZen!</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Novo usuário"
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
            />
            <input
              type="password"
              placeholder="Senha"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
            />

            {createError && (
              <div className="bg-red-100 border-2 border-red-400 rounded-xl p-3 text-red-700 text-sm">
                {createError}
              </div>
            )}

            <button
              onClick={handleCreateUser}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition"
            >
              🎉 Criar
            </button>
            <button
              onClick={() => setIsCreatingUser(false)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-xl transition"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-pink-400">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🐹</div>
          <h1 className="text-4xl font-bold text-pink-600 mb-2">Capyzen</h1>
          <p className="text-gray-700">Bem-vindo ao jogo da capivara fofinha!</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-blue-600 font-bold mb-2">👤 Usuário:</label>
            <input
              type="text"
              placeholder="Digite seu usuário"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-yellow-600 font-bold mb-2">🔐 Senha:</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
            />
          </div>

          {loginError && (
            <div className="bg-red-100 border-2 border-red-400 rounded-xl p-3 text-red-700 text-sm">
              {loginError}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-pink-300 text-pink-500 focus:ring-pink-500"
            />
            <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer">
              ☑ Lembrar de mim
            </label>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition"
          >
            ✨ Entrar
          </button>

          <button
            onClick={() => setIsCreatingUser(true)}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition"
          >
            🎉 Criar Usuário
          </button>
        </div>
      </div>
    </div>
  );
}
