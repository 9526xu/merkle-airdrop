export interface WhitelistEntry {
  address: string;
  amount: string;
}

export interface WhitelistStatusResponse {
  isWhitelisted: boolean;
  allocation: string | null;
  proof: string[];
}

// Plan B: Point to Express Backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

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
  admin: {
    getStatus: async (): Promise<{ status: 'COLLECTION' | 'PROCESSING' | 'CLAIM' }> => {
      const response = await fetch(`${API_BASE_URL}/admin/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      return response.json();
    },
    updateStatus: async (status: 'COLLECTION' | 'PROCESSING' | 'CLAIM', password: string): Promise<{ status: 'COLLECTION' | 'PROCESSING' | 'CLAIM' }> => {
      const response = await fetch(`${API_BASE_URL}/admin/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }
      return response.json();
    },
    generateTree: async (password: string): Promise<{ success: boolean; merkleRoot: string; count: number }> => {
      const response = await fetch(`${API_BASE_URL}/admin/generate-tree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate tree');
      }
      return response.json();
    },
  },
  claim: {
    submit: async (claimer: string, amount: string, proof: string[], signature: string): Promise<{ transactionHash: string }> => {
      const response = await fetch(`${API_BASE_URL}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claimer, amount, merkleProof: proof, signature }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim');
      }
      return response.json();
    },
  },
};
