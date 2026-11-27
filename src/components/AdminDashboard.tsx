import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  Edit3,
  FileText,
  Layers,
  Lock,
  LogOut,
  Newspaper,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import {
  CatalogArticleItem,
  FAQItem,
  FondationProjectItem,
  PMB_BRANCHES,
  userCategories,
} from '../data/pmbData';
import { MembershipExportPayload } from '../lib/membershipExport';
import {
  MembershipSubscriberRecord,
  NewsActuItem,
  OrderStatus,
  SubscriptionStatus,
  usePmbStore,
} from '../lib/pmbStore';
import { MembershipSheetPreview } from './registration/MembershipSheetPreview';

type AdminTab = 'subscribers' | 'orders' | 'cms';
type CmsSubTab = 'services' | 'faqs' | 'actus' | 'projects' | 'articles';
type SubscriberFilter = 'all' | 'effectif' | 'expiring' | 'pending' | 'visitor';

interface AdminDashboardProps {
  onOpenQaDashboard?: () => void;
}

export function AdminDashboard({ onOpenQaDashboard }: AdminDashboardProps) {
  const {
    memberships,
    orders,
    cms,
    adminCreateMember,
    validateMembership,
    sendRenewalReminder,
    addOrder,
    updateOrderStatus,
    addBranchService,
    updateBranchService,
    deleteBranchService,
    addFondationProject,
    updateFondationProject,
    deleteFondationProject,
    addCatalogArticle,
    updateCatalogArticle,
    deleteCatalogArticle,
    addFaqItem,
    updateFaqItem,
    deleteFaqItem,
    addNewsActu,
    updateNewsActu,
    deleteNewsActu,
    resetAllDemoData,
  } = usePmbStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'loading' | 'setup' | 'login'>('loading');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginSecret, setLoginSecret] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/portal-auth/status')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('status_error'))))
      .then((data: { mode?: 'setup' | 'login' }) => {
        if (!active) return;
        setAuthMode(data.mode === 'setup' ? 'setup' : 'login');
      })
      .catch(() => {
        if (!active) return;
        setAuthMode('login');
      });
    return () => {
      active = false;
    };
  }, []);

  const [activeTab, setActiveTab] = useState<AdminTab>('subscribers');
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Onglet 1 : Membres & Adhésions
  const [subFilter, setSubFilter] = useState<SubscriberFilter>('all');
  const [subSearch, setSubSearch] = useState('');
  const [inspectedRecord, setInspectedRecord] =
    useState<MembershipSubscriberRecord | null>(null);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [newMemberBranchId, setNewMemberBranchId] = useState<string>('pmb-fondation');
  const [newMemberFullName, setNewMemberFullName] = useState('');
  const [newMemberGender, setNewMemberGender] = useState('Femme');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('+243 ');
  const [newMemberCategory, setNewMemberCategory] = useState(
    userCategories[0] || 'Membre effectif'
  );
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberStatus, setNewMemberStatus] = useState<SubscriptionStatus>('Actif');
  const [newMemberAmountUsd, setNewMemberAmountUsd] = useState('20');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberError, setNewMemberError] = useState<string | null>(null);

  // Onglet 2 : Suivi des commandes par branche
  const [orderBranchFilter, setOrderBranchFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [newOrderBranchId, setNewOrderBranchId] = useState<string>('pmb-shop');
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderContact, setNewOrderContact] = useState('');
  const [newOrderItem, setNewOrderItem] = useState('');
  const [newOrderAmount, setNewOrderAmount] = useState('');

  // Onglet 3 : CMS Contenu (Services, FAQ, Actus, Projets, Catalogue)
  const [cmsSubTab, setCmsSubTab] = useState<CmsSubTab>('services');
  const [cmsBranchId, setCmsBranchId] = useState<string>('pmb-fondation');
  const [newServiceText, setNewServiceText] = useState('');
  const [editingServiceIdx, setEditingServiceIdx] = useState<number | null>(null);
  const [editingServiceText, setEditingServiceText] = useState('');

  // Actus & Agenda CMS
  const [editingActuId, setEditingActuId] = useState<string | null>(null);
  const [actuBranchId, setActuBranchId] = useState<string>('pmb-fondation');
  const [actuType, setActuType] = useState<NewsActuItem['type']>('Actualité');
  const [actuTitle, setActuTitle] = useState('');
  const [actuDateLabel, setActuDateLabel] = useState('Novembre 2026');
  const [actuLocation, setActuLocation] = useState('Bandal Synkin — Kinshasa');
  const [actuSummary, setActuSummary] = useState('');

  // Projets Fondation CMS
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projLocation, setProjLocation] = useState('Kinshasa, RDC');
  const [projStatus, setProjStatus] =
    useState<FondationProjectItem['status']>('En cours');
  const [projDateLabel, setProjDateLabel] = useState('Novembre 2026');
  const [projSummary, setProjSummary] = useState('');

  // Articles Shop / Store CMS
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [artBranchId, setArtBranchId] =
    useState<CatalogArticleItem['branchId']>('pmb-shop');
  const [artTitle, setArtTitle] = useState('');
  const [artDescription, setArtDescription] = useState('');
  const [artPrice, setArtPrice] = useState('');
  const [artInStock, setArtInStock] = useState<boolean>(true);

  // FAQ CMS
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqCategory, setFaqCategory] = useState('PMB Fondation');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  const showToast = (msg: string) => {
    setAdminFeedback(msg);
    setTimeout(() => {
      setAdminFeedback((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handlePortalAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanSecret = loginSecret.trim();
    if (!cleanId || !cleanSecret) {
      setLoginError('Veuillez saisir votre identifiant et votre mot de passe.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      const endpoint =
        authMode === 'setup' ? '/api/portal-auth/bootstrap' : '/api/portal-auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, secret: cleanSecret }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        authenticated?: boolean;
        token?: string;
        error?: string;
      };
      if (!res.ok || !data.authenticated || !data.token) {
        setLoginError(
          data.error || 'Identifiants invalides. Veuillez vérifier votre saisie.'
        );
        if (res.status === 409 && authMode === 'setup') {
          setAuthMode('login');
        }
        return;
      }

      setAuthToken(data.token);
      setIsAuthenticated(true);
      setAuthMode('login');
      setLoginIdentifier('');
      setLoginSecret('');
    } catch {
      setLoginError('Impossible de vérifier les identifiants pour le moment.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleAdminLogout = async () => {
    const token = authToken;
    setAuthToken(null);
    setIsAuthenticated(false);
    setLoginIdentifier('');
    setLoginSecret('');
    setInspectedRecord(null);
    if (token) {
      await fetch('/api/portal-auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const kpis = useMemo(() => {
    const total = memberships.length;
    const effectifs = memberships.filter((m) => m.category === 'Membre effectif').length;
    const toRenew = memberships.filter(
      (m) => m.subscriptionStatus === 'Expire bientôt' || m.subscriptionStatus === 'Expiré'
    ).length;
    const visitors = memberships.filter((m) => m.kind === 'visitor').length;
    return { total, effectifs, toRenew, visitors };
  }, [memberships]);

  const branchOrderCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const branch of PMB_BRANCHES) {
      map[branch.id] = orders.filter((o) => o.branchId === branch.id).length;
    }
    return map;
  }, [orders]);

  const filteredMemberships = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    return memberships.filter((m) => {
      if (subFilter === 'effectif' && m.category !== 'Membre effectif') return false;
      if (
        subFilter === 'expiring' &&
        m.subscriptionStatus !== 'Expire bientôt' &&
        m.subscriptionStatus !== 'Expiré'
      ) {
        return false;
      }
      if (subFilter === 'pending' && m.subscriptionStatus !== 'En attente de validation') {
        return false;
      }
      if (subFilter === 'visitor' && m.kind !== 'visitor') return false;

      if (!q) return true;
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.dossierId.toLowerCase().includes(q) ||
        m.branchName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q)
      );
    });
  }, [memberships, subFilter, subSearch]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderBranchFilter !== 'all' && o.branchId !== orderBranchFilter) return false;
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      return true;
    });
  }, [orders, orderBranchFilter, orderStatusFilter]);

  const inspectedSheetPayload = useMemo<MembershipExportPayload | null>(() => {
    if (!inspectedRecord) return null;
    const branch = PMB_BRANCHES.find((b) => b.id === inspectedRecord.branchId);
    return {
      reference: inspectedRecord.dossierId,
      createdAtLabel: inspectedRecord.createdAtLabel,
      title: `FICHE D'ADHÉSION OFFICIELLE — ${inspectedRecord.branchName.toUpperCase()}`,
      branchId: inspectedRecord.branchId,
      branchName: inspectedRecord.branchName,
      branchLogo: branch?.logoImage,
      accentColor: branch?.accentColor,
      fullName: inspectedRecord.fullName,
      gender: inspectedRecord.gender,
      birthDate: inspectedRecord.birthDate,
      birthPlace: inspectedRecord.birthPlace,
      address: inspectedRecord.address,
      phone: inspectedRecord.phone,
      category: inspectedRecord.category,
      photoDataUrl: inspectedRecord.photoDataUrl,
      paymentTicket: inspectedRecord.paymentTicket,
      extraRows: inspectedRecord.extraRows,
      commitmentText: inspectedRecord.commitmentText,
    };
  }, [inspectedRecord]);

  const handleCreateOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!newOrderCustomer.trim() || !newOrderItem.trim()) return;
    const branch = PMB_BRANCHES.find((b) => b.id === newOrderBranchId) ?? PMB_BRANCHES[0];
    addOrder({
      branchId: branch.id,
      branchName: branch.name,
      customerName: newOrderCustomer.trim(),
      customerContact: newOrderContact.trim() || '+243',
      serviceOrArticle: newOrderItem.trim(),
      amountLabel: newOrderAmount.trim() || 'Sur devis',
      status: 'En attente',
    });
    setNewOrderCustomer('');
    setNewOrderContact('');
    setNewOrderItem('');
    setNewOrderAmount('');
    setShowNewOrderForm(false);
    showToast(`Nouvelle commande enregistrée pour ${branch.name}.`);
  };

  const handleCreateMember = (e: FormEvent) => {
    e.preventDefault();
    setNewMemberError(null);
    const parsedAmount = Number(newMemberAmountUsd.replace(',', '.').trim());
    const res = adminCreateMember({
      branchId: newMemberBranchId,
      fullName: newMemberFullName,
      gender: newMemberGender,
      email: newMemberEmail,
      phone: newMemberPhone,
      category: newMemberCategory,
      address: newMemberAddress,
      subscriptionStatus: newMemberStatus,
      initialPassword: newMemberPassword,
      initialAmountUsd:
        !Number.isNaN(parsedAmount) && parsedAmount >= 20 ? parsedAmount : undefined,
    });

    if (!res.ok || !res.record) {
      setNewMemberError(res.error || "Impossible d'ajouter ce membre.");
      return;
    }

    setNewMemberFullName('');
    setNewMemberEmail('');
    setNewMemberPhone('+243 ');
    setNewMemberAddress('');
    setNewMemberAmountUsd('20');
    setNewMemberPassword('');
    setShowNewMemberForm(false);
    showToast(
      `Membre ${res.record.fullName} ajouté (${res.record.dossierId}). Compte prêt pour ${res.record.email}.`
    );
  };

  const handleSaveActu = (e: FormEvent) => {
    e.preventDefault();
    if (!actuTitle.trim() || !actuSummary.trim()) return;
    const branch = PMB_BRANCHES.find((b) => b.id === actuBranchId) ?? PMB_BRANCHES[0];
    if (editingActuId) {
      const existing = cms.newsActus.find((a) => a.id === editingActuId);
      updateNewsActu({
        id: editingActuId,
        branchId: branch.id,
        branchName: branch.name,
        type: actuType,
        title: actuTitle.trim(),
        dateLabel: actuDateLabel.trim() || 'Novembre 2026',
        location: actuLocation.trim() || 'Kinshasa, RDC',
        summary: actuSummary.trim(),
        rsvpCount: existing?.rsvpCount ?? 0,
      });
      setEditingActuId(null);
      showToast('Actualité mise à jour immédiatement sur le site.');
    } else {
      addNewsActu({
        branchId: branch.id,
        branchName: branch.name,
        type: actuType,
        title: actuTitle.trim(),
        dateLabel: actuDateLabel.trim() || 'Novembre 2026',
        location: actuLocation.trim() || 'Kinshasa, RDC',
        summary: actuSummary.trim(),
      });
      showToast('Nouvelle actualité publiée dans « Actualités des 6 branches ».');
    }
    setActuTitle('');
    setActuSummary('');
  };

  const handleSaveProject = (e: FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projSummary.trim()) return;
    if (editingProjectId) {
      updateFondationProject({
        id: editingProjectId,
        title: projTitle.trim(),
        location: projLocation.trim() || 'Kinshasa, RDC',
        status: projStatus,
        dateLabel: projDateLabel.trim() || 'Novembre 2026',
        summary: projSummary.trim(),
      });
      setEditingProjectId(null);
      showToast('Projet PMB Fondation mis à jour sur le site.');
    } else {
      addFondationProject({
        title: projTitle.trim(),
        location: projLocation.trim() || 'Kinshasa, RDC',
        status: projStatus,
        dateLabel: projDateLabel.trim() || 'Novembre 2026',
        summary: projSummary.trim(),
      });
      showToast('Nouveau projet ajouté à PMB Fondation.');
    }
    setProjTitle('');
    setProjSummary('');
  };

  const handleSaveArticle = (e: FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artPrice.trim()) return;
    const artBranchName = artBranchId === 'pmb-shop' ? 'PMB Shop' : 'PMB Store';
    if (editingArticleId) {
      updateCatalogArticle({
        id: editingArticleId,
        branchId: artBranchId,
        branchName: artBranchName,
        title: artTitle.trim(),
        description: artDescription.trim() || 'Disponible au showroom Kinshasa.',
        priceLabel: artPrice.trim(),
        inStock: artInStock,
      });
      setEditingArticleId(null);
      showToast('Article catalogue mis à jour en direct.');
    } else {
      addCatalogArticle({
        branchId: artBranchId,
        branchName: artBranchName,
        title: artTitle.trim(),
        description: artDescription.trim() || 'Disponible au showroom Kinshasa.',
        priceLabel: artPrice.trim(),
        inStock: artInStock,
      });
      showToast('Nouvel article publié dans le catalogue.');
    }
    setArtTitle('');
    setArtDescription('');
    setArtPrice('');
  };

  const handleSaveFaq = (e: FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    if (editingFaqId) {
      updateFaqItem({
        id: editingFaqId,
        category: faqCategory.trim() || 'Général',
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
      });
      setEditingFaqId(null);
      showToast('Question FAQ mise à jour en direct.');
    } else {
      addFaqItem({
        category: faqCategory.trim() || 'Général',
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
      });
      showToast('Nouvelle question ajoutée à la FAQ.');
    }
    setFaqQuestion('');
    setFaqAnswer('');
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-start gap-3.5 border-b border-white/[0.08] pb-4">
          <div className="w-11 h-11 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-[#F59E0B]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
              Console Administration Sécurisée
            </p>
            <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Dashboard Administrateur Tout-en-Un
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {authMode === 'setup'
                ? 'Premier lancement : définissez votre identifiant et votre mot de passe d’accès pour activer le tableau de bord.'
                : 'Veuillez saisir vos identifiants d’accès pour ouvrir le tableau de bord.'}
            </p>
          </div>
        </div>

        <form onSubmit={handlePortalAuthSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="portal-id" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Identifiant
              </label>
              <input
                id="portal-id"
                type="text"
                autoComplete="off"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Identifiant d’accès"
                disabled={authMode === 'loading' || isSubmittingAuth}
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white font-mono-tabular focus:border-[#F59E0B] focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="portal-secret" className="block text-xs font-medium text-zinc-300 mb-1.5">
                {authMode === 'setup' ? 'Définir un mot de passe (min. 4 car.)' : 'Mot de passe'}
              </label>
              <input
                id="portal-secret"
                type="password"
                autoComplete="off"
                value={loginSecret}
                onChange={(e) => setLoginSecret(e.target.value)}
                placeholder="••••"
                disabled={authMode === 'loading' || isSubmittingAuth}
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white font-mono-tabular focus:border-[#F59E0B] focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {loginError && (
            <p role="alert" className="text-xs text-red-400">
              {loginError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={authMode === 'loading' || isSubmittingAuth}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] disabled:opacity-60 text-[#121212] text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>
                {authMode === 'loading'
                  ? 'Vérification...'
                  : isSubmittingAuth
                    ? 'Validation...'
                    : authMode === 'setup'
                      ? 'Configurer et ouvrir le Dashboard'
                      : 'Ouvrir le Dashboard'}
              </span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/10 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar fixe 240px desktop */}
        <aside className="no-print bg-[#121212] border-b lg:border-b-0 lg:border-r border-white/[0.08] p-4 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="px-2 pt-1 pb-3 border-b border-white/[0.08]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F59E0B]">
                Administration PMB
              </p>
              <p className="text-sm font-bold text-white mt-0.5">Pilotage Tout-en-Un</p>
            </div>

            <nav aria-label="Modules d'administration" className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('subscribers')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'subscribers'
                    ? 'bg-[#229ED9] text-white'
                    : 'text-zinc-300 hover:bg-[#1c1c1e] hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Gestion des Membres</span>
                </span>
                <span className="font-mono-tabular text-xs opacity-80">{memberships.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-[#229ED9] text-white'
                    : 'text-zinc-300 hover:bg-[#1c1c1e] hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Commandes & Branches</span>
                </span>
                <span className="font-mono-tabular text-xs opacity-80">{orders.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cms')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'cms'
                    ? 'bg-[#229ED9] text-white'
                    : 'text-zinc-300 hover:bg-[#1c1c1e] hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>CMS Contenus Site</span>
                </span>
              </button>
            </nav>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/[0.08]">
            {onOpenQaDashboard && (
              <button
                type="button"
                onClick={onOpenQaDashboard}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-[#F59E0B] hover:bg-[#1c1c1e] transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Console QA IA</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                void handleAdminLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#1c1c1e] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Verrouiller le Dashboard</span>
            </button>
          </div>
        </aside>

        {/* Zone principale du dashboard */}
        <div className="p-5 sm:p-7 space-y-6 min-w-0">
          {/* Top Bar Breadcrumb + Actions */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div>
              <p className="text-xs text-zinc-400">
                Administration /{' '}
                <span className="text-white font-medium">
                  {activeTab === 'subscribers'
                    ? 'Gestion des Membres, Abonnés & Adhésions'
                    : activeTab === 'orders'
                      ? 'Suivi des Commandes & Prestations par Branche'
                      : 'CMS Contenus (Services, FAQ, Actus, Projets & Catalogue)'}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {confirmReset ? (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs">
                  <span className="text-amber-200">Confirmer la réinitialisation ?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetAllDemoData();
                      setConfirmReset(false);
                      setInspectedRecord(null);
                      showToast('Données initiales restaurées.');
                    }}
                    className="font-bold text-white hover:underline cursor-pointer"
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#121212] hover:bg-[#262626] text-xs text-zinc-300 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Réinitialiser les données</span>
                </button>
              )}
            </div>
          </div>

          {adminFeedback && (
            <div
              role="status"
              className="no-print rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-300 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{adminFeedback}</span>
            </div>
          )}

          {/* ==================== TAB 1 : GESTION DES MEMBRES ==================== */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              {inspectedSheetPayload && (
                <div className="space-y-3">
                  <div className="no-print flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                      Fiche A4 officielle — {inspectedSheetPayload.branchName}
                    </p>
                    <button
                      type="button"
                      onClick={() => setInspectedRecord(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-zinc-700 text-xs text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Fermer l’aperçu A4</span>
                    </button>
                  </div>
                  <MembershipSheetPreview
                    data={inspectedSheetPayload}
                    onEditForm={() => setInspectedRecord(null)}
                    printScope="portal"
                  />
                </div>
              )}

              {/* 4 KPI tabulaires */}
              <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg bg-[#121212] border border-white/10 p-4">
                  <p className="text-xs text-zinc-400">Total Dossiers</p>
                  <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
                    {kpis.total}
                  </p>
                </div>
                <div className="rounded-lg bg-[#121212] border border-white/10 p-4">
                  <p className="text-xs text-zinc-400">Membres effectifs</p>
                  <p className="text-2xl font-bold text-[#229ED9] font-mono-tabular mt-1">
                    {kpis.effectifs}
                  </p>
                </div>
                <div className="rounded-lg bg-[#121212] border border-white/10 p-4">
                  <p className="text-xs text-zinc-400">À renouveler / Expirés</p>
                  <p className="text-2xl font-bold text-[#F59E0B] font-mono-tabular mt-1">
                    {kpis.toRenew}
                  </p>
                </div>
                <div className="rounded-lg bg-[#121212] border border-white/10 p-4">
                  <p className="text-xs text-zinc-400">Visiteurs ponctuels</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono-tabular mt-1">
                    {kpis.visitors}
                  </p>
                </div>
              </div>

              {/* Filtres, Recherche & Ajout Membre */}
              <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      ['all', 'Tous'],
                      ['effectif', 'Membres effectifs'],
                      ['expiring', 'Expire / Expiré'],
                      ['pending', 'En attente'],
                      ['visitor', 'Visiteurs'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSubFilter(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer whitespace-nowrap ${
                        subFilter === id
                          ? 'bg-[#229ED9] text-white border-[#229ED9]'
                          : 'bg-[#121212] text-zinc-300 border-white/10 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search
                      className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      placeholder="Rechercher nom, dossier, tél..."
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:border-[#229ED9] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNewMemberForm((v) => !v);
                      setNewMemberError(null);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{showNewMemberForm ? 'Fermer le formulaire' : 'Ajouter un membre'}</span>
                  </button>
                </div>
              </div>

              {showNewMemberForm && (
                <form
                  onSubmit={handleCreateMember}
                  noValidate
                  className="no-print rounded-xl bg-[#121212] border border-[#F59E0B]/40 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                    <div>
                      <p className="text-sm font-bold text-white">
                        Nouvel enregistrement de membre (avec accès Espace Membre)
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Crée le dossier officiel, la carte numérique et les identifiants de
                        connexion du membre.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewMemberForm(false)}
                      aria-label="Fermer"
                      className="text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div>
                      <label
                        htmlFor="adm-mem-branch"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Branche concernée *
                      </label>
                      <select
                        id="adm-mem-branch"
                        value={newMemberBranchId}
                        onChange={(e) => setNewMemberBranchId(e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#229ED9] focus:outline-none"
                      >
                        {PMB_BRANCHES.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="adm-mem-name"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Nom complet *
                      </label>
                      <input
                        id="adm-mem-name"
                        type="text"
                        value={newMemberFullName}
                        onChange={(e) => setNewMemberFullName(e.target.value)}
                        placeholder="Ex. : Grâce Mbuyi"
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="adm-mem-gender"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Sexe / Genre
                      </label>
                      <select
                        id="adm-mem-gender"
                        value={newMemberGender}
                        onChange={(e) => setNewMemberGender(e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#229ED9] focus:outline-none"
                      >
                        <option value="Femme">Femme</option>
                        <option value="Homme">Homme</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="adm-mem-email"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        E-mail (Identifiant connexion) *
                      </label>
                      <input
                        id="adm-mem-email"
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="membre@exemple.cd"
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="adm-mem-phone"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Téléphone WhatsApp *
                      </label>
                      <input
                        id="adm-mem-phone"
                        type="tel"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                        placeholder="+243 810 000 000"
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="adm-mem-cat"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Catégorie d’adhésion *
                      </label>
                      <select
                        id="adm-mem-cat"
                        value={newMemberCategory}
                        onChange={(e) => setNewMemberCategory(e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#229ED9] focus:outline-none"
                      >
                        {userCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="adm-mem-status"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Statut initial
                      </label>
                      <select
                        id="adm-mem-status"
                        value={newMemberStatus}
                        onChange={(e) => setNewMemberStatus(e.target.value as SubscriptionStatus)}
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#229ED9] focus:outline-none"
                      >
                        <option value="Actif">Actif (30 jours)</option>
                        <option value="En attente de validation">En attente de validation</option>
                        <option value="Expire bientôt">Expire bientôt (J-5)</option>
                        <option value="Expiré">Expiré</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="adm-mem-amount"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Cotisation versée ($ USD, ≥ 20 ou vide)
                      </label>
                      <input
                        id="adm-mem-amount"
                        type="number"
                        min="0"
                        step="1"
                        value={newMemberAmountUsd}
                        onChange={(e) => setNewMemberAmountUsd(e.target.value)}
                        placeholder="20"
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="adm-mem-pwd"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Mot de passe initial (min. 4 car.)
                      </label>
                      <input
                        id="adm-mem-pwd"
                        type="password"
                        value={newMemberPassword}
                        onChange={(e) => setNewMemberPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label
                        htmlFor="adm-mem-addr"
                        className="block text-xs font-medium text-zinc-300 mb-1"
                      >
                        Adresse complète à Kinshasa
                      </label>
                      <input
                        id="adm-mem-addr"
                        type="text"
                        value={newMemberAddress}
                        onChange={(e) => setNewMemberAddress(e.target.value)}
                        placeholder="Ex. : C. Bandalungwa, Q. Synkin, Av. Kisangani N° 1"
                        className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>
                  </div>

                  {newMemberError && (
                    <p role="alert" className="text-xs text-red-400">
                      {newMemberError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewMemberForm(false)}
                      className="px-3.5 py-2 rounded-lg border border-white/10 bg-[#1c1c1e] hover:bg-[#262626] text-xs font-medium text-zinc-300 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Enregistrer le membre</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Table Membres */}
              <div className="no-print overflow-x-auto rounded-xl border border-white/10 bg-[#121212]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#1c1c1e] text-zinc-300 text-xs border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Branche & Dossier</th>
                      <th className="px-4 py-3 font-semibold">Membre / Visiteur</th>
                      <th className="px-4 py-3 font-semibold">Catégorie & Paiement</th>
                      <th className="px-4 py-3 font-semibold">Statut & Échéance</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredMemberships.map((rec) => {
                      const branch = PMB_BRANCHES.find((b) => b.id === rec.branchId);
                      return (
                        <tr key={rec.id} className="hover:bg-[#1c1c1e]/60">
                          <td className="px-4 py-3.5 align-top">
                            <div className="flex items-center gap-2.5">
                              {branch && (
                                <img
                                  src={branch.logoImage}
                                  alt={`Logo ${branch.name}`}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded object-contain bg-white p-0.5 border border-white/15 shrink-0"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-white text-xs">{rec.branchName}</p>
                                <p className="font-mono-tabular text-[11px] text-zinc-400">
                                  {rec.dossierId}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 align-top">
                            <p className="font-semibold text-white">{rec.fullName}</p>
                            <p className="text-xs text-zinc-400 font-mono-tabular">{rec.phone}</p>
                            <p className="text-[11px] text-zinc-500">{rec.email}</p>
                          </td>

                          <td className="px-4 py-3.5 align-top">
                            <p className="text-xs font-medium text-zinc-200">{rec.category}</p>
                            {rec.paymentTicket ? (
                              <p className="text-[11px] text-zinc-400 font-mono-tabular mt-0.5">
                                {rec.paymentTicket.amountUsd.toFixed(2)} $ ·{' '}
                                {rec.paymentTicket.ticketNumber}
                              </p>
                            ) : (
                              <p className="text-[11px] text-zinc-500 mt-0.5">Sans cotisation</p>
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-top">
                            <p
                              className={`text-xs font-semibold ${
                                rec.subscriptionStatus === 'Actif' ||
                                rec.subscriptionStatus === 'Don ponctuel confirmé'
                                  ? 'text-emerald-400'
                                  : rec.subscriptionStatus === 'Expiré'
                                    ? 'text-red-400'
                                    : 'text-[#F59E0B]'
                              }`}
                            >
                              {rec.subscriptionStatus}
                            </p>
                            <p className="text-[11px] text-zinc-400 font-mono-tabular mt-0.5">
                              Échéance : {rec.expiresAtLabel}
                            </p>
                            {rec.lastReminderAtLabel && (
                              <p className="text-[11px] text-[#229ED9] font-mono-tabular mt-0.5">
                                Rappel : {rec.lastReminderAtLabel}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-top text-right">
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {rec.subscriptionStatus !== 'Actif' &&
                                rec.subscriptionStatus !== 'Don ponctuel confirmé' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      validateMembership(rec.id);
                                      showToast(
                                        `Adhésion de ${rec.fullName} validée (statut Actif 30 jours).`
                                      );
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Valider l’adhésion</span>
                                  </button>
                                )}

                              {rec.kind === 'member' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    sendRenewalReminder(rec.id);
                                    showToast(
                                      `Rappel de réabonnement envoyé à ${rec.fullName} (${rec.email}).`
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/40 text-white text-[11px] font-medium cursor-pointer whitespace-nowrap"
                                >
                                  <Bell className="w-3.5 h-3.5 text-[#229ED9]" aria-hidden="true" />
                                  <span>Envoyer un rappel</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setInspectedRecord(rec)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#262626] hover:bg-zinc-700 border border-white/10 text-zinc-200 text-[11px] font-medium cursor-pointer whitespace-nowrap"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
                                <span>Fiche A4</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 2 : SUIVI DES COMMANDES PAR BRANCHE ==================== */}
          {activeTab === 'orders' && (
            <div className="no-print space-y-5">
              {/* Compteur rapide par branche */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {PMB_BRANCHES.map((branch) => {
                  const active = orderBranchFilter === branch.id;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() =>
                        setOrderBranchFilter(active ? 'all' : branch.id)
                      }
                      className={`rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#262626] border-[#229ED9]'
                          : 'bg-[#121212] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <img
                          src={branch.logoImage}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded object-contain bg-white p-0.5 shrink-0"
                        />
                        <span className="text-lg font-bold font-mono-tabular text-white">
                          {branchOrderCounts[branch.id] ?? 0}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-zinc-300 mt-1.5 truncate">
                        {branch.name}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Filtrer par branche"
                    value={orderBranchFilter}
                    onChange={(e) => setOrderBranchFilter(e.target.value)}
                    className="rounded-lg border border-white/15 bg-[#121212] px-3 py-2 text-xs text-white focus:border-[#229ED9] focus:outline-none"
                  >
                    <option value="all">Toutes les 6 branches</option>
                    {PMB_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filtrer par statut"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="rounded-lg border border-white/15 bg-[#121212] px-3 py-2 text-xs text-white focus:border-[#229ED9] focus:outline-none"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="En attente">En attente</option>
                    <option value="Confirmée">Confirmée</option>
                    <option value="Livrée / Terminée">Livrée / Terminée</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewOrderForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Nouvelle commande / prestation</span>
                </button>
              </div>

              {showNewOrderForm && (
                <form
                  onSubmit={handleCreateOrder}
                  className="rounded-xl bg-[#121212] border border-white/15 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
                >
                  <select
                    value={newOrderBranchId}
                    onChange={(e) => setNewOrderBranchId(e.target.value)}
                    className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                  >
                    {PMB_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={newOrderCustomer}
                    onChange={(e) => setNewOrderCustomer(e.target.value)}
                    placeholder="Client / Entreprise *"
                    className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newOrderContact}
                    onChange={(e) => setNewOrderContact(e.target.value)}
                    placeholder="Téléphone / E-mail"
                    className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    value={newOrderItem}
                    onChange={(e) => setNewOrderItem(e.target.value)}
                    placeholder="Service ou article *"
                    className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOrderAmount}
                      onChange={(e) => setNewOrderAmount(e.target.value)}
                      placeholder="Montant ($)"
                      className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg bg-[#F59E0B] text-[#121212] text-xs font-bold cursor-pointer shrink-0"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#121212]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#1c1c1e] text-zinc-300 text-xs border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Branche & Réf.</th>
                      <th className="px-4 py-3 font-semibold">Client</th>
                      <th className="px-4 py-3 font-semibold">Prestation / Article</th>
                      <th className="px-4 py-3 font-semibold">Montant</th>
                      <th className="px-4 py-3 font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredOrders.map((ord) => {
                      const branch = PMB_BRANCHES.find((b) => b.id === ord.branchId);
                      return (
                        <tr key={ord.id} className="hover:bg-[#1c1c1e]/60">
                          <td className="px-4 py-3.5 align-top">
                            <div className="flex items-center gap-2.5">
                              {branch && (
                                <img
                                  src={branch.logoImage}
                                  alt={`Logo ${branch.name}`}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded object-contain bg-white p-0.5 border border-white/15 shrink-0"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-white text-xs">{ord.branchName}</p>
                                <p className="font-mono-tabular text-[11px] text-zinc-400">
                                  {ord.reference}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-top">
                            <p className="font-medium text-white">{ord.customerName}</p>
                            <p className="text-[11px] text-zinc-400 font-mono-tabular">
                              {ord.customerContact}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 align-top text-xs text-zinc-200 max-w-xs">
                            {ord.serviceOrArticle}
                          </td>
                          <td className="px-4 py-3.5 align-top font-mono-tabular text-xs font-semibold text-[#F59E0B] whitespace-nowrap">
                            {ord.amountLabel}
                          </td>
                          <td className="px-4 py-3.5 align-top">
                            <select
                              aria-label={`Statut de la commande ${ord.reference}`}
                              value={ord.status}
                              onChange={(e) => {
                                updateOrderStatus(ord.id, e.target.value as OrderStatus);
                                showToast(`Statut de ${ord.reference} passé à « ${e.target.value} ».`);
                              }}
                              className="rounded-md border border-white/15 bg-[#1c1c1e] px-2.5 py-1.5 text-xs text-white focus:border-[#229ED9] focus:outline-none"
                            >
                              <option value="En attente">En attente</option>
                              <option value="Confirmée">Confirmée</option>
                              <option value="Livrée / Terminée">Livrée / Terminée</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 3 : CMS CONTENUS (SERVICES, FAQ, ACTUS) ==================== */}
          {activeTab === 'cms' && (
            <div className="no-print space-y-6">
              <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.08] pb-3">
                {(
                  [
                    ['services', 'Services par branche'],
                    ['faqs', 'Questions FAQ'],
                    ['actus', 'Actus & Agenda'],
                    ['projects', 'Projets Fondation'],
                    ['articles', 'Articles Shop & Store'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCmsSubTab(id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                      cmsSubTab === id
                        ? 'bg-[#F59E0B] text-[#121212] border-[#F59E0B]'
                        : 'bg-[#121212] text-zinc-300 border-white/10 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* CMS 1 : Services par branche */}
              {cmsSubTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {PMB_BRANCHES.map((branch) => (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => {
                          setCmsBranchId(branch.id);
                          setEditingServiceIdx(null);
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${
                          cmsBranchId === branch.id
                            ? 'bg-[#262626] text-white border-[#229ED9]'
                            : 'bg-[#121212] text-zinc-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <img
                          src={branch.logoImage}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded object-contain bg-white p-0.5"
                        />
                        <span>{branch.name}</span>
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newServiceText.trim()) return;
                      addBranchService(cmsBranchId, newServiceText);
                      setNewServiceText('');
                      showToast('Service ajouté et visible immédiatement sur le site.');
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newServiceText}
                      onChange={(e) => setNewServiceText(e.target.value)}
                      placeholder="Ajouter une nouvelle prestation à cette branche..."
                      className="flex-1 rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Publier</span>
                    </button>
                  </form>

                  <ul className="space-y-2">
                    {(cms.branchServices[cmsBranchId] || []).map((srv, idx) => (
                      <li
                        key={`${cmsBranchId}-${idx}`}
                        className="rounded-lg bg-[#121212] border border-white/10 p-3 flex items-center justify-between gap-3"
                      >
                        {editingServiceIdx === idx ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingServiceText}
                              onChange={(e) => setEditingServiceText(e.target.value)}
                              className="flex-1 rounded border border-[#229ED9] bg-[#1c1c1e] px-3 py-1.5 text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateBranchService(cmsBranchId, idx, editingServiceText);
                                setEditingServiceIdx(null);
                                showToast('Prestation modifiée en direct.');
                              }}
                              className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                            >
                              Enregistrer
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs sm:text-sm text-zinc-200">{srv}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingServiceIdx(idx);
                                  setEditingServiceText(srv);
                                }}
                                aria-label="Modifier"
                                className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteBranchService(cmsBranchId, idx);
                                  showToast('Prestation supprimée.');
                                }}
                                aria-label="Supprimer"
                                className="p-1.5 rounded bg-[#262626] hover:bg-red-600/80 text-zinc-300 hover:text-white cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CMS 2 : FAQ */}
              {cmsSubTab === 'faqs' && (
                <div className="space-y-5">
                  <form
                    onSubmit={handleSaveFaq}
                    className="rounded-xl bg-[#121212] border border-white/10 p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={faqCategory}
                        onChange={(e) => setFaqCategory(e.target.value)}
                        placeholder="Catégorie (ex. : PMB Fondation)"
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        required
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        placeholder="Question FAQ *"
                        className="sm:col-span-2 rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        required
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                        placeholder="Réponse officielle *"
                        className="flex-1 rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#229ED9] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{editingFaqId ? 'Mettre à jour FAQ' : 'Publier FAQ'}</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {cms.faqs.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg bg-[#121212] border border-white/10 p-3.5 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-[11px] font-semibold text-[#229ED9]">{item.category}</p>
                          <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                            {item.question}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">{item.answer}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFaqId(item.id);
                              setFaqCategory(item.category);
                              setFaqQuestion(item.question);
                              setFaqAnswer(item.answer);
                            }}
                            className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            aria-label="Modifier FAQ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteFaqItem(item.id);
                              showToast('Question supprimée de la FAQ.');
                            }}
                            className="p-1.5 rounded bg-[#262626] hover:bg-red-600/80 text-zinc-300 hover:text-white cursor-pointer"
                            aria-label="Supprimer FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CMS 3 : Actus & Agenda des 6 branches */}
              {cmsSubTab === 'actus' && (
                <div className="space-y-5">
                  <form
                    onSubmit={handleSaveActu}
                    className="rounded-xl bg-[#121212] border border-white/10 p-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-white flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-[#229ED9]" aria-hidden="true" />
                      <span>
                        {editingActuId
                          ? 'Modifier l’actualité sélectionnée'
                          : 'Publier une actualité ou un événement (visible dans Actualités & Agenda)'}
                      </span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <select
                        value={actuBranchId}
                        onChange={(e) => setActuBranchId(e.target.value)}
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      >
                        {PMB_BRANCHES.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={actuType}
                        onChange={(e) => setActuType(e.target.value as NewsActuItem['type'])}
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      >
                        <option value="Actualité">Actualité</option>
                        <option value="Événement">Événement</option>
                        <option value="Webinaire">Webinaire</option>
                        <option value="Action Sociale">Action Sociale</option>
                        <option value="Logistique">Logistique</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={actuTitle}
                        onChange={(e) => setActuTitle(e.target.value)}
                        placeholder="Titre de l’actualité *"
                        className="sm:col-span-2 rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={actuDateLabel}
                        onChange={(e) => setActuDateLabel(e.target.value)}
                        placeholder="Date (ex. : 25 Nov 2026 · 10h00)"
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={actuLocation}
                        onChange={(e) => setActuLocation(e.target.value)}
                        placeholder="Lieu (ex. : Bandal Synkin)"
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        required
                        value={actuSummary}
                        onChange={(e) => setActuSummary(e.target.value)}
                        placeholder="Résumé / Contenu de l’actualité *"
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-semibold cursor-pointer"
                      >
                        {editingActuId ? 'Mettre à jour' : 'Publier l’actualité'}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {cms.newsActus.map((actu) => (
                      <div
                        key={actu.id}
                        className="rounded-lg bg-[#121212] border border-white/10 p-3.5 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-[11px] font-semibold text-[#F59E0B]">
                            {actu.type} · {actu.branchName} ·{' '}
                            <span className="font-mono-tabular text-zinc-400">{actu.dateLabel}</span>
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                            {actu.title}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            {actu.location} — {actu.summary}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingActuId(actu.id);
                              setActuBranchId(actu.branchId);
                              setActuType(actu.type);
                              setActuTitle(actu.title);
                              setActuDateLabel(actu.dateLabel);
                              setActuLocation(actu.location);
                              setActuSummary(actu.summary);
                            }}
                            className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            aria-label="Modifier actualité"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteNewsActu(actu.id);
                              showToast('Actualité supprimée du fil public.');
                            }}
                            className="p-1.5 rounded bg-[#262626] hover:bg-red-600/80 text-zinc-300 hover:text-white cursor-pointer"
                            aria-label="Supprimer actualité"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CMS 4 : Projets PMB Fondation */}
              {cmsSubTab === 'projects' && (
                <div className="space-y-5">
                  <form
                    onSubmit={handleSaveProject}
                    className="rounded-xl bg-[#121212] border border-white/10 p-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-white">
                      {editingProjectId
                        ? 'Modifier le projet sélectionné'
                        : 'Ajouter un nouveau projet social (PMB Fondation)'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        required
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        placeholder="Titre du projet *"
                        className="sm:col-span-2 rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={projLocation}
                        onChange={(e) => setProjLocation(e.target.value)}
                        placeholder="Lieu (ex. : Matete, Kinshasa)"
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <select
                        value={projStatus}
                        onChange={(e) =>
                          setProjStatus(e.target.value as FondationProjectItem['status'])
                        }
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      >
                        <option value="En cours">En cours</option>
                        <option value="Planifié">Planifié</option>
                        <option value="Réalisé">Réalisé</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={projDateLabel}
                        onChange={(e) => setProjDateLabel(e.target.value)}
                        placeholder="Période (ex. : Décembre 2026)"
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        required
                        value={projSummary}
                        onChange={(e) => setProjSummary(e.target.value)}
                        placeholder="Description courte du projet *"
                        className="sm:col-span-2 rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#F59E0B] text-[#121212] text-xs font-bold cursor-pointer"
                      >
                        {editingProjectId ? 'Mettre à jour' : 'Publier le projet'}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {cms.fondationProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="rounded-lg bg-[#121212] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {proj.title}{' '}
                            <span className="text-xs font-mono-tabular text-[#F59E0B]">
                              · {proj.status} · {proj.dateLabel}
                            </span>
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {proj.location} — {proj.summary}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProjectId(proj.id);
                              setProjTitle(proj.title);
                              setProjLocation(proj.location);
                              setProjStatus(proj.status);
                              setProjDateLabel(proj.dateLabel);
                              setProjSummary(proj.summary);
                            }}
                            className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            aria-label="Modifier projet"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteFondationProject(proj.id);
                              showToast('Projet supprimé.');
                            }}
                            className="p-1.5 rounded bg-[#262626] hover:bg-red-600/80 text-zinc-300 hover:text-white cursor-pointer"
                            aria-label="Supprimer projet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CMS 5 : Articles Shop & Store */}
              {cmsSubTab === 'articles' && (
                <div className="space-y-5">
                  <form
                    onSubmit={handleSaveArticle}
                    className="rounded-xl bg-[#121212] border border-white/10 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
                  >
                    <select
                      value={artBranchId}
                      onChange={(e) =>
                        setArtBranchId(e.target.value as CatalogArticleItem['branchId'])
                      }
                      className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                    >
                      <option value="pmb-shop">PMB Shop</option>
                      <option value="pmb-store">PMB Store</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="Nom de l’article *"
                      className="lg:col-span-2 rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={artDescription}
                      onChange={(e) => setArtDescription(e.target.value)}
                      placeholder="Description courte"
                      className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      required
                      value={artPrice}
                      onChange={(e) => setArtPrice(e.target.value)}
                      placeholder="Prix (ex. : 25 $ USD) *"
                      className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={artInStock ? 'true' : 'false'}
                        onChange={(e) => setArtInStock(e.target.value === 'true')}
                        className="rounded-lg border border-white/15 bg-[#1c1c1e] px-2 py-2 text-xs text-white"
                      >
                        <option value="true">Disponible</option>
                        <option value="false">Sur commande</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-lg bg-[#229ED9] text-white text-xs font-semibold cursor-pointer shrink-0"
                      >
                        {editingArticleId ? 'MAJ' : 'Ajouter'}
                      </button>
                    </div>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cms.catalogArticles.map((art) => (
                      <div
                        key={art.id}
                        className="rounded-lg bg-[#121212] border border-white/10 p-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#229ED9]" aria-hidden="true" />
                            <span>{art.branchName}</span>
                            <span>·</span>
                            <span className="truncate">{art.description}</span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate mt-0.5">
                            {art.title}
                          </p>
                          <p className="text-xs font-mono-tabular text-[#F59E0B] mt-0.5">
                            {art.priceLabel} · {art.inStock ? 'Disponible' : 'Sur commande'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingArticleId(art.id);
                              setArtBranchId(art.branchId);
                              setArtTitle(art.title);
                              setArtDescription(art.description);
                              setArtPrice(art.priceLabel);
                              setArtInStock(art.inStock);
                            }}
                            className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            aria-label="Modifier article"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteCatalogArticle(art.id);
                              showToast('Article supprimé du catalogue.');
                            }}
                            className="p-1.5 rounded bg-[#262626] hover:bg-red-600/80 text-zinc-300 hover:text-white cursor-pointer"
                            aria-label="Supprimer article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
