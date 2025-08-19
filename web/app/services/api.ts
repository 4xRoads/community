export type Shift = { 
  id: string; 
  driver: string; 
  route?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
};

export type Driver = { 
  id: string; 
  name: string; 
  phone?: string;
  email?: string;
  status?: string;
};

export type PayoutRequest = { 
  id: string; 
  amount: number;
  driver?: string;
  status?: string;
  date?: string;
};

export type Notification = { 
  id: string; 
  message: string;
  type?: string;
  read?: boolean;
  timestamp?: string;
};

export const apiService = { 
  getShifts: async (accessToken?: string | null) => {
    return { success: true, data: { shifts: [] } };
  },
  getDrivers: async (accessToken?: string | null) => {
    return { success: true, data: { drivers: [] } };
  },
  getTickets: async (accessToken?: string | null) => {
    return { success: true, data: { tickets: [] } };
  },
  getNotifications: async (accessToken?: string | null) => {
    return { success: true, data: { notifications: [] } };
  },
  getPayoutRequests: async (accessToken?: string | null) => {
    return { success: true, data: { payoutRequests: [] } };
  },
  createTicket: async (data: unknown, accessToken?: string | null) => {
    return { success: true, data: {} };
  },
  updateTicket: async (id: string, data: unknown, accessToken?: string | null) => {
    return { success: true, data: {} };
  },
  deleteTicket: async (id: string, accessToken?: string | null) => {
    return { success: true, data: {} };
  }
};
