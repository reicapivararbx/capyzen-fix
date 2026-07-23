import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import type { CurrentUser } from '@/types/game';

interface LoginScreenProps {
  onLogin: (user: CurrentUser) => void;
  onCreateUser: (user: CurrentUser) => void;
}

export function LoginScreen({ onLogin, onCreateUser }: LoginScreenProps) {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, { id: data.userId, username: data.username });
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
      onLogin({ username: loginUsername });
    },
    onError: (error) => {
      setLoginError(error.message || 'Usuário ou senha incorretos!');
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, { id: data.userId, username: data.username });
      setCreateError('');
      setCreateUsername('');
      setCreatePassword('');
      setCreateConfirmPassword('');
      setCreateEmail('');
      setIsCreatingUser(false);
      onCreateUser({ username: createUsername });
    },
    onError: (error) => {
      setCreateError(error.message || 'Erro ao criar usuário!');
    },
  });

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      if (data.resetToken) {
        setForgotMessage(`Token de recuperação: ${data.resetToken}`);
      } else {
        setForgotMessage('Se a conta existir, um token foi gerado.');
      }
    },
    onError: (error) => {
      setForgotMessage(error.message || 'Erro ao solicitar recuperação!');
    },
  });

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

  const validateUsername = (username: string): string | null => {
    if (!username || username.length < 3 || username.length > 20) {
      return 'Usuário deve ter entre 3 e 20 caracteres!';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Usuário deve conter apenas letras, números, - e _!';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password || password.length < 3 || password.length > 50) {
      return 'Senha deve ter entre 3 e 50 caracteres!';
    }
    return null;
  };

  const handleLogin = () => {
    const error = validateUsername(loginUsername) || validatePassword(loginPassword);
    if (error) {
      setLoginError(error);
      return;
    }
    loginMutation.mutate({ username: loginUsername, password: loginPassword });
  };

  const handleCreateUser = () => {
    const error = validateUsername(createUsername) || validatePassword(createPassword);
    if (error) {
      setCreateError(error);
      return;
    }
    if (createPassword !== createConfirmPassword) {
      setCreateError('Senhas não coincidem!');
      return;
    }
    registerMutation.mutate({
      username: createUsername,
      password: createPassword,
      confirmPassword: createConfirmPassword,
      email: createEmail || undefined,
    });
  };

  const handleForgotPassword = () => {
    const error = validateUsername(forgotUsername);
    if (error) {
      setForgotMessage(error);
      return;
    }
    forgotMutation.mutate({ username: forgotUsername });
  };

  if (isCreatingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-pink-400">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">✨</div>
            <h1 className="text-4xl font-bold text-pink-600 mb-2">Criar Conta</h1>
            <p className="text-gray-700">Bem-vindo ao CapyZen!</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-blue-600 font-bold mb-2">👤 Usuário:</label>
              <input
                type="text"
                placeholder="Digite seu usuário"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-yellow-600 font-bold mb-2">🔐 Senha:</label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-yellow-600 font-bold mb-2">🔐 Confirmar Senha:</label>
              <input
                type="password"
                placeholder="Confirme sua senha"
                value={createConfirmPassword}
                onChange={(e) => setCreateConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-green-600 font-bold mb-2">📧 Email (opcional):</label>
              <input
                type="email"
                placeholder="Digite seu email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
              />
            </div>

            {createError && (
              <div className="bg-red-100 border-2 border-red-400 rounded-xl p-3 text-red-700 text-sm">
                {createError}
              </div>
            )}

            <button
              onClick={handleCreateUser}
              disabled={registerMutation.isPending}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition"
            >
              {registerMutation.isPending ? 'Criando...' : '🎉 Criar Conta'}
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

  if (showForgot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-pink-400">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">🔑</div>
            <h1 className="text-4xl font-bold text-pink-600 mb-2">Esqueci a Senha</h1>
            <p className="text-gray-700">Digite seu usuário para recuperar a senha</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-blue-600 font-bold mb-2">👤 Usuário:</label>
              <input
                type="text"
                placeholder="Digite seu usuário"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500"
              />
            </div>

            {forgotMessage && (
              <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-3 text-blue-700 text-sm break-all">
                {forgotMessage}
              </div>
            )}

            <button
              onClick={handleForgotPassword}
              disabled={forgotMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition"
            >
              {forgotMutation.isPending ? 'Enviando...' : '📧 Solicitar Recuperação'}
            </button>
            <button
              onClick={() => { setShowForgot(false); setForgotMessage(''); }}
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
            disabled={loginMutation.isPending}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition"
          >
            {loginMutation.isPending ? 'Entrando...' : '✨ Entrar'}
          </button>

          <button
            onClick={() => setShowForgot(true)}
            className="w-full bg-transparent hover:bg-pink-50 text-pink-600 font-bold py-2 rounded-xl transition text-sm"
          >
            ❓ Esqueci a senha
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
