import { useEffect, useState } from 'react';
import { Building2, HelpCircle, Mail, MessageSquare, X } from 'lucide-react';
import { AboutSection } from './AboutSection';
import { AgendaForumSection } from './AgendaForumSection';
import { FAQSection } from './FAQSection';
import { NewsletterSignup } from './NewsletterSignup';

export type GroupInfoTab = 'about' | 'faq' | 'community' | 'newsletter';

interface GroupInfoModalProps {
  isOpen: boolean;
  initialTab?: GroupInfoTab;
  onClose: () => void;
  onExploreBranch: (branchId: string) => void;
}

export function GroupInfoModal({
  isOpen,
  initialTab = 'about',
  onClose,
  onExploreBranch,
}: GroupInfoModalProps) {
  const [activeTab, setActiveTab] = useState<GroupInfoTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

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

  const tabs: { id: GroupInfoTab; label: string; icon: typeof Building2 }[] = [
    { id: 'about', label: 'Le Groupe & RCCM', icon: Building2 },
    { id: 'faq', label: 'Questions Fréquentes', icon: HelpCircle },
    { id: 'community', label: 'Actualités & Forum', icon: MessageSquare },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-info-modal-title"
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#18181b] border border-white/15 shadow-2xl p-5 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-medium text-[#229ED9] mb-1">
              PMB GROUP SARL · Kinshasa, RDC
            </p>
            <h2 id="group-info-modal-title" className="text-xl sm:text-2xl font-bold text-white">
              Informations institutionnelles, FAQ & Communauté
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les informations du groupe"
            className="w-10 h-10 rounded-lg bg-[#262626] hover:bg-[#323232] text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Sections d'information PMB GROUP SARL"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                  active
                    ? 'bg-[#229ED9] text-white border-[#229ED9]'
                    : 'bg-[#121212] text-zinc-300 hover:text-white border-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div>
          {activeTab === 'about' && (
            <AboutSection
              embedded
              onExploreBranch={(branchId) => {
                onClose();
                onExploreBranch(branchId);
              }}
            />
          )}
          {activeTab === 'faq' && <FAQSection embedded />}
          {activeTab === 'community' && <AgendaForumSection embedded />}
          {activeTab === 'newsletter' && <NewsletterSignup />}
        </div>
      </div>
    </div>
  );
}
