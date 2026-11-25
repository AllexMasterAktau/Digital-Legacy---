import React, { useMemo, useState } from 'react';
import {
  ScrollText,
  UserCheck,
  Coins,
  Users,
  Bot,
  FileSignature,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Lock,
  Edit3,
  Sun,
  TrendingUp,
  RefreshCw,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import {
  BeneficiaryEntry,
  DigitalLegacyFormState,
  DistributionMode,
  DocumentStatus,
  EricAdamAssetAnalysis,
  SignedReceipt,
  ValidationErrors,
} from '../types/legacy';

interface DigitalLegacyFormProps {
  form: DigitalLegacyFormState;
  status: DocumentStatus;
  assetAnalysis: EricAdamAssetAnalysis;
  isSyncingAssets: boolean;
  signedReceipt: SignedReceipt | null;
  searchFilter: string;
  onChange: (updater: (prev: DigitalLegacyFormState) => DigitalLegacyFormState) => void;
  onRefreshEricAdam: () => void;
  onSaveDraft: () => void;
  onResetForm: () => void;
  onSignSuccess: (receipt: SignedReceipt) => void;
  onCreateNewVersion: () => void;
  draftSavedMessage: string | null;
}

type SectionTab = 'all' | 'testator' | 'assets' | 'beneficiaries' | 'eric' | 'signature';

function parseNumeric(value: string): number {
  if (!value.trim()) return 0;
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatNumberRu(val: number): string {
  return val.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function generateDemoHash(form: DigitalLegacyFormState): string {
  const payload = `${form.documentNumber}|${form.ownerFullName}|${form.ownerZionId}|${form.beneficiaries.length}|${Date.now()}`;
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex1 = (hash >>> 0).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash ^ 0x5f3759df).toString(16).padStart(8, '0');
  return `0x${hex1}${hex2}zion7c9a`;
}

export const DigitalLegacyForm: React.FC<DigitalLegacyFormProps> = ({
  form,
  status,
  assetAnalysis,
  isSyncingAssets,
  signedReceipt,
  searchFilter,
  onChange,
  onRefreshEricAdam,
  onSaveDraft,
  onResetForm,
  onSignSuccess,
  onCreateNewVersion,
  draftSavedMessage,
}) => {
  const [activeTab, setActiveTab] = useState<SectionTab>('all');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSignKey, setShowSignKey] = useState(false);

  const isSigned = status === 'signed' && signedReceipt !== null;

  const totals = useMemo(() => {
    const atTotal = form.beneficiaries.reduce((sum, b) => sum + parseNumeric(b.atShare), 0);
    const acTotal = form.beneficiaries.reduce((sum, b) => sum + parseNumeric(b.acShare), 0);

    const atCustom = parseNumeric(form.atCustomCap);
    const acCustom = parseNumeric(form.acCustomCap);
    const effectiveAtLimit = atCustom > 0 ? atCustom : assetAnalysis.altynToken.total;
    const effectiveAcLimit = acCustom > 0 ? acCustom : assetAnalysis.altynCoin.total;

    const atExceeds =
      form.distributionMode === 'percent'
        ? atTotal > 100
        : effectiveAtLimit > 0 && atTotal > effectiveAtLimit;

    const acExceeds =
      form.distributionMode === 'percent'
        ? acTotal > 100
        : effectiveAcLimit > 0 && acTotal > effectiveAcLimit;

    return {
      atTotal,
      acTotal,
      effectiveAtLimit,
      effectiveAcLimit,
      atExceeds,
      acExceeds,
    };
  }, [
    form.beneficiaries,
    form.distributionMode,
    form.atCustomCap,
    form.acCustomCap,
    assetAnalysis,
  ]);

  const updateField = <K extends keyof DigitalLegacyFormState>(
    field: K,
    value: DigitalLegacyFormState[K]
  ) => {
    onChange((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const updateBeneficiary = (
    id: string,
    field: keyof BeneficiaryEntry,
    value: string
  ) => {
    onChange((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    }));
    const errorKey = `ben_${id}_${field}`;
    if (errors[errorKey] || errors.beneficiaries || errors[`ben_${id}_contact`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        delete next[`ben_${id}_contact`];
        delete next[`ben_${id}_shares`];
        delete next.beneficiaries;
        return next;
      });
    }
  };

  const addBeneficiary = () => {
    onChange((prev) => ({
      ...prev,
      beneficiaries: [
        ...prev.beneficiaries,
        {
          id: `ben-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fullName: '',
          zionAccountId: '',
          email: '',
          phone: '',
          roleNote: '',
          atShare: '',
          acShare: '',
        },
      ],
    }));
  };

  const removeBeneficiary = (id: string) => {
    onChange((prev) => {
      if (prev.beneficiaries.length <= 1) return prev;
      return {
        ...prev,
        beneficiaries: prev.beneficiaries.filter((b) => b.id !== id),
      };
    });
  };

  const handleModeSwitch = (mode: DistributionMode) => {
    if (mode === form.distributionMode) return;
    onChange((prev) => ({ ...prev, distributionMode: mode }));
  };

  const validateForSign = (): boolean => {
    const nextErrors: ValidationErrors = {};

    if (!form.ownerFullName.trim()) {
      nextErrors.ownerFullName = 'Укажите ФИО владельца (завещателя)';
    }
    if (!form.ownerZionId.trim()) {
      nextErrors.ownerZionId = 'Укажите ID или аккаунт в ZION.CITY';
    }
    if (!form.ownerEmail.trim()) {
      nextErrors.ownerEmail = 'Укажите E-mail владельца';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail.trim())) {
      nextErrors.ownerEmail = 'Проверьте формат E-mail';
    }
    if (!form.ownerPhone.trim()) {
      nextErrors.ownerPhone = 'Укажите номер телефона владельца';
    }

    if (form.beneficiaries.length === 0) {
      nextErrors.beneficiaries = 'Добавьте хотя бы одного наследника';
    }

    let hasAnyShare = false;
    form.beneficiaries.forEach((b) => {
      if (!b.fullName.trim()) {
        nextErrors[`ben_${b.id}_fullName`] = 'Введите ФИО наследника';
      }
      if (!b.email.trim() && !b.phone.trim() && !b.zionAccountId.trim()) {
        nextErrors[`ben_${b.id}_contact`] =
          'Укажите E-mail, телефон или аккаунт ZION.CITY для связи через ERIC';
      }
      if (b.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim())) {
        nextErrors[`ben_${b.id}_email`] = 'Некорректный формат E-mail';
      }
      const atVal = parseNumeric(b.atShare);
      const acVal = parseNumeric(b.acShare);
      if (atVal > 0 || acVal > 0) {
        hasAnyShare = true;
      } else {
        nextErrors[`ben_${b.id}_shares`] =
          'Укажите долю ALTYN TOKEN (AT) и/или ALTYN COIN (AC)';
      }
    });

    if (!hasAnyShare) {
      nextErrors.beneficiaries =
        'Укажите распределяемую долю хотя бы для одного наследника';
    }

    if (totals.atExceeds) {
      nextErrors.atLimit =
        form.distributionMode === 'percent'
          ? 'Суммарная доля ALTYN TOKEN превышает 100%'
          : 'Суммарное количество ALTYN TOKEN превышает доступный объём';
    }

    if (totals.acExceeds) {
      nextErrors.acLimit =
        form.distributionMode === 'percent'
          ? 'Суммарная доля ALTYN COIN превышает 100%'
          : 'Суммарное количество ALTYN COIN превышает доступный объём';
    }

    if (!form.confirmActivationRule) {
      nextErrors.confirmActivationRule =
        'Необходимо подтвердить ознакомление с условиями активации через ERIC и ADAM';
    }

    if (!form.signatureFullName.trim()) {
      nextErrors.signatureFullName = 'Введите полное ФИО для электронной подписи';
    }
    if (!form.signatureKey.trim()) {
      nextErrors.signatureKey = 'Введите ключ / код ЭП или фразу подтверждения';
    }
    if (!form.confirmSmartContractAudit) {
      nextErrors.confirmSmartContractAudit =
        'Подтвердите согласие с фиксацией версии распоряжения';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = validateForSign();
    if (!ok) {
      setActiveTab('all');
      return;
    }

    const receipt: SignedReceipt = {
      signedAt: new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      documentCode: form.documentNumber,
      versionLabel: `v${form.versionNumber}.0`,
      signatureHash: generateDemoHash(form),
      assetSnapshot: JSON.parse(JSON.stringify(assetAnalysis)),
      snapshot: JSON.parse(JSON.stringify(form)),
    };
    onSignSuccess(receipt);
  };

  const normalizedSearch = searchFilter.trim().toLowerCase();
  const matchesQuery = (keywords: string) => {
    if (!normalizedSearch) return true;
    return keywords.toLowerCase().includes(normalizedSearch);
  };

  const showSection = (tab: SectionTab, keywords: string) => {
    if (activeTab !== 'all' && activeTab !== tab) return false;
    return matchesQuery(keywords);
  };

  const sectionTabs: { id: SectionTab; label: string }[] = [
    { id: 'all', label: 'Весь документ' },
    { id: 'testator', label: '1. Завещатель' },
    { id: 'assets', label: '2. Активы AT/AC' },
    { id: 'beneficiaries', label: '3. Наследники' },
    { id: 'eric', label: '4. Активация ИИ' },
    { id: 'signature', label: '5. Подпись (ЭП)' },
  ];

  // Signed state summary view
  if (isSigned && signedReceipt) {
    const snap = signedReceipt.snapshot;
    const unit = snap.distributionMode === 'percent' ? '%' : '';
    return (
      <div id="doc-header" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] border border-[#F3D78D] flex items-center justify-center text-[#B57619]">
              <ScrollText className="w-4 h-4" />
            </div>
            <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-[#2A241E]">
              ЦИФРОВОЕ НАСЛЕДИЕ
            </h1>
          </div>

          <button
            type="button"
            onClick={onCreateNewVersion}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[13px] font-semibold text-[#3A3229] hover:bg-[#FAF7F0] transition-colors whitespace-nowrap shrink-0"
          >
            <Edit3 className="w-4 h-4 text-[#D97706]" />
            <span>Редактировать / новая версия</span>
          </button>
        </div>

        {/* Signed Confirmation Card */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(42,36,30,0.04)] space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#EFECE4]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Подписано · {signedReceipt.documentCode}</span>
              </div>
              <h2 className="text-[18px] font-bold text-[#2A241E]">
                Распоряжение о цифровом наследии (Digital Legacy)
              </h2>
              <p className="text-xs text-[#786E62]">
                Создано: {snap.createdDate} · Подписано: {signedReceipt.signedAt}
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#EAE4D7] rounded-xl px-3.5 py-2.5 text-right">
              <p className="text-[11px] text-[#8A7E6E]">Хэш фиксации (ЭП)</p>
              <p className="font-mono-tabular text-xs font-semibold text-[#2A241E]">
                {signedReceipt.signatureHash}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FCFBF8] border border-[#ECE7DC] rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-[#8E7A5B]">Завещатель (владелец)</p>
              <p className="text-sm font-bold text-[#2A241E]">{snap.ownerFullName}</p>
              <p className="text-xs text-[#6B6155]">
                Аккаунт ZION.CITY:{' '}
                <span className="font-mono-tabular font-medium">{snap.ownerZionId}</span>
              </p>
              <p className="text-xs text-[#6B6155]">E-mail: {snap.ownerEmail}</p>
              <p className="text-xs text-[#6B6155]">Телефон: {snap.ownerPhone}</p>
            </div>

            <div className="bg-[#FCFBF8] border border-[#ECE7DC] rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-[#8E7A5B]">
                Синхронизированные активы (ЭРИК и АДАМ)
              </p>
              <p className="text-xs text-[#3D352C] tabular-nums">
                ALTYN TOKEN (AT):{' '}
                <strong className="text-[#6D28D9]">
                  {formatNumberRu(signedReceipt.assetSnapshot.altynToken.total)} AT
                </strong>
              </p>
              <p className="text-xs text-[#3D352C] tabular-nums">
                ALTYN COIN (AC):{' '}
                <strong className="text-[#D97706]">
                  {formatNumberRu(signedReceipt.assetSnapshot.altynCoin.total)} AC
                </strong>
              </p>
              <p className="text-xs text-[#3D352C]">
                Будущие начисления AC:{' '}
                <strong>{snap.includeFutureAccruals ? 'Включены' : 'Только текущий остаток'}</strong>
              </p>
              <p className="text-xs text-[#3D352C]">
                Обязательства (узлы/стейки):{' '}
                <strong>
                  {snap.preserveObligationsRule
                    ? 'Не прерываются, автопродление отключается'
                    : 'Стандартный учёт'}
                </strong>
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#2A241E]">
              Назначенные наследники ({snap.beneficiaries.length})
            </h3>
            <div className="overflow-x-auto border border-[#EAE5DA] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F1] border-b border-[#EAE5DA] text-[#7A6F61]">
                    <th className="py-2.5 px-3 font-semibold">ФИО наследника</th>
                    <th className="py-2.5 px-3 font-semibold">ID ZION.CITY</th>
                    <th className="py-2.5 px-3 font-semibold">E-mail (ERIC)</th>
                    <th className="py-2.5 px-3 font-semibold">Телефон (ERIC)</th>
                    <th className="py-2.5 px-3 font-semibold">Роль</th>
                    <th className="py-2.5 px-3 font-semibold text-right text-[#6D28D9]">
                      AT
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right text-[#D97706]">
                      AC
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EEE6]">
                  {snap.beneficiaries.map((b) => (
                    <tr key={b.id} className="bg-white">
                      <td className="py-2.5 px-3 font-semibold text-[#2A241E]">{b.fullName}</td>
                      <td className="py-2.5 px-3 text-[#5C5349] font-mono-tabular">
                        {b.zionAccountId || 'Не зарегистрирован'}
                      </td>
                      <td className="py-2.5 px-3 text-[#5C5349]">{b.email || '—'}</td>
                      <td className="py-2.5 px-3 text-[#5C5349] tabular-nums">{b.phone || '—'}</td>
                      <td className="py-2.5 px-3 text-[#786E62]">{b.roleNote || '—'}</td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold text-[#6D28D9]">
                        {b.atShare ? `${b.atShare}${unit || ' AT'}` : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold text-[#D97706]">
                        {b.acShare ? `${b.acShare}${unit || ' AC'}` : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#FAF8F3] border border-[#EAE4D7] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#5A5045]">
              Электронная подпись подтверждена: <strong>{snap.signatureFullName}</strong>
            </div>
            <button
              type="button"
              onClick={onCreateNewVersion}
              className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white text-xs font-semibold hover:brightness-105 transition-all whitespace-nowrap shrink-0"
            >
              Редактировать / создать версию v{snap.versionNumber + 1}.0
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form id="doc-header" onSubmit={handleSignSubmit} noValidate className="space-y-4">
      {/* Top Title Row matching "МОЙ КОШЕЛЁК" + Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] border border-[#F3D78D] flex items-center justify-center text-[#B57619] shrink-0">
            <ScrollText className="w-4 h-4" />
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-[#2A241E]">
            ЦИФРОВОЕ НАСЛЕДИЕ
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[12.5px] font-medium text-[#3A3229] hover:bg-[#FAF7F0] transition-colors whitespace-nowrap shrink-0"
          >
            <Save className="w-3.5 h-3.5 text-[#8A7E6E]" />
            <span>Сохранить черновик</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setErrors({});
              onResetForm();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[12.5px] font-medium text-[#6B5E50] hover:bg-[#FAF7F0] hover:text-[#2A241E] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Очистить форму</span>
          </button>
        </div>
      </div>

      {draftSavedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{draftSavedMessage}</span>
        </div>
      )}

      {/* BLOCK 0: Document Header & Auto-generated System Metadata */}
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-[0_1px_4px_rgba(42,36,30,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#F1EDE4]">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-[17px] sm:text-[19px] font-bold text-[#2A241E] leading-snug">
              Распоряжение о цифровом наследии (Digital Legacy)
            </h2>
            <p className="text-[13px] text-[#756B5F]">
              Электронный документ волеизъявления участника экосистемы ZION.CITY
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#9A5B0B] bg-[#FEF7EA] border border-[#F4DFB8] rounded-lg px-3 py-1.5 whitespace-nowrap shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Черновик — не подписано</span>
          </div>
        </div>

        {/* System-populated Read-only Metadata */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#EAE4D7]">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[11px] font-semibold text-[#857A6C]">
                Номер / версия документа
              </span>
              <span className="text-[10px] text-[#9A7B4F] font-medium">Авто</span>
            </div>
            <p className="text-[13.5px] font-mono-tabular font-bold text-[#2A241E]">
              {form.documentNumber}
            </p>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#EAE4D7]">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[11px] font-semibold text-[#857A6C]">Дата создания</span>
              <span className="text-[10px] text-[#9A7B4F] font-medium">Система</span>
            </div>
            <p className="text-[13px] font-semibold text-[#2A241E] tabular-nums">
              {form.createdDate}
            </p>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#EAE4D7] flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-[#857A6C] mb-0.5">
              Состав документа
            </span>
            <p className="text-[13px] font-semibold text-[#2A241E] tabular-nums">
              Наследников в списке: {form.beneficiaries.length}
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Section Sub-Nav */}
      <div className="flex items-center gap-1 border-b border-[#E7E2D8] overflow-x-auto pb-0.5">
        {sectionTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-[12.5px] font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#EA8C1E] text-[#9A5B0B]'
                  : 'border-transparent text-[#6F6559] hover:text-[#2A241E]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Validation summary alert */}
      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#991B1B]"
        >
          <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              Для подписания распоряжения заполните обязательные поля:
            </p>
            <p className="text-[#B91C1C]">
              Проверьте данные завещателя (включая E-mail и телефон), контакты и доли наследников, подтверждения правил и блок электронной подписи.
            </p>
          </div>
        </div>
      )}

      {/* BLOCK 1: Данные завещателя (владельца аккаунта) */}
      {showSection(
        'testator',
        'завещатель владелец фио аккаунт id email почта телефон напутствие комментарий'
      ) && (
        <section
          id="section-testator"
          className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-[0_1px_4px_rgba(42,36,30,0.04)] space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F2EEE6]">
            <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#2A241E]">
                1. Данные завещателя (владельца аккаунта)
              </h3>
              <p className="text-[12px] text-[#7A7065]">
                Заполняется вручную владельцем цифровых активов ZION.CITY
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="owner-fullname"
                className="block text-[12.5px] font-semibold text-[#4A4137] mb-1.5"
              >
                ФИО владельца <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="owner-fullname"
                type="text"
                value={form.ownerFullName}
                onChange={(e) => updateField('ownerFullName', e.target.value)}
                placeholder="Фамилия, имя и отчество полностью"
                className={`w-full px-3.5 py-2.5 text-[13.5px] bg-[#FAF8F4] border rounded-xl text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:bg-white transition-colors ${
                  errors.ownerFullName
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#E5DFD3] focus:border-[#EA8C1E]'
                }`}
              />
              {errors.ownerFullName && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.ownerFullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="owner-zion-id"
                className="block text-[12.5px] font-semibold text-[#4A4137] mb-1.5"
              >
                ID / аккаунт в ZION.CITY <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="owner-zion-id"
                type="text"
                value={form.ownerZionId}
                onChange={(e) => updateField('ownerZionId', e.target.value)}
                placeholder="Например: @username или ID участника"
                className={`w-full px-3.5 py-2.5 text-[13.5px] bg-[#FAF8F4] border rounded-xl text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:bg-white transition-colors ${
                  errors.ownerZionId
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#E5DFD3] focus:border-[#EA8C1E]'
                }`}
              />
              {errors.ownerZionId && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.ownerZionId}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="owner-email"
                className="block text-[12.5px] font-semibold text-[#4A4137] mb-1.5"
              >
                E-mail <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9A8F80] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="owner-email"
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => updateField('ownerEmail', e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-[13.5px] bg-[#FAF8F4] border rounded-xl text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:bg-white transition-colors ${
                    errors.ownerEmail
                      ? 'border-[#DC2626] focus:border-[#DC2626]'
                      : 'border-[#E5DFD3] focus:border-[#EA8C1E]'
                  }`}
                />
              </div>
              {errors.ownerEmail && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.ownerEmail}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="owner-phone"
                className="block text-[12.5px] font-semibold text-[#4A4137] mb-1.5"
              >
                Номер телефона <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9A8F80] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="owner-phone"
                  type="tel"
                  value={form.ownerPhone}
                  onChange={(e) => updateField('ownerPhone', e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-[13.5px] bg-[#FAF8F4] border rounded-xl text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:bg-white transition-colors tabular-nums ${
                    errors.ownerPhone
                      ? 'border-[#DC2626] focus:border-[#DC2626]'
                      : 'border-[#E5DFD3] focus:border-[#EA8C1E]'
                  }`}
                />
              </div>
              {errors.ownerPhone && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.ownerPhone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="personal-message"
                className="block text-[12.5px] font-semibold text-[#4A4137] mb-1.5"
              >
                Комментарий / личное напутствие (опционально)
              </label>
              <textarea
                id="personal-message"
                rows={3}
                value={form.personalMessage}
                onChange={(e) => updateField('personalMessage', e.target.value)}
                placeholder="Личное обращение к наследникам или пояснение по распоряжению..."
                className="w-full px-3.5 py-2.5 text-[13.5px] bg-[#FAF8F4] border border-[#E5DFD3] rounded-xl text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:bg-white focus:border-[#EA8C1E] transition-colors resize-y"
              />
            </div>
          </div>
        </section>
      )}

      {/* BLOCK 2: Наследуемые активы и правила учёта (Synced from ERIC & ADAM) */}
      {showSection(
        'assets',
        'активы altyn token coin at ac эрик адам анализ дивиденды стейкинг узлы ноды проценты сумма'
      ) && (
        <section
          id="section-assets"
          className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-[0_1px_4px_rgba(42,36,30,0.04)] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F2EEE6]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#2A241E]">
                  2. Наследуемые активы и правила учёта
                </h3>
                <p className="text-[12px] text-[#7A7065]">
                  Автозаполнение из анализа ЭРИК и АДАМ · обновлено {assetAnalysis.syncedAt}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefreshEricAdam}
              disabled={isSyncingAssets}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F4] border border-[#E4DDD0] text-[12px] font-semibold text-[#4A4137] hover:bg-[#F3EFE6] transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#D97706] ${isSyncingAssets ? 'animate-spin' : ''}`}
              />
              <span>Обновить данные ЭРИК / АДАМ</span>
            </button>
          </div>

          {/* Read-Only Synced Asset Cards from ERIC & ADAM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ALTYN TOKEN (AT) Synced Card */}
            <div className="bg-[#FAF8FF] border border-[#E6DDF9] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#2E2246]">ALTYN TOKEN (AT)</p>
                    <p className="text-[11px] text-[#6E5C94] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Автозаполнение из анализа ЭРИК и АДАМ</span>
                    </p>
                  </div>
                </div>
                <span className="font-mono-tabular text-[16px] font-bold text-[#6D28D9]">
                  {formatNumberRu(assetAnalysis.altynToken.total)} AT
                </span>
              </div>

              <div className="bg-white/80 border border-[#EAE2FB] rounded-lg p-3 space-y-1.5 text-[12px]">
                <div className="flex items-center justify-between text-[#5C4E7D]">
                  <span>Свободный баланс</span>
                  <span className="font-mono-tabular font-semibold text-[#2E2246]">
                    {formatNumberRu(assetAnalysis.altynToken.freeBalance)} AT
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5C4E7D]">
                  <span>Стейкинг и узлы (vNODE)</span>
                  <span className="font-mono-tabular font-semibold text-[#2E2246]">
                    {formatNumberRu(assetAnalysis.altynToken.stakingAndNodes)} AT
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5C4E7D]">
                  <span>Активные инвестпроекты</span>
                  <span className="font-mono-tabular font-semibold text-[#2E2246]">
                    {formatNumberRu(assetAnalysis.altynToken.activeInvestments)} AT
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="at-custom-cap"
                  className="block text-[11.5px] font-medium text-[#5A4B7C] mb-1"
                >
                  Ограничить объём AT в распоряжении (опционально)
                </label>
                <input
                  id="at-custom-cap"
                  type="number"
                  min="0"
                  step="any"
                  value={form.atCustomCap}
                  onChange={(e) => updateField('atCustomCap', e.target.value)}
                  placeholder="Пусто = учитывать весь объём по анализу ЭРИК и АДАМ"
                  className="w-full px-3 py-2 text-[12.5px] font-mono-tabular bg-white border border-[#DCD2F5] rounded-lg text-[#2A241E] placeholder-[#A59BBE] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            {/* ALTYN COIN (AC) Synced Card */}
            <div className="bg-[#FFFBF2] border border-[#F3E2BD] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#422D0D]">ALTYN COIN (AC)</p>
                    <p className="text-[11px] text-[#8D6B35] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Автозаполнение из анализа ЭРИК и АДАМ</span>
                    </p>
                  </div>
                </div>
                <span className="font-mono-tabular text-[16px] font-bold text-[#D97706]">
                  {formatNumberRu(assetAnalysis.altynCoin.total)} AC
                </span>
              </div>

              <div className="bg-white/85 border border-[#F3E5C8] rounded-lg p-3 space-y-1.5 text-[12px]">
                <div className="flex items-center justify-between text-[#755829]">
                  <span>Свободный баланс</span>
                  <span className="font-mono-tabular font-semibold text-[#422D0D]">
                    {formatNumberRu(assetAnalysis.altynCoin.freeBalance)} AC
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#755829]">
                  <span>Стейкинг и узлы (vNODE)</span>
                  <span className="font-mono-tabular font-semibold text-[#422D0D]">
                    {formatNumberRu(assetAnalysis.altynCoin.stakingAndNodes)} AC
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#755829]">
                  <span>Обязательства и ожидаемые дивиденды</span>
                  <span className="font-mono-tabular font-semibold text-[#422D0D]">
                    {formatNumberRu(assetAnalysis.altynCoin.expectedDividendsAndInvestments)} AC
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="ac-custom-cap"
                  className="block text-[11.5px] font-medium text-[#725220] mb-1"
                >
                  Ограничить объём AC в распоряжении (опционально)
                </label>
                <input
                  id="ac-custom-cap"
                  type="number"
                  min="0"
                  step="any"
                  value={form.acCustomCap}
                  onChange={(e) => updateField('acCustomCap', e.target.value)}
                  placeholder="Пусто = учитывать весь объём по анализу ЭРИК и АДАМ"
                  className="w-full px-3 py-2 text-[12.5px] font-mono-tabular bg-white border border-[#F0D9A7] rounded-lg text-[#2A241E] placeholder-[#B49F78] focus:outline-none focus:border-[#EA8C1E]"
                />
              </div>
            </div>
          </div>

          {/* Distribution Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-[12.5px] font-semibold text-[#4A4137]">
              Способ указания долей наследников:
            </span>
            <div className="inline-flex items-center p-1 bg-[#F3EFE6] rounded-xl border border-[#E6E0D3]">
              <button
                type="button"
                onClick={() => handleModeSwitch('percent')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                  form.distributionMode === 'percent'
                    ? 'bg-white text-[#2A241E] shadow-sm'
                    : 'text-[#6E6458] hover:text-[#2A241E]'
                }`}
              >
                Доли в процентах (%)
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('fixed')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                  form.distributionMode === 'fixed'
                    ? 'bg-white text-[#2A241E] shadow-sm'
                    : 'text-[#6E6458] hover:text-[#2A241E]'
                }`}
              >
                Фиксированный объём (AT / AC)
              </button>
            </div>
          </div>

          {/* Interactive Scope & Continuity Checkboxes */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F4] border border-[#EAE5DA] hover:border-[#D9CFC0] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={form.includeFutureAccruals}
                onChange={(e) => updateField('includeFutureAccruals', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#CFC6B8] text-[#EA8C1E] focus:ring-[#EA8C1E] shrink-0"
              />
              <span className="text-[13px] text-[#352E26] leading-relaxed">
                <strong>Охватывать будущие поступления и начисления (дивиденды в ALTYN COIN)</strong>{' '}
                помимо текущего остатка, зафиксированного на момент активации распоряжения.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F4] border border-[#EAE5DA] hover:border-[#D9CFC0] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={form.preserveObligationsRule}
                onChange={(e) => updateField('preserveObligationsRule', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#CFC6B8] text-[#EA8C1E] focus:ring-[#EA8C1E] shrink-0"
              />
              <span className="text-[13px] text-[#352E26] leading-relaxed">
                <strong>Правило сохранения обязательств:</strong> действующие стейкинги, узлы и
                инвестпроекты не прерываются досрочно; после запуска наследства отключается
                автопродление в «Мои узлы» и «Мои стейки»; распределение выполняется поэтапно по
                мере высвобождения активов, а дивиденды продолжают начисляться в ALTYN COIN с
                блокировкой вывода до завершения проектов.
              </span>
            </label>
          </div>
        </section>
      )}

      {/* BLOCK 3: Наследники и распределение долей */}
      {showSection(
        'beneficiaries',
        'наследники распределение доли kyc отказ перераспределение eric email телефон контакт'
      ) && (
        <section
          id="section-beneficiaries"
          className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-[0_1px_4px_rgba(42,36,30,0.04)] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F2EEE6]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#2A241E]">
                  3. Наследники и распределение долей
                </h3>
                <p className="text-[12px] text-[#7A7065]">
                  Укажите ФИО, контакты для связи через ЭРИК (E-mail и телефон) и доли в AT / AC
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addBeneficiary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FEF7EA] border border-[#F2DAB0] text-[12.5px] font-semibold text-[#9A5B0B] hover:bg-[#FDEFD5] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить наследника</span>
            </button>
          </div>

          {/* Live Validation Bar */}
          <div
            className={`rounded-xl p-3.5 border flex flex-wrap items-center justify-between gap-3 ${
              totals.atExceeds || totals.acExceeds
                ? 'bg-[#FEF2F2] border-[#FECACA]'
                : 'bg-[#FAF8F4] border-[#EAE4D7]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-5 text-[12.5px]">
              <div>
                <span className="text-[#6F6559] mr-2">Распределено ALTYN TOKEN (AT):</span>
                <span
                  className={`font-mono-tabular font-bold ${
                    totals.atExceeds ? 'text-[#DC2626]' : 'text-[#6D28D9]'
                  }`}
                >
                  {totals.atTotal}
                  {form.distributionMode === 'percent' ? '%' : ' AT'}
                </span>
                {form.distributionMode === 'percent' && totals.atTotal > 0 && totals.atTotal < 100 && (
                  <span className="ml-1.5 text-[11.5px] text-[#8A7E6E] tabular-nums">
                    (остаток {Number((100 - totals.atTotal).toFixed(2))}%)
                  </span>
                )}
                {form.distributionMode === 'fixed' && (
                  <span className="ml-1.5 text-[11.5px] text-[#8A7E6E] tabular-nums">
                    из {formatNumberRu(totals.effectiveAtLimit)} AT
                  </span>
                )}
              </div>

              <div>
                <span className="text-[#6F6559] mr-2">Распределено ALTYN COIN (AC):</span>
                <span
                  className={`font-mono-tabular font-bold ${
                    totals.acExceeds ? 'text-[#DC2626]' : 'text-[#D97706]'
                  }`}
                >
                  {totals.acTotal}
                  {form.distributionMode === 'percent' ? '%' : ' AC'}
                </span>
                {form.distributionMode === 'percent' && totals.acTotal > 0 && totals.acTotal < 100 && (
                  <span className="ml-1.5 text-[11.5px] text-[#8A7E6E] tabular-nums">
                    (остаток {Number((100 - totals.acTotal).toFixed(2))}%)
                  </span>
                )}
                {form.distributionMode === 'fixed' && (
                  <span className="ml-1.5 text-[11.5px] text-[#8A7E6E] tabular-nums">
                    из {formatNumberRu(totals.effectiveAcLimit)} AC
                  </span>
                )}
              </div>
            </div>

            {(totals.atExceeds || totals.acExceeds) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {form.distributionMode === 'percent'
                    ? 'Сумма превышает 100%'
                    : 'Сумма превышает доступный объём'}
                </span>
              </span>
            )}
          </div>

          {errors.beneficiaries && (
            <p className="text-xs text-[#DC2626]">{errors.beneficiaries}</p>
          )}
          {errors.atLimit && <p className="text-xs text-[#DC2626]">{errors.atLimit}</p>}
          {errors.acLimit && <p className="text-xs text-[#DC2626]">{errors.acLimit}</p>}

          {/* Dynamic Beneficiary Cards */}
          <div className="space-y-3.5">
            {form.beneficiaries.map((ben, index) => {
              const nameErr = errors[`ben_${ben.id}_fullName`];
              const contactErr = errors[`ben_${ben.id}_contact`];
              const emailErr = errors[`ben_${ben.id}_email`];
              const shareErr = errors[`ben_${ben.id}_shares`];

              return (
                <div
                  key={ben.id}
                  className="bg-[#FCFBF8] border border-[#E7E1D5] rounded-xl p-4 space-y-3.5"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EFEBE1]">
                    <span className="text-[13px] font-bold text-[#3A3229] tabular-nums">
                      Наследник #{index + 1}
                    </span>

                    {form.beneficiaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBeneficiary(ben.id)}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[#8C7E6E] hover:text-[#DC2626] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Удалить</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor={`ben-name-${ben.id}`}
                        className="block text-[12px] font-semibold text-[#4A4137] mb-1"
                      >
                        ФИО наследника <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        id={`ben-name-${ben.id}`}
                        type="text"
                        value={ben.fullName}
                        onChange={(e) =>
                          updateBeneficiary(ben.id, 'fullName', e.target.value)
                        }
                        placeholder="Введите ФИО наследника"
                        className={`w-full px-3 py-2 text-[13px] bg-white border rounded-lg text-[#2A241E] placeholder-[#A59A8C] focus:outline-none transition-colors ${
                          nameErr
                            ? 'border-[#DC2626]'
                            : 'border-[#E2DCD0] focus:border-[#EA8C1E]'
                        }`}
                      />
                      {nameErr && <p className="mt-1 text-xs text-[#DC2626]">{nameErr}</p>}
                    </div>

                    <div>
                      <label
                        htmlFor={`ben-zion-${ben.id}`}
                        className="block text-[12px] font-semibold text-[#4A4137] mb-1"
                      >
                        Аккаунт / ID в ZION.CITY (если уже зарегистрирован)
                      </label>
                      <input
                        id={`ben-zion-${ben.id}`}
                        type="text"
                        value={ben.zionAccountId}
                        onChange={(e) =>
                          updateBeneficiary(ben.id, 'zionAccountId', e.target.value)
                        }
                        placeholder="Оставьте пустым, если ещё не зарегистрирован"
                        className="w-full px-3 py-2 text-[13px] bg-white border border-[#E2DCD0] rounded-lg text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:border-[#EA8C1E] transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`ben-email-${ben.id}`}
                        className="block text-[12px] font-semibold text-[#4A4137] mb-1"
                      >
                        E-mail наследника для связи через ЭРИК
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-[#9A8F80] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id={`ben-email-${ben.id}`}
                          type="email"
                          value={ben.email}
                          onChange={(e) =>
                            updateBeneficiary(ben.id, 'email', e.target.value)
                          }
                          placeholder="heir@example.com"
                          className={`w-full pl-8 pr-3 py-2 text-[13px] bg-white border rounded-lg text-[#2A241E] placeholder-[#A59A8C] focus:outline-none transition-colors ${
                            emailErr || contactErr
                              ? 'border-[#DC2626]'
                              : 'border-[#E2DCD0] focus:border-[#EA8C1E]'
                          }`}
                        />
                      </div>
                      {emailErr && <p className="mt-1 text-xs text-[#DC2626]">{emailErr}</p>}
                    </div>

                    <div>
                      <label
                        htmlFor={`ben-phone-${ben.id}`}
                        className="block text-[12px] font-semibold text-[#4A4137] mb-1"
                      >
                        Контактный номер телефона наследника для ЭРИК
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-[#9A8F80] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id={`ben-phone-${ben.id}`}
                          type="tel"
                          value={ben.phone}
                          onChange={(e) =>
                            updateBeneficiary(ben.id, 'phone', e.target.value)
                          }
                          placeholder="+7 (___) ___-__-__"
                          className={`w-full pl-8 pr-3 py-2 text-[13px] bg-white border rounded-lg text-[#2A241E] placeholder-[#A59A8C] focus:outline-none transition-colors tabular-nums ${
                            contactErr
                              ? 'border-[#DC2626]'
                              : 'border-[#E2DCD0] focus:border-[#EA8C1E]'
                          }`}
                        />
                      </div>
                    </div>

                    {contactErr && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-[#DC2626]">{contactErr}</p>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label
                        htmlFor={`ben-role-${ben.id}`}
                        className="block text-[12px] font-semibold text-[#4A4137] mb-1"
                      >
                        Роль / примечание
                      </label>
                      <input
                        id={`ben-role-${ben.id}`}
                        type="text"
                        value={ben.roleNote}
                        onChange={(e) =>
                          updateBeneficiary(ben.id, 'roleNote', e.target.value)
                        }
                        placeholder="Например: супруг(а), ребёнок, партнёр, друг"
                        className="w-full px-3 py-2 text-[13px] bg-white border border-[#E2DCD0] rounded-lg text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:border-[#EA8C1E] transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`ben-at-${ben.id}`}
                        className="block text-[12px] font-semibold text-[#6D28D9] mb-1"
                      >
                        {form.distributionMode === 'percent'
                          ? 'Доля ALTYN TOKEN (%)'
                          : 'Количество ALTYN TOKEN (AT)'}
                      </label>
                      <input
                        id={`ben-at-${ben.id}`}
                        type="number"
                        min="0"
                        max={form.distributionMode === 'percent' ? '100' : undefined}
                        step="any"
                        value={ben.atShare}
                        onChange={(e) =>
                          updateBeneficiary(ben.id, 'atShare', e.target.value)
                        }
                        placeholder={
                          form.distributionMode === 'percent' ? 'Например: 50' : 'Введите AT'
                        }
                        className="w-full px-3 py-2 text-[13px] font-mono-tabular bg-white border border-[#DCD2F5] rounded-lg text-[#2A241E] placeholder-[#A59BBE] focus:outline-none focus:border-[#7C3AED] transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`ben-ac-${ben.id}`}
                        className="block text-[12px] font-semibold text-[#D97706] mb-1"
                      >
                        {form.distributionMode === 'percent'
                          ? 'Доля ALTYN COIN (%)'
                          : 'Количество ALTYN COIN (AC)'}
                      </label>
                      <input
                        id={`ben-ac-${ben.id}`}
                        type="number"
                        min="0"
                        max={form.distributionMode === 'percent' ? '100' : undefined}
                        step="any"
                        value={ben.acShare}
                        onChange={(e) =>
                          updateBeneficiary(ben.id, 'acShare', e.target.value)
                        }
                        placeholder={
                          form.distributionMode === 'percent' ? 'Например: 50' : 'Введите AC'
                        }
                        className="w-full px-3 py-2 text-[13px] font-mono-tabular bg-white border border-[#F0D9A7] rounded-lg text-[#2A241E] placeholder-[#B49F78] focus:outline-none focus:border-[#EA8C1E] transition-colors"
                      />
                    </div>
                  </div>

                  {shareErr && <p className="text-xs text-[#DC2626]">{shareErr}</p>}
                </div>
              );
            })}
          </div>

          {/* Rules summary for payouts, KYC hold & redistribution */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F4] border border-[#EAE5DA] hover:border-[#D9CFC0] cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={form.confirmRedistributionRule}
              onChange={(e) => updateField('confirmRedistributionRule', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#CFC6B8] text-[#EA8C1E] focus:ring-[#EA8C1E] shrink-0"
            />
            <span className="text-[12.5px] text-[#3D352C] leading-relaxed">
              <strong>Правила выплат, KYC и перераспределения:</strong> выплаты каждому
              наследнику производятся независимо. При неполной регистрации или непрохождении KYC
              доля удерживается на срок до <span className="tabular-nums font-semibold">180</span>{' '}
              дней с момента блокировки аккаунта владельца. При отказе наследника, его смерти
              ранее владельца или непрохождении KYC в течение 180 дней доля перераспределяется
              пропорционально остальным наследникам.
            </span>
          </label>
        </section>
      )}

      {/* BLOCK 4: Условия активации и роль ИИ (ERIC & ADAM) */}
      {showSection(
        'eric',
        'активация 180 дней eric adam эрик адаптация ии проверка смерть блокировка контакт'
      ) && (
        <section
          id="section-eric"
          className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-[0_1px_4px_rgba(42,36,30,0.04)] space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F2EEE6]">
            <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#2A241E]">
                4. Условия активации и роль ИИ (ERIC & ADAM)
              </h3>
              <p className="text-[12px] text-[#7A7065]">
                Многоступенчатая верификация события и защита активов от ложного срабатывания
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#FAF8F4] border border-[#EAE4D7] rounded-xl p-3.5">
              <p className="text-[11px] font-semibold text-[#8A7E6E] mb-1">Триггер проверки</p>
              <p className="text-[15px] font-bold text-[#2A241E] tabular-nums">
                180 календарных дней
              </p>
              <p className="text-[11.5px] text-[#6B6155] mt-1">
                Без входа владельца по логину и паролю (независимо от работы ноды)
              </p>
            </div>

            <div className="bg-[#FAF8F4] border border-[#EAE4D7] rounded-xl p-3.5">
              <p className="text-[11px] font-semibold text-[#8A7E6E] mb-1">ИИ-агент ERIC</p>
              <p className="text-[13px] font-bold text-[#2A241E]">Конфиденциальный опрос</p>
              <p className="text-[11.5px] text-[#6B6155] mt-1">
                Опрашивает указанных лиц без раскрытия деталей завещания
              </p>
            </div>

            <div className="bg-[#FAF8F4] border border-[#EAE4D7] rounded-xl p-3.5">
              <p className="text-[11px] font-semibold text-[#8A7E6E] mb-1">ИИ-агент ADAM</p>
              <p className="text-[13px] font-bold text-[#2A241E]">Проверка документов</p>
              <p className="text-[11.5px] text-[#6B6155] mt-1">
                Без подтверждения смерти аккаунт блокируется с сохранением начисления AC без выплат
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="eric-extra-contact"
              className="block text-[12.5px] font-semibold text-[#4A4137] mb-1.5"
            >
              Дополнительный контакт / примечание для ИИ ЭРИК (опционально)
            </label>
            <textarea
              id="eric-extra-contact"
              rows={2}
              value={form.ericExtraContactNote}
              onChange={(e) => updateField('ericExtraContactNote', e.target.value)}
              placeholder="Укажите резервный контакт доверенного лица или особые инструкции для ERIC..."
              className="w-full px-3.5 py-2.5 text-[13px] bg-[#FAF8F4] border border-[#E5DFD3] rounded-xl text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:bg-white focus:border-[#EA8C1E] transition-colors resize-y"
            />
          </div>

          <div>
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                errors.confirmActivationRule
                  ? 'bg-[#FEF2F2] border-[#FECACA]'
                  : 'bg-[#FAF8F4] border-[#EAE5DA] hover:border-[#D9CFC0]'
              }`}
            >
              <input
                type="checkbox"
                checked={form.confirmActivationRule}
                onChange={(e) => updateField('confirmActivationRule', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#CFC6B8] text-[#EA8C1E] focus:ring-[#EA8C1E] shrink-0"
              />
              <span className="text-[12.5px] text-[#352E26] leading-relaxed">
                <strong>Подтверждаю понимание протокола активации:</strong> ERIC связывается с
                указанными лицами без раскрытия деталей завещания; при отсутствии подтверждения
                смерти (например, длительный отъезд без интернета) аккаунт блокируется с
                сохранением обязательств и начисления дивидендов в ALTYN COIN без выплат;
                наследование запускается только после проверки документов о смерти внутренними
                ИИ-агентами. <span className="text-[#DC2626]">*</span>
              </span>
            </label>
            {errors.confirmActivationRule && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.confirmActivationRule}</p>
            )}
          </div>
        </section>
      )}

      {/* BLOCK 5: Электронная подпись и фиксация */}
      {showSection(
        'signature',
        'подпись эп смарт-контракт аудит ключ подтверждение подписать'
      ) && (
        <section
          id="section-signature"
          className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-[0_1px_4px_rgba(42,36,30,0.04)] space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F2EEE6]">
            <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <FileSignature className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#2A241E]">
                5. Электронная подпись и фиксация
              </h3>
              <p className="text-[12px] text-[#7A7065]">
                Запись текущей версии распоряжения в смарт-контракт и журнал аудита ZION.CITY
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sign-fullname"
                className="block text-[12.5px] font-semibold text-[#4A4137] mb-1.5"
              >
                Полное ФИО для электронной подписи <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="sign-fullname"
                type="text"
                value={form.signatureFullName}
                onChange={(e) => updateField('signatureFullName', e.target.value)}
                placeholder="Повторите ФИО для подтверждения подписи"
                className={`w-full px-3.5 py-2.5 text-[13.5px] bg-[#FAF8F4] border rounded-xl text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:bg-white transition-colors ${
                  errors.signatureFullName
                    ? 'border-[#DC2626]'
                    : 'border-[#E5DFD3] focus:border-[#EA8C1E]'
                }`}
              />
              {errors.signatureFullName && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.signatureFullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="sign-key"
                className="block text-[12.5px] font-semibold text-[#4A4137] mb-1.5"
              >
                Ключ / код электронной подписи или фраза подтверждения{' '}
                <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9A8F80] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="sign-key"
                  type={showSignKey ? 'text' : 'password'}
                  value={form.signatureKey}
                  onChange={(e) => updateField('signatureKey', e.target.value)}
                  placeholder="Введите ключ ЭП или контрольную фразу"
                  className={`w-full pl-9 pr-10 py-2.5 text-[13.5px] bg-[#FAF8F4] border rounded-xl text-[#2A241E] placeholder-[#A59A8C] focus:outline-none focus:bg-white transition-colors ${
                    errors.signatureKey
                      ? 'border-[#DC2626]'
                      : 'border-[#E5DFD3] focus:border-[#EA8C1E]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignKey((v) => !v)}
                  aria-label={showSignKey ? 'Скрыть ключ' : 'Показать ключ'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#857A6C] hover:text-[#2A241E]"
                >
                  {showSignKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.signatureKey && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.signatureKey}</p>
              )}
            </div>
          </div>

          <div>
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                errors.confirmSmartContractAudit
                  ? 'bg-[#FEF2F2] border-[#FECACA]'
                  : 'bg-[#FAF8F4] border-[#EAE5DA] hover:border-[#D9CFC0]'
              }`}
            >
              <input
                type="checkbox"
                checked={form.confirmSmartContractAudit}
                onChange={(e) => updateField('confirmSmartContractAudit', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#CFC6B8] text-[#EA8C1E] focus:ring-[#EA8C1E] shrink-0"
              />
              <span className="text-[12.5px] text-[#352E26] leading-relaxed">
                Согласен с условиями распоряжения о цифровом наследии и записью версии документа в
                смарт-контракт и журнал аудита экосистемы ZION.CITY.{' '}
                <span className="text-[#DC2626]">*</span>
              </span>
            </label>
            {errors.confirmSmartContractAudit && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.confirmSmartContractAudit}</p>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#F1EDE4] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#786E62]">
              <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>Перед подписанием все данные можно редактировать и сохранить в черновик</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onSaveDraft}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#E2DCD0] text-[13px] font-semibold text-[#3B332B] hover:bg-[#FAF7F0] transition-colors whitespace-nowrap shrink-0"
              >
                Сохранить черновик
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  onResetForm();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#E5DFD3] text-[13px] font-semibold text-[#6E6356] hover:text-[#2A241E] transition-colors whitespace-nowrap shrink-0"
              >
                Очистить форму
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white text-[13px] font-semibold shadow-sm hover:brightness-105 active:scale-[0.99] transition-all whitespace-nowrap shrink-0"
              >
                <span>Подписать распоряжение (ЭП)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </form>
  );
};
