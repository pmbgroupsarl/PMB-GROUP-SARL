import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, RefreshCw, ShieldAlert, Wrench, X } from 'lucide-react';
import {
  LiveResponsiveAudit,
  QaEventItem,
  monitoredFetch,
  runLiveResponsiveAudit,
  subscribeQaEvents,
} from '../lib/selfHealingMonitor';

interface AdminQADashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AiDiagnosticResult {
  healthGrade: string;
  summary: string;
  rootCause: string;
  recommendedPatch: string;
  analyzedAt: string;
}

export function AdminQADashboardModal({ isOpen, onClose }: AdminQADashboardModalProps) {
  const [events, setEvents] = useState<QaEventItem[]>([]);
  const [audit, setAudit] = useState<LiveResponsiveAudit | null>(null);
  const [diagnostic, setDiagnostic] = useState<AiDiagnosticResult | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [runningAi, setRunningAi] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeQaEvents(setEvents);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setAudit(runLiveResponsiveAudit(true));
  }, [isOpen]);

  const handleRunAiDiagnostic = async () => {
    const latestAudit = runLiveResponsiveAudit(true);
    setAudit(latestAudit);
    setRunningAi(true);
    setDiagError(null);

    try {
      const res = await monitoredFetch('/api/qa/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewportWidth: latestAudit.viewportWidth,
          overflowPx: latestAudit.overflowPx,
          brokenMediaCount: latestAudit.brokenImagesCount,
          recentIncidents: events.slice(0, 6),
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        diagnostic?: AiDiagnosticResult;
      };

      if (!res.ok || !data.diagnostic) {
        throw new Error(data.error || 'Diagnostic IA indisponible.');
      }

      setDiagnostic(data.diagnostic);
    } catch (err) {
      setDiagError(err instanceof Error ? err.message : 'Erreur lors du diagnostic IA.');
    } finally {
      setRunningAi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-modal-title"
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#18181b] border border-white/15 shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-medium text-[#F59E0B] mb-1">
              Console Technique · Auto-Debug & QA Robotique
            </p>
            <h2 id="qa-modal-title" className="text-xl sm:text-2xl font-bold text-white">
              Surveillance Logicielle & Diagnostic Senior IA
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la console QA"
            className="w-9 h-9 rounded-lg bg-[#262626] hover:bg-[#323232] text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit DOM Responsive temps réel */}
        {audit && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-[#121212] border border-white/[0.08] p-4">
              <p className="text-xs text-zinc-400">Viewport actif</p>
              <p className="text-lg font-bold text-white font-mono-tabular mt-1">
                {audit.viewportWidth} × {audit.viewportHeight}px
              </p>
            </div>
            <div className="rounded-xl bg-[#121212] border border-white/[0.08] p-4">
              <p className="text-xs text-zinc-400">Débordement horizontal</p>
              <p className="text-lg font-bold text-white font-mono-tabular mt-1">
                {audit.overflowPx}px · {audit.overflowPx <= 2 ? 'Conforme' : 'Corrigé'}
              </p>
            </div>
            <div className="rounded-xl bg-[#121212] border border-white/[0.08] p-4">
              <p className="text-xs text-zinc-400">Intégrité médias</p>
              <p className="text-lg font-bold text-white font-mono-tabular mt-1">
                {audit.brokenImagesCount === 0
                  ? '100% valides'
                  : `${audit.brokenImagesCount} isolé(s)`}
              </p>
            </div>
          </div>
        )}

        {/* Bouton d'analyse IA Senior */}
        <div className="rounded-xl bg-[#262626]/70 border border-white/10 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-[#229ED9] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Audit Automatisé par Intelligence Artificielle
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Analyse les erreurs JS, requêtes API et métriques responsive pour recommander un
                  correctif logiciel.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleRunAiDiagnostic()}
              disabled={runningAi}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1b86b9] disabled:opacity-60 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${runningAi ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{runningAi ? 'Analyse IA...' : 'Lancer un diagnostic IA'}</span>
            </button>
          </div>

          {diagError && <p className="text-xs text-red-400">{diagError}</p>}

          {diagnostic && (
            <div className="rounded-lg bg-[#121212] border border-[#229ED9]/40 p-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#229ED9]" aria-hidden="true" />
                  <span>État système : {diagnostic.healthGrade}</span>
                </span>
                <span className="text-[11px] text-zinc-500 font-mono-tabular">
                  {new Date(diagnostic.analyzedAt).toLocaleTimeString('fr-FR')}
                </span>
              </div>
              <p className="text-zinc-200">{diagnostic.summary}</p>
              <p className="text-zinc-400">
                <strong className="text-zinc-200">Cause racine :</strong> {diagnostic.rootCause}
              </p>
              <p className="text-[#F59E0B]">
                <strong>Action corrective recommandée :</strong> {diagnostic.recommendedPatch}
              </p>
            </div>
          )}
        </div>

        {/* Journal des anomalies et auto-corrections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Journal de surveillance & Auto-Corrections ({events.length})
            </h3>
            <button
              type="button"
              onClick={() => setAudit(runLiveResponsiveAudit(true))}
              className="text-xs text-[#229ED9] hover:underline cursor-pointer"
            >
              Relancer l’audit DOM
            </button>
          </div>

          {events.length === 0 ? (
            <div className="rounded-xl bg-[#121212] border border-white/[0.08] p-5 text-xs sm:text-sm text-zinc-400 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>
                Aucune erreur de syntaxe, anomalie API ou débordement responsive détecté sur la
                session en cours.
              </span>
            </div>
          ) : (
            <ul className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-lg bg-[#121212] border border-white/[0.08] p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-zinc-400">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
                      <span>
                        {ev.type.toUpperCase()} · {ev.context}
                      </span>
                    </span>
                    <span className="font-mono-tabular">
                      {new Date(ev.createdAt).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-zinc-200">{ev.message}</p>
                  {ev.autoHealedAction && (
                    <p className="inline-flex items-center gap-1.5 text-emerald-400">
                      <Wrench className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Auto-correction : {ev.autoHealedAction}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
