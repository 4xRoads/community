"use client";

export type Ticket = { 
  id: string; 
  title?: string;
  customer?: string;
  location?: string;
  contact?: string;
  category?: string;
  priority?: string;
  dateRequested?: string;
  expectedResolutionDate?: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  route?: string;
  shift?: string;
  driver?: string;
  vehicle?: string;
};

export function TicketList() {
  return <div><h2>Ticket List</h2></div>;
}
