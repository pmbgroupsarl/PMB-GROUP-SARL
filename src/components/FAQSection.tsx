import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePmbStore } from '../lib/pmbStore';

export function FAQSection() {
  const { cms } = usePmbStore();
  const faqs = cms.faqs;
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="no-print py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-medium text-[#F59E0B] mb-2">Support & Informations</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Questions Fréquentes sur PMB Group
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Tout ce que vous devez savoir sur nos services et pôles d’activités en RDC.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl bg-[#1c1c1e]/92 border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#262626]/70 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#229ED9]">{item.category}</p>
                    <p className="font-semibold text-white text-sm sm:text-base">
                      {item.question}
                    </p>
                  </div>

                  <span
                    className={`w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 bg-[#229ED9] text-white border-[#229ED9]'
                        : 'bg-[#121212] text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-3 text-zinc-300 text-sm sm:text-base leading-relaxed border-t border-white/[0.08]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
