import { useState, useEffect, ReactNode } from "react";
import type { JSX } from "react";

interface CapybaraPasswordUIProps {
  onPasswordSubmit: (password: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function CapybaraPasswordUI({
  onPasswordSubmit,
  isLoading = false,
  error = "",
}: CapybaraPasswordUIProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [capybaraExpression, setCapybaraExpression] = useState("neutral");

  // Calcular força da senha
  useEffect(() => {
    let strength = 0;
    if (password.length > 0) strength += 1;
    if (password.length > 6) strength += 1;
    if (password.length > 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*]/.test(password)) strength += 1;

    setPasswordStrength(strength);

    // Mudar expressão da capivara
    if (strength === 0) setCapybaraExpression("neutral");
    else if (strength <= 2) setCapybaraExpression("worried");
    else if (strength <= 4) setCapybaraExpression("happy");
    else setCapybaraExpression("excited");
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onPasswordSubmit(password);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "Digite uma senha";
    if (passwordStrength <= 2) return "Fraca 😅";
    if (passwordStrength <= 4) return "Média 😊";
    return "Forte! 💪";
  };

  const renderCapybara = (): ReactNode => {
    const expressions: Record<string, ReactNode> = {
      neutral: (
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          {/* Corpo */}
          <ellipse cx="50" cy="60" rx="35" ry="30" fill="#8B7355" />
          {/* Cabeça */}
          <ellipse cx="50" cy="35" rx="28" ry="25" fill="#A0826D" />
          {/* Orelhas */}
          <circle cx="30" cy="15" r="8" fill="#8B7355" />
          <circle cx="70" cy="15" r="8" fill="#8B7355" />
          <circle cx="30" cy="15" r="5" fill="#D4A574" />
          <circle cx="70" cy="15" r="5" fill="#D4A574" />
          {/* Olhos */}
          <circle cx="40" cy="30" r="5" fill="black" />
          <circle cx="60" cy="30" r="5" fill="black" />
          <circle cx="41" cy="29" r="2" fill="white" />
          <circle cx="61" cy="29" r="2" fill="white" />
          {/* Nariz */}
          <ellipse cx="50" cy="38" rx="4" ry="5" fill="#654321" />
          {/* Boca neutra */}
          <path d="M 50 38 Q 45 42 40 40" stroke="#654321" strokeWidth="2" fill="none" />
          <path d="M 50 38 Q 55 42 60 40" stroke="#654321" strokeWidth="2" fill="none" />
        </svg>
      ),
      worried: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 animate-bounce">
          {/* Corpo */}
          <ellipse cx="50" cy="60" rx="35" ry="30" fill="#8B7355" />
          {/* Cabeça */}
          <ellipse cx="50" cy="35" rx="28" ry="25" fill="#A0826D" />
          {/* Orelhas */}
          <circle cx="30" cy="15" r="8" fill="#8B7355" />
          <circle cx="70" cy="15" r="8" fill="#8B7355" />
          <circle cx="30" cy="15" r="5" fill="#D4A574" />
          <circle cx="70" cy="15" r="5" fill="#D4A574" />
          {/* Olhos preocupados */}
          <circle cx="40" cy="30" r="5" fill="black" />
          <circle cx="60" cy="30" r="5" fill="black" />
          <circle cx="40" cy="29" r="2" fill="white" />
          <circle cx="60" cy="29" r="2" fill="white" />
          {/* Sobrancelhas */}
          <path d="M 35 25 Q 40 23 45 25" stroke="#654321" strokeWidth="2" fill="none" />
          <path d="M 55 25 Q 60 23 65 25" stroke="#654321" strokeWidth="2" fill="none" />
          {/* Nariz */}
          <ellipse cx="50" cy="38" rx="4" ry="5" fill="#654321" />
          {/* Boca preocupada */}
          <path d="M 50 40 Q 45 38 40 40" stroke="#654321" strokeWidth="2" fill="none" />
          <path d="M 50 40 Q 55 38 60 40" stroke="#654321" strokeWidth="2" fill="none" />
        </svg>
      ),
      happy: (
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          {/* Corpo */}
          <ellipse cx="50" cy="60" rx="35" ry="30" fill="#8B7355" />
          {/* Cabeça */}
          <ellipse cx="50" cy="35" rx="28" ry="25" fill="#A0826D" />
          {/* Orelhas */}
          <circle cx="30" cy="15" r="8" fill="#8B7355" />
          <circle cx="70" cy="15" r="8" fill="#8B7355" />
          <circle cx="30" cy="15" r="5" fill="#D4A574" />
          <circle cx="70" cy="15" r="5" fill="#D4A574" />
          {/* Olhos felizes */}
          <circle cx="40" cy="30" r="5" fill="black" />
          <circle cx="60" cy="30" r="5" fill="black" />
          <circle cx="41" cy="29" r="2" fill="white" />
          <circle cx="61" cy="29" r="2" fill="white" />
          {/* Nariz */}
          <ellipse cx="50" cy="38" rx="4" ry="5" fill="#654321" />
          {/* Boca sorridente */}
          <path d="M 40 42 Q 50 48 60 42" stroke="#654321" strokeWidth="2" fill="none" />
          <path d="M 45 42 Q 50 46 55 42" stroke="#654321" strokeWidth="1" fill="none" />
        </svg>
      ),
      excited: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 animate-pulse">
          {/* Corpo */}
          <ellipse cx="50" cy="60" rx="35" ry="30" fill="#8B7355" />
          {/* Cabeça */}
          <ellipse cx="50" cy="35" rx="28" ry="25" fill="#A0826D" />
          {/* Orelhas */}
          <circle cx="30" cy="15" r="8" fill="#8B7355" />
          <circle cx="70" cy="15" r="8" fill="#8B7355" />
          <circle cx="30" cy="15" r="5" fill="#D4A574" />
          <circle cx="70" cy="15" r="5" fill="#D4A574" />
          {/* Olhos excitados */}
          <circle cx="40" cy="28" r="5" fill="black" />
          <circle cx="60" cy="28" r="5" fill="black" />
          <circle cx="41" cy="27" r="2" fill="white" />
          <circle cx="61" cy="27" r="2" fill="white" />
          {/* Brilho nos olhos */}
          <circle cx="42" cy="26" r="1.5" fill="yellow" />
          <circle cx="62" cy="26" r="1.5" fill="yellow" />
          {/* Nariz */}
          <ellipse cx="50" cy="38" rx="4" ry="5" fill="#654321" />
          {/* Boca muito feliz */}
          <path d="M 40 44 Q 50 52 60 44" stroke="#654321" strokeWidth="2" fill="none" />
          <path d="M 45 44 Q 50 50 55 44" stroke="#654321" strokeWidth="1" fill="none" />
          {/* Estrelinhas */}
          <text x="25" y="20" fontSize="12" fill="gold">✨</text>
          <text x="70" y="20" fontSize="12" fill="gold">✨</text>
        </svg>
      ),
    };

    return expressions[capybaraExpression] || expressions.neutral;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-pink-300">
        {/* Capivara */}
        <div className="flex justify-center mb-6">{renderCapybara()}</div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
          🐹 CapyZen
        </h1>
        <p className="text-center text-gray-600 mb-6 font-semibold">
          Digite sua senha mágica de capivara ✨
        </p>

        {/* Erro */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 rounded-xl p-3 mb-4 text-red-700 font-bold text-center">
            ❌ {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Senha */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔐 Senha:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha..."
                className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-xl"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Indicador de Força */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-600">
                Força da Senha:
              </span>
              <span className="text-xs font-bold text-gray-600">
                {getStrengthText()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getStrengthColor()} transition-all duration-300`}
                style={{ width: `${(passwordStrength / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-gray-700 space-y-1">
            <p>💡 Dicas para senha forte:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Mínimo 12 caracteres</li>
              <li>Inclua maiúsculas e números</li>
              <li>Adicione símbolos (!@#$%)</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || password.length === 0}
              className="flex-1 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Verificando...
                </>
              ) : (
                <>
                  🔓 Entrar
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          🐹 Bem-vindo ao CapyZen! Sua capivara está esperando por você.
        </p>
      </div>
    </div>
  );
}
