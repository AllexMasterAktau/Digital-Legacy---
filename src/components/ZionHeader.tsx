import React, { useState } from 'react';
import { ChevronDown, Menu, Globe, FileSignature, ShieldCheck, X } from 'lucide-react';

interface ZionHeaderProps {
  activeTopNav: string;
  onSelectTopNav: (item: string) => void;
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  documentStatus: 'draft' | 'signed';
  onJumpToSection: (sectionId: string) => void;
}

const TOP_NAV_ITEMS = [
  'Семья',
  'Новости',
  'Журнал',
  'Сервисы',
  'Организации',
  'Вещи',
  'Финансы',
  'Добрая Воля',
  'D.I.O.S.',
];

export const ZionHeader: React.FC<ZionHeaderProps> = ({
  activeTopNav,
  onSelectTopNav,
  onOpenMobileMenu,
  isMobileMenuOpen,
  documentStatus,
  onJumpToSection,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [lang, setLang] = useState<'RU' | 'EN'>('RU');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F4]/95 backdrop-blur-sm border-b border-[#E8E3D9]">
      <div className="max-w-[1480px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile toggle + ZION.CITY brand mark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E4DFD4] bg-white text-[#4A3F34] hover:bg-[#F4EFE6] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onSelectTopNav('Финансы');
              onJumpToSection('doc-header');
            }}
            className="flex items-center select-none whitespace-nowrap shrink-0 group"
          >
            <span className="text-[19px] font-bold tracking-tight text-[#5E4B3B]">ZI</span>
            {/* Warm circular ZION sun/gear emblem */}
            <span className="inline-flex items-center justify-center mx-[1px]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:rotate-45"
              >
                <circle cx="12" cy="12" r="9.5" stroke="#B57619" strokeWidth="1.7" fill="#FDF7EB" />
                <circle cx="12" cy="12" r="4.5" stroke="#EA8C1E" strokeWidth="1.7" />
                <path
                  d="M12 2.5V6M12 18V21.5M2.5 12H6M18 12H21.5M5.3 5.3L7.8 7.8M16.2 16.2L18.7 18.7M18.7 5.3L16.2 7.8M7.8 16.2L5.3 18.7"
                  stroke="#B57619"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-[19px] font-bold tracking-tight text-[#8F6024]">N.CITY</span>
          </a>
        </div>

        {/* Center: Rounded pill navigation bar matching screenshot */}
        <nav
          aria-label="Основная навигация"
          className="hidden xl:flex items-center gap-0.5 bg-[#F1EFEA] border border-[#E3DFD6] rounded-full px-2 py-1 shadow-[inset_0_1px_1px_rgba(0,0,0,0.03)] overflow-x-auto max-w-[820px]"
        >
          {TOP_NAV_ITEMS.map((item) => {
            const isActive = activeTopNav === item;
            const isDios = item === 'D.I.O.S.';

            if (isDios) {
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelectTopNav(item)}
                  className={`px-3 py-1 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 border transition-colors ${
                    isActive
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[#EDF5FF] text-[#2563EB] border-[#BCD7F7] hover:bg-[#E1EEFF]'
                  }`}
                >
                  {item}
                </button>
              );
            }

            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelectTopNav(item)}
                className={`px-3.5 py-1 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-[#C18428] to-[#9E6716] text-white shadow-sm'
                    : 'text-[#4E453B] hover:text-[#231D16] hover:bg-white/60'
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* Right: Language switcher & User pill */}
        <div className="flex items-center gap-2 shrink-0 relative">
          <button
            type="button"
            onClick={() => setLang((prev) => (prev === 'RU' ? 'EN' : 'RU'))}
            title="Переключатель языка интерфейса"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E0D5] text-[12px] font-semibold text-[#3F372E] hover:bg-[#FAF7F0] transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-[#8A7E6E]" />
            <span>{lang}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white border border-[#E5E0D5] hover:border-[#D4CCBD] transition-colors whitespace-nowrap shrink-0"
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D28D9] via-[#4F46E5] to-[#2563EB] text-white text-[12px] font-bold flex items-center justify-center ring-2 ring-[#EDE9FE]">
                Z
              </span>
              <span className="text-[13px] font-medium text-[#2E2720] hidden sm:inline">
                Александр
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7A7065]" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E8E3D9] rounded-xl shadow-lg p-2 z-50">
                <div className="px-3 py-2 border-b border-[#F1EDE4]">
                  <p className="text-xs font-semibold text-[#2E2720]">Александр</p>
                  <p className="text-[11px] text-[#7D7366]">Участник экосистемы ZION.CITY</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onJumpToSection('doc-header');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-[#3A3229] hover:bg-[#F9F6F0] rounded-lg mt-1 transition-colors"
                >
                  <FileSignature className="w-4 h-4 text-[#EA8C1E]" />
                  <span>Распоряжение Digital Legacy</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-[#6B6257]">
                  <ShieldCheck
                    className={`w-4 h-4 ${
                      documentStatus === 'signed' ? 'text-emerald-600' : 'text-[#EA8C1E]'
                    }`}
                  />
                  <span>
                    Статус:{' '}
                    {documentStatus === 'signed'
                      ? 'Подписано (демо-фиксация)'
                      : 'Черновик — не подписано'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact scrollable nav row for medium screens */}
      <div className="xl:hidden border-t border-[#EEE9DF] bg-[#FAF8F4] px-3 py-1.5 flex items-center gap-1 overflow-x-auto">
        {TOP_NAV_ITEMS.map((item) => {
          const isActive = activeTopNav === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelectTopNav(item)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#B57619] text-white'
                  : 'text-[#5A5045] hover:bg-[#EFECE4]'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </header>
  );
};
