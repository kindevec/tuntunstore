export type ProductCategory = 'diamonds' | 'passes' | 'memberships' | 'promos';

export interface Product {
  id: string;
  name: string;
  diamonds: number;
  bonusDiamonds?: number;
  priceUSD: number;
  category: ProductCategory;
  description: string;
  isPopular?: boolean;
  isGoldPromo?: boolean; // Strictly for membership or promo gold highlights
  imageType?: 'diamond-small' | 'diamond-medium' | 'diamond-large' | 'pass-level' | 'membership-weekly' | 'membership-monthly' | 'promo-bundle';
  badgeText?: string;
}

export type OrderStatus = 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderId: string;
  logoColor: string;
  qrUrl?: string;
  notes?: string;
}

export interface Order {
  id: string; // e.g. TTS-84920
  date: string;
  userEmail: string;
  userName: string;
  playerId: string;
  playerTag?: string;
  productId: string;
  productName: string;
  diamondsTotal: number;
  priceUSD: number;
  bankName: string;
  receiptUrl: string; // base64 or object URL
  receiptFileName?: string;
  status: OrderStatus;
  paymentMethod?: 'bank_transfer' | 'wallet_balance';
  isWalletTopUp?: boolean;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  adminNotes?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: 'client' | 'admin';
  walletBalanceUSD: number;
  playerIdDefault?: string;
  gamerTag?: string;
  phone?: string;
  preferredBank?: string;
}

export interface EmailAlertConfig {
  enabled: boolean;
  adminEmail: string;
  notifyOnNewOrder: boolean;
  notifyOnStatusChange: boolean;
  smtpStatus: 'active' | 'simulated';
}
