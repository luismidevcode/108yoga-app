import { mindbodyFetch } from './mindBodyConfig';
// Buscar cliente por email
export function getServicesByServiceId(ServiceId: string, userToken?: string) {
  //const token = userToken ?? getStoredUserToken() ?? '';
  return mindbodyFetch(
    `sale/services?request.serviceIds=${encodeURIComponent(ServiceId)}`,{accessToken: userToken}
  );
}