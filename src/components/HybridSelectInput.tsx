import { useId } from 'react';

interface HybridSelectInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

export function HybridSelectInput({
  label,
  value,
  onChange,
  options,
  placeholder = 'Choisir ou saisir...',
  required = false,
}: HybridSelectInputProps) {
  const inputId = useId();
  const listId = useId();

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-medium text-zinc-300 mb-1.5">
        {label} {required && <span className="text-[#F59E0B]">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
        />
        <datalist id={listId}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
