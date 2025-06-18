
import { mindbodyFetch } from './mindBodyConfig';

export function getClassesOfWeek(startDate: Date, endDate: Date) {
  return mindbodyFetch(
    `class/classes?startDateTime=${encodeURIComponent(startDate.toISOString())}&endDateTime=${encodeURIComponent(endDate.toISOString())}`,
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
