import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Calendar, Loader2, AlertCircle, CheckCircle, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { toast } from 'sonner@2.0.3'

export function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingDemo, setIsCreatingDemo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'driver' as 'admin' | 'driver'
  })
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  })

  const { signUp, signIn } = useAuth()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await signUp(signUpData.email, signUpData.password, signUpData.name, signUpData.role)
      
      if (result.success) {
        setSuccess('Account created successfully! You can now sign in.')
        toast.success('Account created successfully! You can now sign in.')
        // Reset form
        setSignUpData({ email: '', password: '', name: '', role: 'driver' })
      } else {
        setError(result.error || 'Failed to create account')
        toast.error(result.error || 'Failed to create account')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await signIn(signInData.email, signInData.password)
      
      if (result.success) {
        setSuccess('Signed in successfully!')
        toast.success('Signed in successfully!')
      } else {
        setError(result.error || 'Failed to sign in')
        toast.error(result.error || 'Failed to sign in')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDemoAccounts = async () => {
    setIsCreatingDemo(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('Creating demo accounts...')
      const result = await apiService.createDemoAccounts()
      
      if (result.success) {
        setSuccess('Demo accounts created successfully! You can now sign in with the demo credentials.')
        toast.success('Demo accounts are ready!')
      } else {
        setError(`Failed to create demo accounts: ${result.error}`)
        toast.error(`Failed to create demo accounts: ${result.error}`)
      }
    } catch (error: any) {
      console.error('Demo account creation error:', error)
      // Don't show the error to user, just provide a helpful message
      setSuccess('Demo accounts may already exist. Try signing in with the demo credentials below.')
      toast.success('You can try signing in with the demo credentials!')
    } finally {
      setIsCreatingDemo(false)
    }
  }

  const handleDemoLogin = async (email: string, password: string, role: string) => {
    setSignInData({ email, password })
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log(`Attempting demo ${role} login...`)
      const result = await signIn(email, password)
      
      if (result.success) {
        setSuccess(`Signed in as demo ${role}!`)
        toast.success(`Signed in as demo ${role}!`)
      } else {
        console.error('Demo login failed:', result.error)
        // Don't show detailed error, provide helpful guidance
        setError(`Demo account login failed. Try clicking "Create Demo Accounts" first, then try again.`)
        toast.error('Demo login failed. Try creating demo accounts first.')
      }
    } catch (error: any) {
      console.error('Demo login error:', error)
      setError('Demo login failed. Please try creating the demo accounts first.')
      toast.error('Demo login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">DriverSchedule</h1>
          <p className="text-muted-foreground">Professional driver scheduling platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Demo Accounts
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCreateDemoAccounts}
                    disabled={isLoading || isCreatingDemo}
                  >
                    {isCreatingDemo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Settings className="w-4 h-4 mr-2" />
                    Create Demo Accounts
                  </Button>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDemoLogin('admin@example.com', 'password123', 'admin')}
                      disabled={isLoading || isCreatingDemo}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Demo Admin Account
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDemoLogin('driver@example.com', 'password123', 'driver')}
                      disabled={isLoading || isCreatingDemo}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Demo Driver Account
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                  <p><strong>Demo Credentials:</strong></p>
                  <p>Admin: admin@example.com / password123</p>
                  <p>Driver: driver@example.com / password123</p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Click "Create Demo Accounts" first if you're having login issues.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Account Type</Label>
                    <Select value={signUpData.role} onValueChange={(value: 'admin' | 'driver') => setSignUpData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger id="signup-role">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
