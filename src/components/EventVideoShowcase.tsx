import { useMemo, useState } from 'react';
import { Film, Play } from 'lucide-react';
import {
  PMB_EVENT_VIDEOS,
  PMB_EVENT_VIDEO_CATEGORIES,
  VideoCategory,
} from '../data/pmbData';

interface EventVideoShowcaseProps {
  onRequestEventQuote: () => void;
  embedded?: boolean;
}

export function EventVideoShowcase({
  onRequestEventQuote,
  embedded = false,
}: EventVideoShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('all');
  const [activeVideoId, setActiveVideoId] = useState<string>(PMB_EVENT_VIDEOS[0].id);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'all') return PMB_EVENT_VIDEOS;
    return PMB_EVENT_VIDEOS.filter((v) => v.category === selectedCategory);
  }, [selectedCategory]);

  const activeVideo =
    PMB_EVENT_VIDEOS.find((v) => v.id === activeVideoId) ?? PMB_EVENT_VIDEOS[0];

  const handleCategoryChange = (category: VideoCategory) => {
    setSelectedCategory(category);
    const list =
      category === 'all'
        ? PMB_EVENT_VIDEOS
        : PMB_EVENT_VIDEOS.filter((v) => v.category === category);
    if (list.length > 0 && !list.some((v) => v.id === activeVideoId)) {
      setActiveVideoId(list[0].id);
    }
  };

  return (
    <section
      id="videos-event"
      className={
        embedded
          ? 'no-print'
          : 'no-print py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20'
      }
    >
      <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {/* En-tête de section */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 ${
            embedded ? 'mb-5' : 'mb-8 gap-6'
          }`}
        >
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-medium text-[#A855F7] mb-1">
              PMB Event · Réalisations Audiovisuelles & Scéniques
            </p>
            <h2
              className={
                embedded
                  ? 'text-xl sm:text-2xl font-bold text-white tracking-tight'
                  : 'text-2xl sm:text-4xl font-bold text-white tracking-tight'
              }
            >
              Médiathèque terrain & installations LED à Kinshasa
            </h2>
            {!embedded && (
              <p className="mt-3 text-base text-zinc-400">
                Découvrez nos 27 captations réelles : fabrication et installation d’écrans géants LED,
                sommets parlementaires, concerts en stades, églises et cérémonies officielles.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onRequestEventQuote}
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#7B1FA2] hover:bg-[#6a1b8c] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Réserver PMB Event
          </button>
        </div>

        {/* Filtres par catégorie */}
        <div
          role="tablist"
          aria-label="Filtrer les vidéos PMB Event"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8"
        >
          {PMB_EVENT_VIDEO_CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? PMB_EVENT_VIDEOS.length
                : PMB_EVENT_VIDEOS.filter((v) => v.category === cat.id).length;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                  active
                    ? 'bg-[#7B1FA2] text-white border-[#9333EA]'
                    : 'bg-[#1c1c1e] text-zinc-300 hover:text-white border-white/10'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Lecteur Principal + Liste des 27 vidéos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne gauche : Lecteur Vidéo HTML5 & Fiche Technique */}
          <div className="lg:col-span-7 rounded-xl bg-[#1c1c1e] border border-white/10 overflow-hidden">
            <div className="aspect-video bg-black relative">
              <video
                key={activeVideo.videoUrl}
                src={activeVideo.videoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain bg-black"
              >
                Votre navigateur ne prend pas en charge la lecture vidéo HTML5.
              </video>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="font-mono-tabular text-[#C084FC] font-medium">
                  Vidéo {activeVideo.number} / {PMB_EVENT_VIDEOS.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeVideo.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{activeVideo.specs}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeVideo.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.08] text-sm">
                <div>
                  <p className="text-xs font-medium text-zinc-400 mb-1">Analyse & Contexte</p>
                  <p className="text-zinc-200 leading-relaxed">{activeVideo.context}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400 mb-1">But & Objectif</p>
                  <p className="text-zinc-200 leading-relaxed">{activeVideo.objective}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Sélecteur des vidéos */}
          <div className="lg:col-span-5 rounded-xl bg-[#1c1c1e] border border-white/10 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Film className="w-4 h-4 text-[#A855F7]" aria-hidden="true" />
                <span>Catalogue des réalisations</span>
              </div>
              <span className="text-xs text-zinc-400 font-mono-tabular">
                {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="max-h-[540px] overflow-y-auto divide-y divide-white/[0.06]">
              {filteredVideos.map((video) => {
                const isSelected = video.id === activeVideo.id;
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setActiveVideoId(video.id)}
                    className={`w-full text-left px-5 py-3.5 transition-colors cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-[#262626] text-white'
                        : 'hover:bg-[#262626]/50 text-zinc-300'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-mono-tabular ${
                        isSelected
                          ? 'bg-[#7B1FA2] text-white'
                          : 'bg-[#121212] text-zinc-400 border border-white/10'
                      }`}
                    >
                      {isSelected ? (
                        <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      ) : (
                        video.number
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          isSelected ? 'text-white' : 'text-zinc-200'
                        }`}
                      >
                        {video.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400 truncate">{video.specs}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
