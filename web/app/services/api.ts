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

export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export const apiService = { 
  getShifts: async (accessToken?: string | null): Promise<ApiResponse<{ shifts: Shift[] }>> => {
    try {
      return { success: true, data: { shifts: [] } };
    } catch (error) {
      return { success: false, error: 'Failed to fetch shifts' };
    }
  },
  getDrivers: async (accessToken?: string | null): Promise<ApiResponse<{ drivers: Driver[] }>> => {
    try {
      return { success: true, data: { drivers: [] } };
    } catch (error) {
      return { success: false, error: 'Failed to fetch drivers' };
    }
  },
  getTickets: async (accessToken?: string | null): Promise<ApiResponse<{ tickets: any[] }>> => {
    try {
      return { success: true, data: { tickets: [] } };
    } catch (error) {
      return { success: false, error: 'Failed to fetch tickets' };
    }
  },
  getNotifications: async (accessToken?: string | null): Promise<ApiResponse<{ notifications: Notification[] }>> => {
    try {
      return { success: true, data: { notifications: [] } };
    } catch (error) {
      return { success: false, error: 'Failed to fetch notifications' };
    }
  },
  getPayoutRequests: async (accessToken?: string | null): Promise<ApiResponse<{ payoutRequests: PayoutRequest[] }>> => {
    try {
      return { success: true, data: { payoutRequests: [] } };
    } catch (error) {
      return { success: false, error: 'Failed to fetch payout requests' };
    }
  },
  createTicket: async (data: unknown, accessToken?: string | null): Promise<ApiResponse<{}>> => {
    try {
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: 'Failed to create ticket' };
    }
  },
  updateTicket: async (id: string, data: unknown, accessToken?: string | null): Promise<ApiResponse<{}>> => {
    try {
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: 'Failed to update ticket' };
    }
  },
  deleteTicket: async (id: string, accessToken?: string | null): Promise<ApiResponse<{}>> => {
    try {
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: 'Failed to delete ticket' };
    }
  }
};
