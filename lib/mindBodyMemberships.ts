import { mindbodyFetch } from './mindBodyConfig';
import { getStoredUserToken } from './mindBodyUserToken';

// Buscar cliente por email
export function getMembershipsByClient(clientId: string, userToken?: string) {
  const token = userToken ?? getStoredUserToken() ?? '';
  return mindbodyFetch(
    `client/activeclientsmemberships?request.clientIds=${encodeURIComponent(clientId)}`,{accessToken: token}
  );
}