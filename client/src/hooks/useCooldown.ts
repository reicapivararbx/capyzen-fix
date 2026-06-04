import { useState, useEffect } from "react";

/**
 * Hook customizado para gerenciar cooldowns com cleanup automático
 * @param duration - Duração do cooldown em ms
 * @returns [isActive, activate] - Estado do cooldown e função para ativá-lo
 */
export function useCooldown(duration: number) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration]);

  const activate = () => setIsActive(true);

  return [isActive, activate] as const;
}
