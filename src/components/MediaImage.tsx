import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  accentColor?: string;
}

export function MediaImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'PMB GROUP SARL',
  accentColor = '#229ED9',
}: MediaImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-2 bg-[#1c1c1e] text-center p-4 ${className}`}
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, ${accentColor}24, transparent 70%)`,
        }}
      >
        <Building2 className="w-7 h-7 text-zinc-400" aria-hidden="true" />
        <span className="text-xs font-medium text-zinc-300 tracking-wide">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
