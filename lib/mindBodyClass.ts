
import { mindbodyFetch } from './mindBodyConfig';

export function getClassesOfWeek(startDate: Date, endDate: Date, hideCanceledClasses: boolean = true, programIds: number = 23) {
  return mindbodyFetch(
    `class/classes?startDateTime=${encodeURIComponent(startDate.toISOString())}&endDateTime=${encodeURIComponent(endDate.toISOString())}&hideCanceledClasses=${hideCanceledClasses }&programIds=${programIds}`,
    {}
  );
}

export async function addClientToClass(
  classId: number,
  clientId: string
) {
  const body = {
    ClientId: clientId,
    ClassId: classId,
    RequirePayment: false,
    SendEmail: true,
    Test: false,
    Waitlist: false,
    CrossRegionalBooking: false
  };

  return await mindbodyFetch('/class/addclienttoclass', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  }, 'POST');
}       

export async function cancelClientFromClass(classId: number, clientId: string) {
  return mindbodyFetch(
    `/class/removeclientfromclass`,
    {
      method: 'POST',
      body: JSON.stringify({ ClassId: classId, ClientId: clientId }),
      headers: { 'Content-Type': 'application/json' },
    },
    'POST'
  );
}
