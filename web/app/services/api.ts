export type Shift = { id: string; driver: string; };
export type Driver = { id: string; name: string; };
export type PayoutRequest = { id: string; amount: number; };
export type Notification = { id: string; message: string; };
export const apiService = { getShifts: () => [], getDrivers: () => [] };
