import React, { useEffect, useState } from 'react';
import {
  Cloud,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
  ChevronRight,
  Sun,
} from 'lucide-react';

interface NodeItem {
  id: string;
  count: number;
  status: string;
}

const MY_NODES: NodeItem[] = [
  { id: 'ZION_W04', count: 2, status: 'Активна' },
  { id: 'ZION_W03', count: 2, status: 'Активна' },
  { id: 'ZION_W05', count: 2, status: 'Активна' },
  { id: 'ZION_W07', count: 2, status: 'Активна' },
  { id: 'ZION_W06', count: 2, status: 'Активна' },
  { id: 'ZION_W01', count: 4, status: 'Активна' },
];

export const ZionRightSidebar: React.FC = () => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [searchGroup, setSearchGroup] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [refreshingRates, setRefreshingRates] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const formattedDate = now.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const filteredNodes = MY_NODES.filter((node) =>
    node.id.toLowerCase().includes(searchGroup.trim().toLowerCase())
  );

  const handleRefreshRates = () => {
    setRefreshingRates(true);
    setTimeout(() => setRefreshingRates(false), 450);
  };

  return (
    <aside className="w-full lg:w-[258px] shrink-0 space-y-3.5">
      {/* Split-flap Clock & Weather Widget */}
      <div className="bg-[#FCFBF8] border border-[#E9E4D8] rounded-2xl p-4 shadow-[0_1px_3px_rgba(42,36,30,0.04)]">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className="flex gap-1">
            <span className="w-8 h-10 rounded-md bg-[#1D1D1F] text-white font-mono-tabular text-[22px] font-bold flex items-center justify-center shadow-inner">
              {hours[0]}
            </span>
            <span className="w-8 h-10 rounded-md bg-[#1D1D1F] text-white font-mono-tabular text-[22px] font-bold flex items-center justify-center shadow-inner">
              {hours[1]}
            </span>
          </div>
          <span className="text-xl font-bold text-[#3A3229] px-0.5">:</span>
          <div className="flex gap-1">
            <span className="w-8 h-10 rounded-md bg-[#1D1D1F] text-white font-mono-tabular text-[22px] font-bold flex items-center justify-center shadow-inner">
              {minutes[0]}
            </span>
            <span className="w-8 h-10 rounded-md bg-[#1D1D1F] text-white font-mono-tabular text-[22px] font-bold flex items-center justify-center shadow-inner">
              {minutes[1]}
            </span>
          </div>
        </div>

        <p className="text-center text-[11.5px] font-medium text-[#A4712B] pb-3 border-b border-[#ECE6DA]">
          {capitalizedDate}
        </p>

        <div className="pt-2.5 flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-1.5 text-[#3B332B]">
            <Cloud className="w-4 h-4 text-[#7D756B]" />
            <span className="font-semibold tabular-nums">+18°</span>
            <span className="text-[#6F665B]">Пасмурно</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#94897B]">
            <MapPin className="w-3 h-3" />
            <span>Актау</span>
          </div>
        </div>
      </div>

      {/* Exchange Rates Card ("Курсы валют") */}
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-[0_1px_3px_rgba(42,36,30,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-bold flex items-center justify-center">
              $
            </span>
            <h3 className="text-[13.5px] font-semibold text-[#2E2720]">Курсы валют</h3>
          </div>
          <button
            type="button"
            onClick={handleRefreshRates}
            aria-label="Обновить курсы валют"
            className="p-1 rounded-md text-[#8E8375] hover:text-[#2E2720] hover:bg-[#F5F2EB] transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                refreshingRates ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        <div className="bg-[#F7F4EC] border border-[#EDE7DA] rounded-xl p-3 flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white shadow-sm shrink-0">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#8A6D43] leading-tight">
              1 ALTYN COIN
            </p>
            <p className="text-[14px] font-bold text-[#2A241E] tabular-nums leading-tight">
              = $1.00 USD
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#F3EFE8] text-[12.5px]">
          <div className="py-2 flex items-center justify-between">
            <span className="text-[#786E62] font-medium">USD</span>
            <span className="flex items-center gap-1.5 font-semibold text-[#2A241E] tabular-nums">
              1 <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-[#786E62] font-medium">RUB</span>
            <span className="flex items-center gap-1.5 font-semibold text-[#2A241E] tabular-nums">
              86,99 <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-[#786E62] font-medium">KZT</span>
            <span className="flex items-center gap-1.5 font-semibold text-[#2A241E] tabular-nums">
              454,8 <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          </div>
        </div>

        <p className="mt-2 pt-2 border-t border-[#F3EFE8] text-[11px] text-[#8E8375] text-center">
          ALTYN COIN привязан к USD 1:1
        </p>
      </div>

      {/* Financial Zone & My Nodes ("Финансовая зона") */}
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-[0_1px_3px_rgba(42,36,30,0.04)]">
        <h3 className="text-[13.5px] font-semibold text-[#9C6B28] mb-2.5">
          Финансовая зона
        </h3>

        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-[#9C9184] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchGroup}
            onChange={(e) => setSearchGroup(e.target.value)}
            placeholder="Поиск групп..."
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-[#FAF8F4] border border-[#E5DFD3] rounded-lg text-[#2E2720] placeholder-[#9C9184] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
          />
        </div>

        <p className="text-[10.5px] font-semibold tracking-wider text-[#9A8F80] mb-1.5">
          МОИ НОДЫ
        </p>

        <div className="space-y-1">
          {filteredNodes.length === 0 ? (
            <p className="text-xs text-[#8E8375] py-2 text-center">Ноды не найдены</p>
          ) : (
            filteredNodes.map((node) => {
              const isSelected = selectedNode === node.id;
              return (
                <div key={node.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedNode((prev) => (prev === node.id ? null : node.id))
                    }
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[12px] transition-colors ${
                      isSelected
                        ? 'bg-[#FEF6E8] text-[#8C520C]'
                        : 'text-[#3F362C] hover:bg-[#F7F4EC]'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full border border-[#D97706] bg-[#FEF3C7]" />
                      <span className="font-mono-tabular text-[11.5px]">{node.id}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#9A8F80] tabular-nums">
                      <span>({node.count})</span>
                      <ChevronRight
                        className={`w-3 h-3 transition-transform ${
                          isSelected ? 'rotate-90 text-[#D97706]' : ''
                        }`}
                      />
                    </span>
                  </button>
                  {isSelected && (
                    <div className="mx-2 mt-1 mb-1.5 p-2 rounded-lg bg-[#FAF7F1] border border-[#EAE2D3] text-[11px] text-[#6B5E4F] leading-relaxed">
                      Статус: <strong className="text-emerald-700">{node.status}</strong>. При запуске процедуры наследия автопродление отключается без досрочного прерывания работы.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
