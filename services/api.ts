import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'https://cyber-saathi-backend.onrender.com'

// Add timeout and better error handling
const TIMEOUT_MS = 10000; // 10 seconds

// Create fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

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

// Booklets
export interface Booklet {
  id: string;
  title: string;
  filename?: string;
  fileUrl: string;
  size: string;
}

export interface BookletsResponse {
  success: boolean;
  booklets: Booklet[];
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
  console.log('API Error Details:', error); // Debug logging
  
  if (error.name === 'AbortError') {
    return new ApiError(
      'Request timed out. Please check your connection and try again.',
      408,
      'TIMEOUT_ERROR'
    );
  } else if (error.response) {
    return new ApiError(
      error.response.data?.message || 'Server error',
      error.response.status,
      error.response.data?.code
    );
  } else if (error.request) {
    return new ApiError(
      'Cannot connect to server. Please check your connection and ensure backend is running.',
      0,
      'NETWORK_ERROR'
    );
  } else if (error.message?.includes('Network request failed')) {
    return new ApiError(
      'Network connection failed. Make sure you are connected to the same network as the backend server.',
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
      console.log('Attempting to connect to:', `${API_BASE_URL}/health`);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Health check response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to get health status from backend', response.status);
      }
      const data = await response.json();
      console.log('Health check successful:', data);
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw handleApiError(error);
    }
  },

  // AI Chat
  async sendChatMessage(messages: Message[]): Promise<ChatResponse> {
    try {
      console.log('Sending chat message to:', `${API_BASE_URL}/chat`);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      console.log('Chat response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to get response from backend', response.status);
      }
      const data = await response.json();
      console.log('Chat message successful');
      return {
        success: data.success,
        response: data.response,
        error: data.error,
      };
    } catch (error) {
      console.error('Chat message failed:', error);
      throw handleApiError(error);
    }
  },

  // Get cybersecurity news
  async getNews(): Promise<NewsResponse> {
    try {
      console.log('Fetching news from:', `${API_BASE_URL}/news`);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/news`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('News response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to get news from backend', response.status);
      }
      const data = await response.json();
      console.log('News fetch successful, articles count:', data.articles?.length || 0);
      return data;
    } catch (error) {
      console.error('News fetch failed:', error);
      throw handleApiError(error);
    }
  },

  // Get booklets list
  async getBooklets(): Promise<BookletsResponse> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/booklets`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to get booklets from backend', response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Scan URL
  async scanUrl(url: string): Promise<UrlScanResponse> {
    try {
      console.log('Scanning URL via:', `${API_BASE_URL}/scan-url`);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/scan-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      console.log('URL scan response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to scan URL', response.status);
      }
      const data = await response.json();
      console.log('URL scan successful');
      return data;
    } catch (error) {
      console.error('URL scan failed:', error);
      throw handleApiError(error);
    }
  },

  // Transcribe audio
  async transcribeAudio(fileUri: string): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
      console.log('Transcribing audio from:', fileUri);
      
      const formData = new FormData();
      formData.append('audio', {
        uri: fileUri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/transcribe`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      
      console.log('Transcription response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Failed to transcribe audio', response.status);
      }
      
      const data = await response.json();
      console.log('Transcription successful');
      return {
        success: data.success,
        text: data.text,
        error: data.error,
      };
    } catch (error: any) {
      console.error('Transcription failed:', error);
      // Temporary fallback for development
      if (error.message?.includes('Network') || error.status === 0) {
        return {
          success: true,
          text: 'Sample transcribed text for testing',
        };
      }
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

// Test connection function
export const testConnection = async (): Promise<boolean> => {
  try {
    await api.getHealth();
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export default api;