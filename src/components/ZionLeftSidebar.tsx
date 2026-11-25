import React from 'react';
import {
  User,
  Smartphone,
  Newspaper,
  Wallet,
  ArrowLeftRight,
  Landmark,
  Cpu,
  CircleDollarSign,
  Image as ImageIcon,
  FolderOpen,
  Video,
  IdCard,
  FileText,
  Settings,
  ScrollText,
  ChevronRight,
} from 'lucide-react';

interface ZionLeftSidebarProps {
  activeNav: string;
  onSelectNav: (navId: string) => void;
  documentStatus: 'draft' | 'signed';
}

export const ZionLeftSidebar: React.FC<ZionLeftSidebarProps> = ({
  activeNav,
  onSelectNav,
  documentStatus,
}) => {
  const primaryItems = [
    { id: 'feed', label: 'Моя лента', icon: Newspaper },
    { id: 'wallet', label: 'Мой Кошелёк', icon: Wallet },
    { id: 'exchange', label: 'Exchange', icon: ArrowLeftRight },
    { id: 'cfa', label: 'ЦФА', icon: Landmark },
    { id: 'vnode', label: 'vNODE', icon: Cpu, highlightedSoft: true },
    { id: 'dividends', label: 'Дивиденды', icon: CircleDollarSign },
  ];

  const mediaItems = [
    { id: 'photos', label: 'Мои Фото', icon: ImageIcon },
    { id: 'my-docs', label: 'Мои Документы', icon: FolderOpen },
    { id: 'videos', label: 'Мои Видео', icon: Video },
  ];

  const infoItems = [
    { id: 'profile', label: 'Профиль', icon: IdCard },
    { id: 'documents', label: 'Документы', icon: FileText },
    { id: 'digital-legacy', label: 'Цифровое наследие', icon: ScrollText, isLegacy: true },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-[228px] shrink-0">
      <div className="bg-[#FCFBF8] border border-[#E9E4D8] rounded-2xl p-3 shadow-[0_1px_3px_rgba(42,36,30,0.04)]">
        {/* User Profile Card at top */}
        <div className="bg-[#F9F4EA] border border-[#E7DEC9] rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#EAE1CE]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D28D9] via-[#4F46E5] to-[#2563EB] p-[2px] shrink-0 shadow-sm">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#4338CA] to-[#312E81] flex items-center justify-center text-white font-bold text-base">
                Z
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#3D3124] leading-tight truncate">
                Allex Master
              </p>
              <p className="text-[11px] text-[#8E7D68] truncate">@allmasters13</p>
            </div>
          </div>

          <div className="pt-2 space-y-1">
            <button
              type="button"
              onClick={() => onSelectNav('profile')}
              className="w-full flex items-center gap-2 px-1.5 py-1 rounded-lg text-[12.5px] font-medium text-[#4A3F34] hover:bg-[#F1E9D8] transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#857561]" />
              <span>Мой Профиль</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectNav('devices')}
              className="w-full flex items-center gap-2 px-1.5 py-1 rounded-lg text-[12.5px] font-medium text-[#4A3F34] hover:bg-[#F1E9D8] transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#857561]" />
              <span>Мои устройства</span>
            </button>
          </div>
        </div>

        {/* Main Navigation List */}
        <nav aria-label="Меню аккаунта" className="space-y-0.5 mb-3">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#177E4E] text-white shadow-sm'
                    : item.highlightedSoft
                      ? 'bg-[#FBF9FF] border border-[#E6DEFA] text-[#3F364E] hover:bg-[#F5F0FF]'
                      : 'text-[#3C342B] hover:bg-[#F3EFE6]'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : item.highlightedSoft ? 'text-[#7C3AED]' : 'text-[#6A5F52]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-90" />}
              </button>
            );
          })}
        </nav>

        {/* Section: МЕДИА ХРАНИЛИЩЕ */}
        <div className="mb-3">
          <div className="bg-[#F3EFE5] rounded-lg px-2.5 py-1.5 mb-1.5">
            <span className="text-[10.5px] font-semibold tracking-wider text-[#9A7A4E]">
              МЕДИА ХРАНИЛИЩЕ
            </span>
          </div>
          <div className="space-y-0.5">
            {mediaItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F59E0B]/15 text-[#9A5B0B]'
                      : 'text-[#433A30] hover:bg-[#F3EFE6]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#6A5F52] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: МОЯ ИНФОРМАЦИЯ */}
        <div>
          <div className="bg-[#F3EFE5] rounded-lg px-2.5 py-1.5 mb-1.5">
            <span className="text-[10.5px] font-semibold tracking-wider text-[#9A7A4E]">
              МОЯ ИНФОРМАЦИЯ
            </span>
          </div>
          <div className="space-y-0.5">
            {infoItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#EA8C1E] to-[#D97706] text-white shadow-sm'
                      : item.isLegacy
                        ? 'bg-[#FEF7EA] border border-[#F3DFBC] text-[#8C520C] hover:bg-[#FDEFD5]'
                        : 'text-[#433A30] hover:bg-[#F3EFE6]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : item.isLegacy ? 'text-[#D97706]' : 'text-[#6A5F52]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.isLegacy && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : documentStatus === 'signed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-[#F59E0B]/15 text-[#9A5B0B]'
                      }`}
                    >
                      {documentStatus === 'signed' ? 'ЭП' : 'DL'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
