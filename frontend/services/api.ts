const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface HealthStatus {
  status: string;
  service: string;
  dependencies: { postgres: string; mongodb: string; redis: string; };
}

export const checkHealth = async (): Promise<HealthStatus | null> => {
  try {
    const response = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching health status:', error);
    return null;
  }
};

// --- AUTHENTICATION ---
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Still include Authorization header for backward compatibility during transition,
  // but also rely on cookies which will be automatically sent due to credentials: 'include'
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important for HttpOnly cookies
  });

  return res;
};

export const register = async (data: any) => {
  const res = await fetchWithAuth(`${API_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const login = async (data: any) => {
  const res = await fetchWithAuth(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getCurrentUser = async () => {
  const res = await fetchWithAuth(`${API_URL}/auth/me`);
  return res.json();
};

// --- INTERVIEWS ---
export const getInterviews = async () => {
  const res = await fetchWithAuth(`${API_URL}/interviews`);
  return res.json();
};

export const createInterview = async (data: any) => {
  const res = await fetchWithAuth(`${API_URL}/interviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteInterview = async (id: string) => {
  const res = await fetchWithAuth(`${API_URL}/interviews/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const getInterviewById = async (id: string) => {
  const res = await fetchWithAuth(`${API_URL}/interviews/${id}`);
  return res.json();
};

export const generateQuestions = async (id: string, data: any) => {
  const res = await fetchWithAuth(`${API_URL}/interviews/${id}/generate-questions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getChallenge = async () => {
  const res = await fetchWithAuth(`${API_URL}/external/challenge`);
  return res.json();
};

export const verifyPayment = async (data: any) => {
  const res = await fetchWithAuth(`${API_URL}/payments/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

// --- CLOSURE DEMONSTRATION ---
// This is a higher-order function that captures the base path in its lexical scope.
export const createScopedApiClient = (basePath: string) => {
  return {
    get: async (endpoint: string) => {
      const res = await fetchWithAuth(`${API_URL}${basePath}${endpoint}`);
      return res.json();
    }
  };
};

export const scopedInterviewApi = createScopedApiClient('/interviews');
