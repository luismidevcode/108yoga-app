const MINDBODY_API_KEY = '8f8226a548614defb8e057cff8014944';
const MINDBODY_API_URL = 'https://api.mindbodyonline.com/public/v6/';
const MINDBODY_SITE_ID = '317131';


interface MindbodyUserTokenResponse {
  AccessToken: string;
  ClientId?: number;
  SiteId?: number;
  ExpirationDate?: string;
}

let globalUserToken: string | null = null;

export async function getUserToken(): Promise<string> {
  const response = await fetch(`${MINDBODY_API_URL}usertoken/issue`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': MINDBODY_API_KEY,
      SiteId: MINDBODY_SITE_ID,
    },
    body: JSON.stringify({
      Username: "andreachehebar@gmail.com",
      Password: "Chehebar123",
    }),
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Error obteniendo access token: ${error?.Message || response.statusText}`);
  }

  const data: MindbodyUserTokenResponse = await response.json();
  globalUserToken = data.AccessToken; // Guarda el token globalmente
  return data.AccessToken;
}

// Exporta una función para obtener el token global actual
export function getStoredUserToken(): string | null {
  return globalUserToken;
}
