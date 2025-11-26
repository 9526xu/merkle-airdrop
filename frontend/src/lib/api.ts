export interface WhitelistEntry {
  address: string;
  amount: string;
}

export interface WhitelistStatusResponse {
  isWhitelisted: boolean;
  allocation: string | null;
  proof: string[];
}

export const API_BASE_URL = '/api';

export const api = {
  whitelist: {
    join: async (address: string): Promise<{ success: boolean; allocation: string }> => {
      const response = await fetch(`${API_BASE_URL}/whitelist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) {
        throw new Error('Failed to join whitelist');
      }
      return response.json();
    },
    status: async (address: string): Promise<WhitelistStatusResponse> => {
      const response = await fetch(`${API_BASE_URL}/whitelist/status?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch whitelist status');
      }
      return response.json();
    },
  },
};
