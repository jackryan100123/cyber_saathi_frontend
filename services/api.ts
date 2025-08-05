import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.cybersaathi.com';

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

// Mock API responses for development
const mockChatResponse = (message: string): ChatResponse => {
  const responses: Record<string, string> = {
    'report': `🚨 **Reporting a Cyber Crime**

To report a cybercrime in India:

**Immediate Steps:**
1. **Call 1930** - National Cyber Crime Helpline
2. **File Online Complaint** at https://cybercrime.gov.in/
3. **Preserve Evidence** - Screenshots, emails, transaction details

**Required Information:**
• Personal details of complainant
• Details of the incident
• Financial loss (if any)
• Supporting documents/evidence

**Legal Framework:**
• IT Act 2000 - Sections 66, 66A, 66C, 66D
• Indian Penal Code - Sections 419, 420, 468, 471

**Follow-up:**
• Note your complaint number
• Track status online
• Cooperate with investigating officers

Stay vigilant and report suspicious activities immediately.`,

    'check': `🛡️ **Website Safety Check**

To check if a website is safe:

**How to Use:**
1. Type: "scan url [website address]"
2. Example: "scan url https://example.com"

**What We Check:**
• Malware detection
• Phishing attempts
• Suspicious redirects
• Domain reputation
• SSL certificate validity

**Safety Tips:**
• Always verify URLs before clicking
• Look for HTTPS (secure connection)
• Check for spelling errors in domain names
• Be cautious with shortened URLs
• Never enter personal info on suspicious sites

Type a URL to scan it now!`,

    'tips': `🔐 **Essential Cybersecurity Tips**

**Password Security:**
• Use 12+ character passwords
• Include uppercase, lowercase, numbers, symbols
• Enable two-factor authentication
• Use unique passwords for each account

**Email Safety:**
• Verify sender before clicking links
• Don't download suspicious attachments
• Check for spelling/grammar errors
• Verify urgent requests through other channels

**Online Shopping:**
• Shop only on trusted websites
• Use secure payment methods
• Check seller reviews and ratings
• Avoid deals that seem too good to be true

**Social Media:**
• Review privacy settings regularly
• Don't share personal information publicly
• Be cautious with friend requests from strangers
• Think before you post

**Mobile Security:**
• Keep apps updated
• Download apps only from official stores
• Review app permissions
• Use screen locks and biometric authentication

Stay informed, stay protected! 🔒`,

    'help': `🚨 **Emergency Cyber Help**

**Immediate Actions:**
1. **Disconnect** from internet if actively being attacked
2. **Document** everything - screenshots, emails, messages
3. **Don't panic** - help is available

**Emergency Contacts:**
• **National Helpline:** 1930
• **Chandigarh Cyber Cell:** 0172-2749900
• **Email:** cybercrime-chd@nic.in

**Common Emergencies:**
• **Digital Arrest Scam** - Hang up immediately, report
• **Sextortion** - Don't pay, report to police
• **Financial Fraud** - Contact bank, freeze accounts
• **Identity Theft** - Report to authorities, monitor accounts

**Legal Support:**
• File FIR at nearest police station
• Approach Cyber Crime Cell
• Seek legal counsel if needed

**Remember:** You're not alone. Help is available 24/7.`,

    'default': `Hello! I'm CyberSaathi, your AI cybersecurity assistant. I can help you with:

• **Report Cyber Crimes** - Guide you through the reporting process
• **Check Website Safety** - Scan URLs for threats
• **Security Tips** - Learn best practices for online safety
• **Emergency Help** - Get immediate assistance

How can I help you stay safe online today?`
  };

  const key = Object.keys(responses).find(k => message.toLowerCase().includes(k)) || 'default';
  return {
    success: true,
    response: responses[key]
  };
};

const mockNewsResponse = (): NewsResponse => ({
  success: true,
  articles: [
    {
      title: "New Cybersecurity Framework Released by Government of India",
      description: "The Ministry of Electronics and IT has announced a comprehensive cybersecurity framework to protect critical infrastructure and enhance digital security across the nation.",
      url: "https://example.com/news1",
      publishedAt: new Date().toISOString(),
      source: "PIB India",
      category: "Government"
    },
    {
      title: "Rise in Digital Payment Frauds: RBI Issues Advisory",
      description: "The Reserve Bank of India has issued new guidelines to combat the increasing cases of digital payment frauds and protect consumers from online financial crimes.",
      url: "https://example.com/news2",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: "RBI",
      category: "Banking"
    },
    {
      title: "CERT-In Reports 300% Increase in Phishing Attacks",
      description: "The Indian Computer Emergency Response Team has reported a significant surge in phishing attacks targeting Indian users, particularly through social media and messaging platforms.",
      url: "https://example.com/news3",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: "CERT-In",
      category: "Security"
    }
  ]
});

const mockUrlScanResponse = (url: string): UrlScanResponse => {
  const isKnownSafe = ['google.com', 'microsoft.com', 'apple.com', 'github.com'].some(domain => url.includes(domain));
  const isKnownDangerous = ['malware-test.com', 'phishing-example.com'].some(domain => url.includes(domain));
  
  if (isKnownDangerous) {
    return {
      success: true,
      result: {
        url,
        status: 'completed',
        riskLevel: 'dangerous',
        threats: ['Malware', 'Phishing'],
        scanTime: new Date().toISOString(),
        details: {
          malicious: 15,
          suspicious: 3,
          harmless: 2,
          undetected: 5
        }
      }
    };
  }
  
  return {
    success: true,
    result: {
      url,
      status: 'completed',
      riskLevel: isKnownSafe ? 'safe' : 'unknown',
      threats: [],
      scanTime: new Date().toISOString(),
      details: {
        malicious: 0,
        suspicious: 0,
        harmless: 20,
        undetected: 5
      }
    }
  };
};

// API Functions
export const api = {
  // Health check
  async getHealth(): Promise<HealthResponse> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          ai: true,
          urlScanner: true,
          news: true,
        }
      };
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockNewsResponse();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Scan URL
  async scanUrl(url: string): Promise<UrlScanResponse> {
    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      return mockUrlScanResponse(url);
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