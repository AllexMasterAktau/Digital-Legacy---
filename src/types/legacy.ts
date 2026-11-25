export type DistributionMode = 'percent' | 'fixed';

export type DocumentStatus = 'draft' | 'signed';

export interface BeneficiaryEntry {
  id: string;
  fullName: string;
  zionAccountId: string;
  email: string;
  phone: string;
  roleNote: string;
  atShare: string;
  acShare: string;
}

export interface EricAdamAssetAnalysis {
  syncedAt: string;
  altynToken: {
    freeBalance: number;
    stakingAndNodes: number;
    activeInvestments: number;
    total: number;
  };
  altynCoin: {
    freeBalance: number;
    stakingAndNodes: number;
    expectedDividendsAndInvestments: number;
    total: number;
  };
}

export interface DigitalLegacyFormState {
  // Block 0: System-generated Document Metadata (read-only)
  documentNumber: string;
  versionNumber: number;
  createdDate: string;

  // Block 1: Testator (manual, starts empty)
  ownerFullName: string;
  ownerZionId: string;
  ownerEmail: string;
  ownerPhone: string;
  personalMessage: string;

  // Block 2: Assets & Continuity Rules
  distributionMode: DistributionMode;
  atCustomCap: string;
  acCustomCap: string;
  includeFutureAccruals: boolean;
  preserveObligationsRule: boolean;

  // Block 3: Beneficiaries (starts with 1 blank card)
  beneficiaries: BeneficiaryEntry[];
  confirmRedistributionRule: boolean;

  // Block 4: Activation & AI (ERIC & ADAM)
  ericExtraContactNote: string;
  confirmActivationRule: boolean;

  // Block 5: Electronic Signature (manual, starts empty)
  signatureFullName: string;
  signatureKey: string;
  confirmSmartContractAudit: boolean;
}

export interface SignedReceipt {
  signedAt: string;
  documentCode: string;
  versionLabel: string;
  signatureHash: string;
  assetSnapshot: EricAdamAssetAnalysis;
  snapshot: DigitalLegacyFormState;
}

export type ValidationErrors = Record<string, string>;

export function formatRussianTimestamp(date: Date = new Date()): string {
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDocumentCode(versionNumber: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  return `DL-${year}-001 · v${versionNumber}.0`;
}

export function createInitialEricAdamAnalysis(now: Date = new Date()): EricAdamAssetAnalysis {
  return {
    syncedAt: formatRussianTimestamp(now),
    altynToken: {
      freeBalance: 460.0,
      stakingAndNodes: 1200.0,
      activeInvestments: 400.0,
      total: 2060.0,
    },
    altynCoin: {
      freeBalance: 125.5,
      stakingAndNodes: 340.0,
      expectedDividendsAndInvestments: 184.5,
      total: 650.0,
    },
  };
}

export function createEmptyBeneficiary(): BeneficiaryEntry {
  return {
    id: `ben-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fullName: '',
    zionAccountId: '',
    email: '',
    phone: '',
    roleNote: '',
    atShare: '',
    acShare: '',
  };
}

export function createEmptyLegacyFormState(
  versionNumber: number = 1,
  now: Date = new Date()
): DigitalLegacyFormState {
  return {
    documentNumber: formatDocumentCode(versionNumber, now),
    versionNumber,
    createdDate: formatRussianTimestamp(now),
    ownerFullName: '',
    ownerZionId: '',
    ownerEmail: '',
    ownerPhone: '',
    personalMessage: '',
    distributionMode: 'percent',
    atCustomCap: '',
    acCustomCap: '',
    includeFutureAccruals: false,
    preserveObligationsRule: false,
    beneficiaries: [createEmptyBeneficiary()],
    confirmRedistributionRule: false,
    ericExtraContactNote: '',
    confirmActivationRule: false,
    signatureFullName: '',
    signatureKey: '',
    confirmSmartContractAudit: false,
  };
}
