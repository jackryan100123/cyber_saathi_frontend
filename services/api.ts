import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.52:5000';

// Types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  category?: string;
}

export interface NewsResponse {
  success: boolean;
  articles: NewsArticle[];
  error?: string;
}

export interface UrlScanResult {
  url: string;
  status: string;
  riskLevel: 'safe' | 'suspicious' | 'dangerous' | 'unknown';
  threats: string[];
  scanTime: string;
  details: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
  };
}

export interface UrlScanResponse {
  success: boolean;
  result?: UrlScanResult;
  error?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    ai: boolean;
    urlScanner: boolean;
    news: boolean;
  };
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return new ApiError(
      error.response.data?.message || 'Server error',
      error.response.status,
      error.response.data?.code
    );
  } else if (error.request) {
    return new ApiError(
      'No response from server. Please check your connection.',
      0,
      'NETWORK_ERROR'
    );
  } else {
    return new ApiError(
      error.message || 'Unknown error occurred',
      0,
      'UNKNOWN_ERROR'
    );
  }
};

// API Functions
export const api = {
  // Health check
  async getHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to get health status from backend', response.status);
      }
      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // AI Chat
  async sendChatMessage(messages: Message[]): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to get response from backend', response.status);
      }
      const data = await response.json();
      return {
        success: data.success,
        response: data.response,
        error: data.error,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get cybersecurity news
  async getNews(): Promise<NewsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/news`, {
        method: 'GET',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to get news from backend', response.status);
      }
      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Scan URL
  async scanUrl(url: string): Promise<UrlScanResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/scan-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to scan URL', response.status);
      }
      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Utility functions
export const formatUrlForScan = (input: string): string | null => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = input.match(urlRegex);
  return matches ? matches[0] : null;
};

export const isUrlScanRequest = (input: string): boolean => {
  const urlScanKeywords = [
    'scan url',
    'check url',
    'check website',
    'scan website',
    'is this site safe',
    'website safety',
    'url safety'
  ];
  return urlScanKeywords.some(keyword => 
    input.toLowerCase().includes(keyword)
  );
};

export default api;