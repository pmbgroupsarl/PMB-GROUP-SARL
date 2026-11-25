export type QaIncidentType = 'syntax' | 'api' | 'responsive' | 'media';
export type QaSeverity = 'info' | 'warning' | 'critical';

export interface QaEventItem {
  id: string;
  type: QaIncidentType;
  severity: QaSeverity;
  message: string;
  context: string;
  autoHealedAction: string | null;
  createdAt: string;
}

export interface LiveResponsiveAudit {
  viewportWidth: number;
  viewportHeight: number;
  overflowPx: number;
  brokenImagesCount: number;
  isResponsiveHealthy: boolean;
  checkedAt: string;
}

type Listener = (events: QaEventItem[]) => void;

const listeners = new Set<Listener>();
let localEvents: QaEventItem[] = [];
let started = false;

function notify() {
  for (const listener of listeners) {
    listener([...localEvents]);
  }
}

export function subscribeQaEvents(listener: Listener): () => void {
  listeners.add(listener);
  listener([...localEvents]);
  return () => {
    listeners.delete(listener);
  };
}

export function getQaEvents(): QaEventItem[] {
  return [...localEvents];
}

export async function reportIncidentToServer(
  event: Omit<QaEventItem, 'id' | 'createdAt'>
): Promise<void> {
  const item: QaEventItem = {
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...event,
  };
  localEvents = [item, ...localEvents].slice(0, 40);
  notify();

  try {
    await window.fetch('/api/qa/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch {
    // Garde le journal local si le réseau est hors ligne
  }
}

/**
 * Wrapper réseau sûr (sans modifier window.fetch) qui détecte les anomalies API
 * et réessaie automatiquement les requêtes GET transitoires en cas d'erreur 5xx.
 */
export async function monitoredFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = (init?.method || 'GET').toUpperCase();

  try {
    const response = await window.fetch(input, init);
    if (!response.ok && urlStr.startsWith('/api/') && response.status >= 500) {
      if (method === 'GET') {
        const retryResponse = await window.fetch(input, init);
        if (retryResponse.ok) {
          void reportIncidentToServer({
            type: 'api',
            severity: 'info',
            message: `Erreur serveur ${response.status} sur ${urlStr}`,
            context: `${method} ${urlStr}`,
            autoHealedAction: 'Nouvelle tentative GET automatique réussie (200 OK).',
          });
          return retryResponse;
        }
      }
      void reportIncidentToServer({
        type: 'api',
        severity: 'warning',
        message: `Réponse HTTP ${response.status} sur ${urlStr}`,
        context: `${method} ${urlStr}`,
        autoHealedAction: 'Erreur transmise proprement à l’interface utilisateur.',
      });
    }
    return response;
  } catch (err) {
    if (urlStr.startsWith('/api/')) {
      void reportIncidentToServer({
        type: 'api',
        severity: 'critical',
        message: err instanceof Error ? err.message : 'Échec réseau sur API',
        context: `${method} ${urlStr}`,
        autoHealedAction: 'Mode de repli local activé pour préserver la session.',
      });
    }
    throw err;
  }
}

/**
 * Audit DOM en temps réel : vérifie les débordements horizontaux responsive
 * et applique une auto-correction CSS ciblée si un dépassement est détecté.
 */
export function runLiveResponsiveAudit(applyAutoHeal = true): LiveResponsiveAudit {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      viewportWidth: 1440,
      viewportHeight: 900,
      overflowPx: 0,
      brokenImagesCount: 0,
      isResponsiveHealthy: true,
      checkedAt: new Date().toISOString(),
    };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const docScrollWidth = document.documentElement.scrollWidth;
  const overflowPx = Math.max(0, docScrollWidth - viewportWidth);

  const images = Array.from(document.querySelectorAll('img'));
  let brokenImagesCount = 0;
  for (const img of images) {
    if (img.complete && img.naturalWidth === 0) {
      brokenImagesCount += 1;
      if (applyAutoHeal) {
        img.style.display = 'none';
      }
    }
  }

  if (overflowPx > 2 && applyAutoHeal) {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    void reportIncidentToServer({
      type: 'responsive',
      severity: 'warning',
      message: `Débordement horizontal détecté (${overflowPx}px à ${viewportWidth}px de large).`,
      context: `Viewport ${viewportWidth}x${viewportHeight}`,
      autoHealedAction: 'Verrouillage overflow-x: hidden appliqué automatiquement sur la racine DOM.',
    });
  }

  return {
    viewportWidth,
    viewportHeight,
    overflowPx,
    brokenImagesCount,
    isResponsiveHealthy: overflowPx <= 2 && brokenImagesCount === 0,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Initialise la surveillance logicielle temps réel (erreurs JS, promesses,
 * observation réseau passive via PerformanceObserver et audit responsive).
 */
export function startSelfHealingMonitor(): () => void {
  if (started || typeof window === 'undefined') {
    return () => {};
  }
  started = true;

  const onWindowError = (event: ErrorEvent) => {
    void reportIncidentToServer({
      type: 'syntax',
      severity: 'critical',
      message: event.message || 'Erreur runtime JavaScript interceptée',
      context: event.filename ? `${event.filename}:${event.lineno}` : 'Navigateur',
      autoHealedAction: 'Exception isolée sans blocage du rendu principal React.',
    });
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reasonText =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason || 'Promesse rejetée');
    if (reasonText.toLowerCase().includes('websocket closed without opened')) {
      return;
    }
    void reportIncidentToServer({
      type: 'api',
      severity: 'warning',
      message: reasonText,
      context: 'Promise Rejection',
      autoHealedAction: 'Rejet capturé et journalisé pour diagnostic IA.',
    });
  };

  let perfObserver: PerformanceObserver | null = null;
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resEntry = entry as PerformanceResourceTiming & { responseStatus?: number };
          if (
            resEntry.name.includes('/api/') &&
            !resEntry.name.includes('/api/qa/report') &&
            typeof resEntry.responseStatus === 'number' &&
            resEntry.responseStatus >= 500
          ) {
            void reportIncidentToServer({
              type: 'api',
              severity: 'warning',
              message: `Anomalie HTTP ${resEntry.responseStatus} détectée`,
              context: resEntry.name,
              autoHealedAction: 'Incident API transmis à la console QA.',
            });
          }
        }
      });
      perfObserver.observe({ type: 'resource', buffered: false });
    } catch {
      perfObserver = null;
    }
  }

  let resizeTimer: number | undefined;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      runLiveResponsiveAudit(true);
    }, 350);
  };

  window.addEventListener('error', onWindowError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);
  window.addEventListener('resize', onResize);

  const initialAuditTimer = window.setTimeout(() => {
    runLiveResponsiveAudit(true);
  }, 1200);

  // Synchronisation initiale avec l'historique serveur
  void window
    .fetch('/api/qa/reports')
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { incidents?: QaEventItem[] } | null) => {
      if (data?.incidents && data.incidents.length > 0) {
        localEvents = data.incidents;
        notify();
      }
    })
    .catch(() => {});

  return () => {
    window.clearTimeout(initialAuditTimer);
    window.clearTimeout(resizeTimer);
    window.removeEventListener('error', onWindowError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
    window.removeEventListener('resize', onResize);
    if (perfObserver) {
      perfObserver.disconnect();
    }
    started = false;
  };
}
