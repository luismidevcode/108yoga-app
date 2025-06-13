import { getStoredUserToken } from './mindBodyUserToken';

export const MINDBODY_API_KEY = '8f8226a548614defb8e057cff8014944';
export const MINDBODY_API_URL = 'https://api.mindbodyonline.com/public/v6/';
export const MINDBODY_SITE_ID = '317131';
export const MINDBODY_API_VERSION = '6';



interface MindbodyRequestOptions extends RequestInit {
  headers?: Record<string, string>;
  accessToken?: string;
}

export async function mindbodyFetch<T = any>(
  endpoint: string,
  options: MindbodyRequestOptions = {},
  methodType: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
): Promise<T> {
  const accessToken = options.accessToken ?? getStoredUserToken();
  const { accessToken: _, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Api-Key': MINDBODY_API_KEY,
    'SiteId': MINDBODY_SITE_ID,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'version': MINDBODY_API_VERSION,
    ...(fetchOptions.headers || {}),
  };

  if (accessToken) {
    headers['Authorization'] = accessToken;
  }

  const res = await fetch(`${MINDBODY_API_URL}${endpoint}`, {
    ...fetchOptions,
    method: methodType, // <-- Usa el método proporcionado
    headers,
  });

  if (!res.ok) {
    throw new Error(`Mindbody API error: ${res.status}`);
  }
  return res.json();
}

