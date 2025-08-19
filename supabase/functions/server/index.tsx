import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Simple CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Simple logging middleware
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`)
  await next()
})

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper function to verify user
const verifyUser = async (authHeader: string | null) => {
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Invalid authorization header' }
  }
  
  const token = authHeader.split(' ')[1]
  
  // Handle public anon key (for health checks)
  if (token === Deno.env.get('SUPABASE_ANON_KEY')) {
    return { user: null, error: 'Public access' }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return { user: null, error: 'Unauthorized' }
  }
  
  return { user, error: null }
}

// Create demo accounts function with better error handling
const createDemoAccounts = async () => {
  try {
    console.log('Creating demo accounts...')
    let adminUserId = null
    let driverUserId = null
    
    // Handle admin account
    try {
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@example.com',
        password: 'password123',
        user_metadata: { name: 'Demo Admin', role: 'admin' },
        email_confirm: true
      })
      
      if (adminError) {
        if (adminError.message.includes('already registered') || adminError.code === 'email_exists') {
          console.log('Admin account already exists, finding existing user...')
          // Get existing user ID
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingAdmin = existingUsers?.users?.find(u => u.email === 'admin@example.com')
          if (existingAdmin) {
            adminUserId = existingAdmin.id
            console.log('Found existing admin user:', adminUserId)
          }
        } else {
          console.error('Admin creation error:', adminError)
        }
      } else if (adminData.user) {
        adminUserId = adminData.user.id
        console.log('Created new admin account:', adminUserId)
      }
    } catch (error) {
      console.error('Error handling admin account:', error)
    }
    
    // Handle driver account
    try {
      const { data: driverData, error: driverError } = await supabase.auth.admin.createUser({
        email: 'driver@example.com',
        password: 'password123',
        user_metadata: { name: 'Demo Driver', role: 'driver' },
        email_confirm: true
      })
      
      if (driverError) {
        if (driverError.message.includes('already registered') || driverError.code === 'email_exists') {
          console.log('Driver account already exists, finding existing user...')
          // Get existing user ID
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingDriver = existingUsers?.users?.find(u => u.email === 'driver@example.com')
          if (existingDriver) {
            driverUserId = existingDriver.id
            console.log('Found existing driver user:', driverUserId)
          }
        } else {
          console.error('Driver creation error:', driverError)
        }
      } else if (driverData.user) {
        driverUserId = driverData.user.id
        console.log('Created new driver account:', driverUserId)
      }
    } catch (error) {
      console.error('Error handling driver account:', error)
    }
    
    // Store user data in KV if we have valid IDs
    if (adminUserId) {
      const adminUserData = {
        id: adminUserId,
        email: 'admin@example.com',
        name: 'Demo Admin',
        role: 'admin',
        qualifications: [],
        created_at: new Date().toISOString()
      }
      await kv.set(`user:${adminUserId}`, adminUserData)
      await kv.set('demo:admin@example.com', adminUserId)
      console.log('Stored admin user data')
    }
    
    if (driverUserId) {
      const driverUserData = {
        id: driverUserId,
        email: 'driver@example.com',
        name: 'Demo Driver',
        role: 'driver',
        qualifications: ['CDL-A', 'Passenger'],
        created_at: new Date().toISOString()
      }
      await kv.set(`user:${driverUserId}`, driverUserData)
      await kv.set('demo:driver@example.com', driverUserId)
      console.log('Stored driver user data')
      
      // Create demo shifts if they don't exist
      const existingShifts = await kv.getByPrefix('shift:')
      if (existingShifts.length === 0) {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        const demoShifts = [
          {
            id: 'shift:demo1',
            driverName: 'Demo Driver',
            driver: driverUserId,
            route: 'Route A - Downtown',
            date: today.toISOString().split('T')[0],
            startTime: '06:00',
            endTime: '14:00',
            vehicle: 'Bus #101',
            status: 'confirmed',
            qualifications: ['CDL-A', 'Passenger'],
            backupDriver: 'Demo Admin',
            hoursWorked: 8,
            created_at: new Date().toISOString(),
            created_by: 'system'
          },
          {
            id: 'shift:demo2',
            driverName: 'Unassigned',
            driver: 'unassigned',
            route: 'Route B - Airport',
            date: tomorrow.toISOString().split('T')[0],
            startTime: '14:00',
            endTime: '22:00',
            vehicle: 'Bus #102',
            status: 'pending',
            qualifications: ['CDL-B'],
            backupDriver: '',
            hoursWorked: 8,
            created_at: new Date().toISOString(),
            created_by: 'system'
          }
        ]
        
        for (const shift of demoShifts) {
          await kv.set(shift.id, shift)
        }
        console.log('Demo shifts created')
      }
    }
    
    const message = (adminUserId && driverUserId) 
      ? 'Demo accounts are ready'
      : 'Demo accounts partially ready - some accounts may already exist'
    
    return { success: true, message, adminUserId, driverUserId }
  } catch (error) {
    console.error('Error creating demo accounts:', error)
    return { success: false, error: error.message }
  }
}

// Initialize demo accounts on startup
setTimeout(() => {
  createDemoAccounts().then(result => {
    console.log('Demo account initialization:', result.success ? 'SUCCESS' : 'FAILED', result.message)
  })
}, 2000)

// Health check
app.get('/make-server-66cf8c6c/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Create demo accounts endpoint
app.post('/make-server-66cf8c6c/auth/create-demo', async (c) => {
  try {
    const result = await createDemoAccounts()
    
    if (result.success) {
      return c.json({ 
        success: true, 
        message: result.message,
        accounts: {
          admin: 'admin@example.com',
          driver: 'driver@example.com'
        }
      })
    } else {
      return c.json({ success: false, error: result.error }, 500)
    }
  } catch (error) {
    console.log('Create demo error:', error)
    return c.json({ success: false, error: 'Failed to create demo accounts' }, 500)
  }
})

// Auth Routes
app.get('/make-server-66cf8c6c/auth/me', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Get user data from KV store
    let userData = await kv.get(`user:${user.id}`)
    if (!userData) {
      // Fallback to creating user data from auth metadata
      userData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'User',
        role: user.user_metadata?.role || 'driver',
        qualifications: user.user_metadata?.qualifications || [],
        created_at: new Date().toISOString()
      }
      await kv.set(`user:${user.id}`, userData)
    }
    
    return c.json({ user: userData })
  } catch (error) {
    console.log('Get user error:', error)
    return c.json({ error: 'Failed to get user data' }, 500)
  }
})

app.post('/make-server-66cf8c6c/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'driver' } = await c.req.json()
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store additional user data in KV store
    const userData = {
      id: data.user.id,
      email,
      name,
      role,
      qualifications: [],
      created_at: new Date().toISOString()
    }
    
    await kv.set(`user:${data.user.id}`, userData)

    return c.json({ user: data.user, message: 'User created successfully' })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Shift Management Routes
app.get('/make-server-66cf8c6c/shifts', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const shifts = await kv.getByPrefix('shift:')
    return c.json({ shifts })
  } catch (error) {
    console.log('Get shifts error:', error)
    return c.json({ error: 'Failed to fetch shifts' }, 500)
  }
})

app.post('/make-server-66cf8c6c/shifts', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const userData = await kv.get(`user:${user.id}`)
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const shiftData = await c.req.json()
    const shiftId = `shift:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const shift = {
      id: shiftId,
      ...shiftData,
      status: shiftData.status || 'scheduled',
      created_at: new Date().toISOString(),
      created_by: user.id
    }

    await kv.set(shiftId, shift)

    return c.json({ shift, message: 'Shift created successfully' })
  } catch (error) {
    console.log('Create shift error:', error)
    return c.json({ error: 'Failed to create shift' }, 500)
  }
})

