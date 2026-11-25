import React from 'react';
import { Send, Mail, MessageSquare, Bell } from 'lucide-react';

interface EricSearchStripProps {
  query: string;
  onQueryChange: (val: string) => void;
  onSubmitQuery: () => void;
  onQuickJump: (sectionId: string) => void;
}

export const EricSearchStrip: React.FC<EricSearchStripProps> = ({
  query,
  onQueryChange,
  onSubmitQuery,
  onQuickJump,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmitQuery();
    }
  };

  return (
    <div className="space-y-3 mb-5">
      {/* Centered ERIC Search Pill */}
      <div className="max-w-[660px] mx-auto">
        <div className="flex items-center gap-2 bg-white border border-[#E5E0D6] rounded-full pl-2 pr-3 py-1.5 shadow-[0_2px_8px_rgba(42,36,30,0.05)] focus-within:border-[#EA8C1E] transition-colors">
          {/* Warm golden ERIC orb */}
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FCD34D] via-[#F59E0B] to-[#D97706] flex items-center justify-center shrink-0 shadow-inner"
            title="Ассистент ERIC"
          >
            <span className="text-[10px] font-bold text-white tracking-tight">E</span>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спросите ERIC или найдите..."
            aria-label="Спросите ERIC или найдите разделы документа"
            className="flex-1 min-w-0 bg-transparent text-[13px] text-[#2A241E] placeholder-[#9B9185] focus:outline-none px-1"
          />

          <div className="flex items-center gap-1 shrink-0 text-[#7A7064]">
            <button
              type="button"
              onClick={onSubmitQuery}
              title="Найти раздел в распоряжении"
              className="p-1.5 rounded-full hover:bg-[#F4F0E8] hover:text-[#2A241E] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onQuickJump('section-eric')}
              title="Раздел уведомлений ИИ ERIC"
              className="p-1.5 rounded-full hover:bg-[#F4F0E8] hover:text-[#2A241E] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onQuickJump('section-beneficiaries')}
              title="Наследники и контакты для ERIC"
              className="p-1.5 rounded-full hover:bg-[#F4F0E8] hover:text-[#2A241E] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onQuickJump('section-signature')}
              title="Подпись и фиксация"
              className="p-1.5 rounded-full hover:bg-[#F4F0E8] hover:text-[#2A241E] transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Context / Coins by Cryptorank strip matching screenshot */}
      <div className="bg-white border border-[#EAE6DF] rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[12px] shadow-[0_1px_2px_rgba(42,36,30,0.03)]">
        <span className="font-medium text-[#5A5248]">Coins by Cryptorank</span>
        <div className="flex items-center gap-3 text-[11.5px] text-[#7A7065] tabular-nums">
          <span>
            <strong className="text-[#D97706] font-semibold">ALTYN COIN (AC)</strong> $1.00
          </span>
          <span aria-hidden="true" className="text-[#D5CEC2]">
            ·
          </span>
          <span>
            <strong className="text-[#7C3AED] font-semibold">ALTYN TOKEN (AT)</strong> Цифровое право
          </span>
        </div>
      </div>
    </div>
  );
};
