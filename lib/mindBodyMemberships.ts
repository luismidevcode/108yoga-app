import { mindbodyFetch } from './mindBodyConfig';
import { getStoredUserToken } from './mindBodyUserToken';

// Buscar cliente por email
export function getMembershipsByClient(clientId: string, userToken?: string) {
  const token = userToken ?? getStoredUserToken() ?? '';
  return mindbodyFetch(
    `client/activeclientsmemberships?request.clientIds=${encodeURIComponent(clientId)}`,{accessToken: token}
  );
}

export function getPurchasesByClient(clientId: string, startDate?: Date, endDate?: Date, userToken?: string) {
  const token = userToken ?? getStoredUserToken() ?? '';
  
  // Predefinir fechas por defecto
  const today = new Date();
  const defaultEndDate = endDate ?? today;
  const defaultStartDate = startDate ?? (() => {
    const date = new Date(today);
    date.setFullYear(date.getFullYear() - 1); // 1 año antes
    date.setMonth(date.getMonth() - 1); // 1 mes adicional antes
    return date;
  })();
  
  return mindbodyFetch(
    `client/clientpurchases?request.clientId=${encodeURIComponent(clientId)}&request.startDate=${encodeURIComponent(defaultStartDate.toISOString())}&request.endDate=${encodeURIComponent(defaultEndDate.toISOString())}`,{accessToken: token}
  );
}