app.put('/make-server-66cf8c6c/shifts/:id', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const shiftId = c.req.param('id')
    const updateData = await c.req.json()
    
    const existingShift = await kv.get(shiftId)
    if (!existingShift) {
      return c.json({ error: 'Shift not found' }, 404)
    }

    const updatedShift = {
      ...existingShift,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    }

    await kv.set(shiftId, updatedShift)

    return c.json({ shift: updatedShift, message: 'Shift updated successfully' })
  } catch (error) {
    console.log('Update shift error:', error)
    return c.json({ error: 'Failed to update shift' }, 500)
  }
})

app.delete('/make-server-66cf8c6c/shifts/:id', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const userData = await kv.get(`user:${user.id}`)
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const shiftId = c.req.param('id')
    await kv.del(shiftId)

    return c.json({ message: 'Shift deleted successfully' })
  } catch (error) {
    console.log('Delete shift error:', error)
    return c.json({ error: 'Failed to delete shift' }, 500)
  }
})

// Driver Routes
app.get('/make-server-66cf8c6c/drivers', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const allUsers = await kv.getByPrefix('user:')
    const drivers = allUsers.filter(user => user.role === 'driver')
    
    return c.json({ drivers })
  } catch (error) {
    console.log('Get drivers error:', error)
    return c.json({ error: 'Failed to fetch drivers' }, 500)
  }
})

