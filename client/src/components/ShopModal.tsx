import { useState, useEffect, useCallback } from 'react';
import Shop from '@/pages/Shop';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShopModal({ isOpen, onClose }: ShopModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Loja"
    >
      {/* Glass backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Shop content */}
      <div className={`relative z-10 w-full h-full overflow-auto transition-transform duration-500 ${
        isAnimating ? 'translate-y-0' : 'translate-y-4'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[60] bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3 hover:bg-white/20 transition-all duration-200 group min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Fechar loja"
        >
          <svg 
            className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Shop page content */}
        <Shop />
      </div>
    </div>
  );
}
