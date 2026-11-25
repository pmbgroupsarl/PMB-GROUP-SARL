import { FormEvent, useEffect, useState } from 'react';
import { CalendarDays, MapPin, MessageSquare, Send, Users } from 'lucide-react';
import { PMB_BRANCHES } from '../data/pmbData';
import { usePmbStore } from '../lib/pmbStore';
import { monitoredFetch } from '../lib/selfHealingMonitor';

interface ForumReply {
  id: string;
  authorName: string;
  role: 'client' | 'team';
  message: string;
  createdAt: string;
}

interface ForumThread {
  id: string;
  branchId: string;
  branchName: string;
  authorName: string;
  title: string;
  question: string;
  status: 'Répondu' | 'Ouvert';
  createdAt: string;
  replies: ForumReply[];
}

export function AgendaForumSection() {
  const { cms, incrementNewsRsvp } = usePmbStore();
  const events = cms.newsActus;

  const [activeTab, setActiveTab] = useState<'agenda' | 'forum'>('agenda');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const [rsvpedIds, setRsvpedIds] = useState<string[]>([]);

  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [threadBranchId, setThreadBranchId] = useState(PMB_BRANCHES[0].id);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadQuestion, setThreadQuestion] = useState('');
  const [forumError, setForumError] = useState<string | null>(null);
  const [submittingThread, setSubmittingThread] = useState(false);

  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    void monitoredFetch('/api/forum')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { threads?: ForumThread[] } | null) => {
        if (data?.threads) setThreads(data.threads);
      })
      .catch(() => {});
  }, []);

  const handleRsvp = async (eventId: string) => {
    if (rsvpedIds.includes(eventId)) return;
    incrementNewsRsvp(eventId);
    setRsvpedIds((prev) => [...prev, eventId]);
    void monitoredFetch(`/api/agenda/${eventId}/rsvp`, { method: 'POST' }).catch(() => {});
  };

  const handleCreateThread = async (e: FormEvent) => {
    e.preventDefault();
    setForumError(null);

    const branch = PMB_BRANCHES.find((b) => b.id === threadBranchId) ?? PMB_BRANCHES[0];
    setSubmittingThread(true);
    try {
      const res = await monitoredFetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: branch.id,
          branchName: branch.name,
          authorName,
          title: threadTitle,
          question: threadQuestion,
        }),
      });
      const data = (await res.json()) as { error?: string; thread?: ForumThread };
      if (!res.ok || !data.thread) {
        throw new Error(data.error || 'Impossible de publier votre question.');
      }
      setThreads((prev) => [data.thread!, ...prev]);
      setAuthorName('');
      setThreadTitle('');
      setThreadQuestion('');
    } catch (err) {
      setForumError(err instanceof Error ? err.message : 'Erreur de publication.');
    } finally {
      setSubmittingThread(false);
    }
  };

  const handlePostReply = async (threadId: string) => {
    if (replyAuthor.trim().length < 2 || replyMessage.trim().length < 4) return;
    try {
      const res = await monitoredFetch(`/api/forum/${threadId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: replyAuthor.trim(),
          role: 'client',
          message: replyMessage.trim(),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { thread: ForumThread };
        setThreads((prev) => prev.map((t) => (t.id === threadId ? data.thread : t)));
        setReplyAuthor('');
        setReplyMessage('');
        setReplyOpenId(null);
      }
    } catch {
      // Erreur silencieuse gérée par le moniteur
    }
  };

  const visibleEvents =
    branchFilter === 'all' ? events : events.filter((e) => e.branchId === branchFilter);
  const visibleThreads =
    branchFilter === 'all' ? threads : threads.filter((t) => t.branchId === branchFilter);

  return (
    <section
      id="communaute"
      className="no-print py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#229ED9] mb-2">
              Agenda, Annonces & Forum Clients
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Actualités des 6 branches et échanges directs
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Consultez les prochains webinaires et campagnes de terrain à Kinshasa ou posez vos
              questions directement aux équipes PMB GROUP SARL.
            </p>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#1c1c1e] border border-white/10 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('agenda')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'agenda'
                  ? 'bg-[#229ED9] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" aria-hidden="true" />
              <span>Agenda & Annonces ({events.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forum')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'forum'
                  ? 'bg-[#229ED9] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Forum Q&R ({threads.length})</span>
            </button>
          </div>
        </div>

        {/* Filtre par branche */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setBranchFilter('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              branchFilter === 'all'
                ? 'bg-[#262626] text-white border-white/25'
                : 'bg-[#18181b] text-zinc-400 border-white/[0.08] hover:text-white'
            }`}
          >
            Toutes les branches
          </button>
          {PMB_BRANCHES.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => setBranchFilter(branch.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                branchFilter === branch.id
                  ? 'bg-[#262626] text-white border-white/25'
                  : 'bg-[#18181b] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ backgroundColor: branch.accentColor }}
                aria-hidden="true"
              />
              <span>{branch.name}</span>
            </button>
          ))}
        </div>

        {activeTab === 'agenda' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleEvents.length === 0 ? (
              <div className="md:col-span-2 rounded-xl bg-[#1c1c1e]/92 border border-white/10 p-8 text-center text-sm text-zinc-400">
                Aucun événement programmé pour cette division actuellement.
              </div>
            ) : (
              visibleEvents.map((ev) => {
                const isRegistered = rsvpedIds.includes(ev.id);
                return (
                  <article
                    key={ev.id}
                    className="rounded-xl bg-[#1c1c1e]/92 border border-white/10 p-6 flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-400">
                        <span className="text-[#F59E0B] font-medium">{ev.type}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{ev.branchName}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono-tabular">{ev.dateLabel}</span>
                      </p>

                      <h3 className="text-lg font-bold text-white tracking-tight">{ev.title}</h3>
                      <p className="text-sm text-zinc-300 leading-relaxed">{ev.summary}</p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1 text-xs text-zinc-400">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#229ED9]" aria-hidden="true" />
                          <span>{ev.location}</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-mono-tabular">
                          <Users className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                          <span>{ev.rsvpCount} participants inscrits</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleRsvp(ev.id)}
                        disabled={isRegistered}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                          isRegistered
                            ? 'bg-[#262626] text-[#229ED9] border border-[#229ED9]/40 cursor-default'
                            : 'bg-[#229ED9] hover:bg-[#1b86b9] text-white'
                        }`}
                      >
                        {isRegistered ? 'Participation confirmée' : 'Réserver ma place'}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Formulaire nouvelle question forum */}
            <div className="lg:col-span-5 rounded-xl bg-[#1c1c1e]/92 border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-1">
                Poser une question à nos équipes
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-5">
                Vos questions publiques permettent d’éclairer l’ensemble de nos clients à Kinshasa.
              </p>

              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <label
                    htmlFor="forum-branch"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Branche concernée
                  </label>
                  <select
                    id="forum-branch"
                    value={threadBranchId}
                    onChange={(e) => setThreadBranchId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                  >
                    {PMB_BRANCHES.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.index}. {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="forum-author"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Votre nom
                  </label>
                  <input
                    id="forum-author"
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex. : Emmanuel Kalala"
                    className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="forum-title"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Sujet
                  </label>
                  <input
                    id="forum-title"
                    type="text"
                    value={threadTitle}
                    onChange={(e) => setThreadTitle(e.target.value)}
                    placeholder="Ex. : Location écran géant LED pour conférence"
                    className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="forum-question"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Votre question
                  </label>
                  <textarea
                    id="forum-question"
                    rows={3}
                    value={threadQuestion}
                    onChange={(e) => setThreadQuestion(e.target.value)}
                    placeholder="Précisez votre demande..."
                    className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                  />
                </div>

                {forumError && <p className="text-xs text-red-400">{forumError}</p>}

                <button
                  type="submit"
                  disabled={submittingThread}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1b86b9] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Publier sur le forum</span>
                </button>
              </form>
            </div>

            {/* Liste des discussions */}
            <div className="lg:col-span-7 space-y-4">
              {visibleThreads.map((thread) => (
                <article
                  key={thread.id}
                  className="rounded-xl bg-[#1c1c1e]/92 border border-white/10 p-6 space-y-4"
                >
                  <div className="space-y-1.5">
                    <p className="text-xs text-zinc-400">
                      <span>{thread.branchName}</span>
                      <span aria-hidden="true"> · </span>
                      <span>Par {thread.authorName}</span>
                      <span aria-hidden="true"> · </span>
                      <span
                        className={
                          thread.status === 'Répondu' ? 'text-[#229ED9] font-medium' : 'text-[#F59E0B]'
                        }
                      >
                        {thread.status}
                      </span>
                    </p>
                    <h4 className="text-base sm:text-lg font-bold text-white">{thread.title}</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{thread.question}</p>
                  </div>

                  {thread.replies.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-white/[0.08]">
                      {thread.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-lg bg-[#121212] border border-white/[0.07] p-3.5 text-xs sm:text-sm"
                        >
                          <p className="font-semibold text-white mb-1">
                            {reply.authorName}
                            {reply.role === 'team' ? ' · Équipe officielle PMB' : ''}
                          </p>
                          <p className="text-zinc-300 leading-relaxed">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyOpenId === thread.id ? (
                    <div className="pt-3 border-t border-white/[0.08] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          value={replyAuthor}
                          onChange={(e) => setReplyAuthor(e.target.value)}
                          placeholder="Votre nom"
                          className="px-3 py-2 text-xs bg-[#121212] text-white border border-white/15 rounded-lg"
                        />
                        <input
                          type="text"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Votre réponse ou précision..."
                          className="sm:col-span-2 px-3 py-2 text-xs bg-[#121212] text-white border border-white/15 rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handlePostReply(thread.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#229ED9] rounded-md cursor-pointer"
                        >
                          Envoyer la réponse
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyOpenId(null)}
                          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setReplyOpenId(thread.id)}
                        className="text-xs font-medium text-[#229ED9] hover:underline cursor-pointer"
                      >
                        Répondre à cette discussion
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