// Payroll Routes
app.post('/make-server-66cf8c6c/payroll/request', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const { amount, hours } = await c.req.json()
    
    const payoutId = `payout:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const payout = {
      id: payoutId,
      driver_id: user.id,
      amount,
      hours,
      status: 'pending',
      requested_at: new Date().toISOString()
    }

    await kv.set(payoutId, payout)

    return c.json({ payout, message: 'Payout requested successfully' })
  } catch (error) {
    console.log('Payout request error:', error)
    return c.json({ error: 'Failed to request payout' }, 500)
  }
})

app.get('/make-server-66cf8c6c/payroll/requests', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const userData = await kv.get(`user:${user.id}`)
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const payouts = await kv.getByPrefix('payout:')
    return c.json({ payouts })
  } catch (error) {
    console.log('Get payout requests error:', error)
    return c.json({ error: 'Failed to fetch payout requests' }, 500)
  }
})

app.put('/make-server-66cf8c6c/payroll/approve/:id', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const userData = await kv.get(`user:${user.id}`)
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const payoutId = c.req.param('id')
    const payout = await kv.get(payoutId)
    
    if (!payout) {
      return c.json({ error: 'Payout request not found' }, 404)
    }

    const updatedPayout = {
      ...payout,
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id
    }

    await kv.set(payoutId, updatedPayout)

    return c.json({ payout: updatedPayout, message: 'Payout approved successfully' })
  } catch (error) {
    console.log('Approve payout error:', error)
    return c.json({ error: 'Failed to approve payout' }, 500)
  }
})

// Notification Routes
app.get('/make-server-66cf8c6c/notifications/:userId', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const userId = c.req.param('userId')
    const notifications = await kv.getByPrefix(`notification:${userId}:`)
    
    return c.json({ notifications })
  } catch (error) {
    console.log('Get notifications error:', error)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
})

app.post('/make-server-66cf8c6c/notifications', async (c) => {
  try {
    const { user, error: authError } = await verifyUser(c.req.header('Authorization'))
    if (authError) return c.json({ error: authError }, 401)

    const { recipient_id, title, message, type = 'info' } = await c.req.json()
    
    const notificationId = `notification:${recipient_id}:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const notification = {
      id: notificationId,
      recipient_id,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
      created_by: user.id
    }

    await kv.set(notificationId, notification)

    return c.json({ notification, message: 'Notification sent successfully' })
  } catch (error) {
    console.log('Send notification error:', error)
    return c.json({ error: 'Failed to send notification' }, 500)
  }
})

serve(app.fetch)