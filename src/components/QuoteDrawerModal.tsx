import { useEffect } from 'react';
import { X } from 'lucide-react';
import { PMB_BRANCHES } from '../data/pmbData';
import { ContactQuoteSection } from './ContactQuoteSection';

interface QuoteDrawerModalProps {
  isOpen: boolean;
  preselectedBranchId: string;
  onClose: () => void;
}

export function QuoteDrawerModal({
  isOpen,
  preselectedBranchId,
  onClose,
}: QuoteDrawerModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const branch = PMB_BRANCHES.find((b) => b.id === preselectedBranchId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#18181b] border border-white/15 shadow-2xl p-5 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-medium text-[#229ED9] mb-1">
              Contact Direct & Devis Rapide
            </p>
            <h2 id="quote-modal-title" className="text-xl sm:text-2xl font-bold text-white">
              Demander un devis{branch ? ` · ${branch.name}` : ' — PMB GROUP SARL'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre de devis"
            className="w-10 h-10 rounded-lg bg-[#262626] hover:bg-[#323232] text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ContactQuoteSection preselectedBranchId={preselectedBranchId} embedded />
      </div>
    </div>
  );
}
