
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  WITH_INTEREST = 'WITH_INTEREST',
  READY_TO_ACTIVATE = 'READY_TO_ACTIVATE',
  ACTIVE_BIDDING = 'ACTIVE_BIDDING',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  ADJUDICATED = 'ADJUDICATED',
  PAID = 'PAID',
  SETTLED = 'SETTLED',
  DESERTED = 'DESERTED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  identification: string;
}

export interface CattleData {
  breed: string;
  weight: number;
  age: number;
  sex: 'MACHO' | 'HEMBRA';
  condition: string;
  vetNotes?: string;
}

export interface AuctionItem {
  id: string;
  number: number;
  title: string;
  description: string;
  imageUrl: string;
  sellerId: string;
  status: ItemStatus;
  basePrice: number;
  minIncrement: number;
  reservePrice?: number;
  isCattle: boolean;
  cattleData?: CattleData;
  interestedUserIds: string[];
  buyIntentUserIds: string[];
  currentBid?: number;
  winnerId?: string;
  endTime?: number;
}

export interface BidEntry {
  id: string;
  itemId: string;
  userId: string;
  amount: number;
  timestamp: number;
}
