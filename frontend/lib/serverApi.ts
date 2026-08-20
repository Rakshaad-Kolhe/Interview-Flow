import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Server-side fetcher for Next.js Server Components.
 * Automatically forwards the HttpOnly 'token' cookie to the Express backend.
 */
export const serverFetch = async (endpoint: string, options: RequestInit = {}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Securely attach the cookie so Express `cookie-parser` can authenticate
  if (token) {
    headers['Cookie'] = `token=${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    // Note: 'credentials' is a browser concept; here we manually attach the Cookie header.
  });

  if (!res.ok) {
    throw new Error(`Server API error: ${res.status}`);
  }

  return res.json();
};
