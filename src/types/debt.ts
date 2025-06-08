export type TransactionType =
  | 'initial_balance' // Should ideally be phased out for new debtors
  | 'payment'
  | 'new_credit'
  | 'adjustment_increase'
  | 'adjustment_decrease'
  | 'full_settlement';

export interface Transaction {
  id: string;
  date: string; // ISO date string (will be converted to/from Firestore Timestamp)
  type: TransactionType;
  amount: number;
  description?: string;
}

export interface Debtor {
  id: string; // Firestore document ID
  name: string;
  amountOwed: number; // This will be calculated client-side from transactions
  creditLimit: number;
  paymentHistory: string; // General summary, transactions provide details
  phoneNumber?: string;
  userId?: string; // UID of the Firebase user
  lastUpdated: string; // ISO date string (will be converted to/from Firestore Timestamp)
  transactions: Transaction[];
}
