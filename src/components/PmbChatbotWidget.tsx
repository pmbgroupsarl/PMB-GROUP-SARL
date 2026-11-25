import { FormEvent, useRef, useState } from 'react';
import { ExternalLink, MessageCircle, Send, X } from 'lucide-react';
import { PMB_COMPANY } from '../data/pmbData';
import { monitoredFetch } from '../lib/selfHealingMonitor';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const QUICK_PROMPTS = [
  'Comment payer par M-Pesa ou Visa ?',
  'Tarifs & transport Paquebot / Avion',
  'Adhérer à PMB Fondation',
  'Coordonnées siège Kinshasa',
];

export function PmbChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Bonjour ! Je suis l’assistant intelligent de PMB GROUP SARL. Comment puis-je vous orienter parmi nos 6 divisions, nos paiements Mobile Money / Carte ou l’adhésion à PMB Fondation ?',
    },
  ]);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  const sendPrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: clean,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 40);

    try {
      const res = await monitoredFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          history: messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'Réponse indisponible pour le moment.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.reply!,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text:
            err instanceof Error
              ? err.message
              : 'Service momentanément indisponible. Vous pouvez joindre nos équipes directement sur WhatsApp.',
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendPrompt(input);
  };

  return (
    <div className="no-print fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <section
          aria-label="Assistant client PMB GROUP SARL"
          className="w-[min(92vw,390px)] h-[min(76vh,540px)] rounded-2xl bg-[#18181b] border border-white/15 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* En-tête du widget */}
          <div className="px-4 py-3.5 bg-[#262626] border-b border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                Assistant Client · {PMB_COMPANY.legalName}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                Services, Paiements & PMB Fondation
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer l’assistant client"
              className="w-8 h-8 rounded-lg bg-[#121212] hover:bg-black text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zone de messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#121212]/90">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#229ED9] text-white'
                      : 'bg-[#262626] text-zinc-100 border border-white/[0.08]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3.5 py-2.5 text-xs bg-[#262626] text-zinc-400 border border-white/[0.08]">
                  Analyse en cours...
                </div>
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          {/* Suggestions rapides & raccourcis */}
          <div className="px-3 py-2 bg-[#18181b] border-t border-white/[0.08] space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendPrompt(q)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-md bg-[#262626] hover:bg-[#323232] text-[11px] text-zinc-200 border border-white/[0.08] transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400 pt-1">
              <div className="flex items-center gap-3">
                <a
                  href="#paiement"
                  onClick={() => setIsOpen(false)}
                  className="text-[#F59E0B] hover:underline"
                >
                  Paiement
                </a>
                <a
                  href="#fondation"
                  onClick={() => setIsOpen(false)}
                  className="text-[#229ED9] hover:underline"
                >
                  Adhésion Fondation
                </a>
              </div>
              <a
                href={PMB_COMPANY.phones[0].whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-medium"
              >
                <span>WhatsApp Direct</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Formulaire de saisie */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#1c1c1e] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              aria-label="Message à l’assistant PMB"
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Envoyer"
              className="w-9 h-9 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] disabled:opacity-50 text-white flex items-center justify-center cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir l’assistant client PMB GROUP SARL"
          className="inline-flex items-center gap-2.5 px-4 h-12 rounded-full bg-[#229ED9] hover:bg-[#1b86b9] text-white text-sm font-semibold shadow-xl shadow-black/50 border border-white/20 transition-transform duration-150 hover:scale-[1.03] cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline whitespace-nowrap">Assistant PMB</span>
        </button>
      )}
    </div>
  );
}
