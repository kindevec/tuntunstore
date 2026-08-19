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
  redemptionCode?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: 'client' | 'admin';
  // walletBalanceUSD is no longer a static column in DB. It should be calculated dynamically.
  // We keep the property in the frontend type to hold the computed value after fetching transactions.
  walletBalanceUSD?: number; 
  playerIdDefault?: string;
  gamerTag?: string;
  phone?: string;
  preferredBank?: string;
  isBlocked?: boolean;
}

export type WalletTransactionType = 'top_up' | 'purchase' | 'refund' | 'admin_adjustment';
export type WalletTransactionStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  receipt_url?: string;
  admin_note?: string;
  created_at: string;
  receipt_hash?: string;
  auto_verified?: boolean;
  verification_warnings?: string[];
}

export interface EmailAlertConfig {
  enabled: boolean;
  adminEmail: string;
  notifyOnNewOrder: boolean;
  notifyOnStatusChange: boolean;
  smtpStatus: 'simulated' | 'connected' | 'error';
}

export interface HeroSlide {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  order_index: number;
  active: boolean;
}
