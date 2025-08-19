import { projectId, publicAnonKey } from '../utils/supabase/info'

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-66cf8c6c`

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface Shift {
  id: string
  driverName: string
  driver: string
  route: string
  date: string
  startTime: string
  endTime: string
  vehicle: string
  status: 'scheduled' | 'confirmed' | 'pending' | 'called-off' | 'completed'
  qualifications: string[]
  backupDriver?: string
  hoursWorked?: number
  created_at: string
  created_by: string
}

interface Driver {
  id: string
  email: string
  name: string
  role: 'driver'
  qualifications: string[]
  created_at: string
}

interface PayoutRequest {
  id: string
  driver_id: string
  amount: number
  hours: number
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  approved_at?: string
  approved_by?: string
}

interface Notification {
  id: string
  recipient_id: string
  title: string
  message: string
  type: 'info' | 'urgent' | 'shift_assignment'
  read: boolean
  created_at: string
  created_by: string
}

class ApiService {
  private getAuthHeaders(accessToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`
    }
    
    return headers
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    accessToken?: string
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`Making API request to: ${BASE_URL}${endpoint}`)
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(accessToken),
          ...options.headers,
        },
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError)
        return { success: false, error: 'Invalid response from server' }
      }

      if (!response.ok) {
        console.error(`API error for ${endpoint}:`, response.status, data)
        return { success: false, error: data.error || `Request failed with status ${response.status}` }
      }

      console.log(`API request successful for ${endpoint}`)
      return { success: true, data }
    } catch (error: any) {
      console.error(`API request error for ${endpoint}:`, error)
      return { success: false, error: error.message || 'Network error' }
    }
  }

  // Auth Management
  async createDemoAccounts(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request('/auth/create-demo', { method: 'POST' })
  }

  // Shift Management
  async getShifts(accessToken: string): Promise<ApiResponse<{ shifts: Shift[] }>> {
    return this.request('/shifts', { method: 'GET' }, accessToken)
  }

  async createShift(shiftData: Partial<Shift>, accessToken: string): Promise<ApiResponse<{ shift: Shift; message: string }>> {
    return this.request('/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData)
    }, accessToken)
  }

  async updateShift(shiftId: string, updateData: Partial<Shift>, accessToken: string): Promise<ApiResponse<{ shift: Shift; message: string }>> {
    return this.request(`/shifts/${shiftId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }, accessToken)
  }

  async deleteShift(shiftId: string, accessToken: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/shifts/${shiftId}`, {
      method: 'DELETE'
    }, accessToken)
  }

  // Driver Management
  async getDrivers(accessToken: string): Promise<ApiResponse<{ drivers: Driver[] }>> {
    return this.request('/drivers', { method: 'GET' }, accessToken)
  }

  // Payroll Management
  async requestPayout(payoutData: { amount: number; hours: number }, accessToken: string): Promise<ApiResponse<{ payout: PayoutRequest; message: string }>> {
    return this.request('/payroll/request', {
      method: 'POST',
      body: JSON.stringify(payoutData)
    }, accessToken)
  }

  async getPayoutRequests(accessToken: string): Promise<ApiResponse<{ payouts: PayoutRequest[] }>> {
    return this.request('/payroll/requests', { method: 'GET' }, accessToken)
  }

  async approvePayout(payoutId: string, accessToken: string): Promise<ApiResponse<{ payout: PayoutRequest; message: string }>> {
    return this.request(`/payroll/approve/${payoutId}`, {
      method: 'PUT'
    }, accessToken)
  }

  // Notifications
  async getNotifications(userId: string, accessToken: string): Promise<ApiResponse<{ notifications: Notification[] }>> {
    return this.request(`/notifications/${userId}`, { method: 'GET' }, accessToken)
  }

  async sendNotification(notificationData: {
    recipient_id: string
    title: string
    message: string
    type?: string
  }, accessToken: string): Promise<ApiResponse<{ notification: Notification; message: string }>> {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    }, accessToken)
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health', { method: 'GET' })
  }
}

export const apiService = new ApiService()

// Export types for use in components
export type { Shift, Driver, PayoutRequest, Notification }