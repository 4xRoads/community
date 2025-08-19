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
  getShifts: () => [], 
  getDrivers: () => [],
  getTickets: () => [],
  createTicket: () => {},
  updateTicket: () => {},
  deleteTicket: () => {}
};
