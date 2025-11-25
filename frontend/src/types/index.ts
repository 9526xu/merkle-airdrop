export interface WhitelistEntry {
  address: string;
  amount: string;
}

export interface WhitelistDatabase {
  [address: string]: WhitelistEntry;
}

export interface UserState {
  phase: 'COLLECTION' | 'CLAIM';
  address: string | undefined;
  isWhitelisted: boolean;
  allocation: string | null;
  hasClaimed: boolean;
}
