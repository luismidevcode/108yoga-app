import { mindbodyFetch } from './mindBodyConfig';
import { getStoredUserToken } from './mindBodyUserToken';

// Buscar cliente por email
export function findClientByEmail(email: string, userToken: string = getStoredUserToken() ?? '') {
  return mindbodyFetch(
    `client/clients?SearchText=${encodeURIComponent(email)}`,{accessToken: userToken}
  );
}

// Crear nuevo cliente
export function createClient(clientData: any) {
  return mindbodyFetch('client/addclient', clientData);
}