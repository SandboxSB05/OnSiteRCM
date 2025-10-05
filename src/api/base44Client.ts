// Mock API Client - Replace with your own backend API
// This file replaces the @base44/sdk client

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ClientConfig {
  appId: string;
  requiresAuth: boolean;
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class MockClient {
  appId: string;
  requiresAuth: boolean;

  constructor(config: ClientConfig) {
    this.appId = config.appId;
    this.requiresAuth = config.requiresAuth;
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

export function createClient(config: ClientConfig) {
  const client = new MockClient(config);
  
  return {
    client,
    entities: {} as any, // Will be populated by entity imports
    auth: null as any, // Will be populated by User entity
  };
}

// Create a client instance
export const base44 = createClient({
  appId: "roof-tracker-pro",
  requiresAuth: false
});
