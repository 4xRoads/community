import { useState } from 'react';

type User = {
  email: string;
  id: string;
} | null;

export function useAuth() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Mock login logic
    setTimeout(() => {
      setUser({ email, id: '1' });
      setAccessToken('mock-token');
      setLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  const signOut = logout; // Alias for logout

  return { 
    user, 
    loading, 
    accessToken, 
    login, 
    logout, 
    signOut 
  };
}
