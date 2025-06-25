import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('calendar_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('calendar_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored users
      const storedUsers = JSON.parse(localStorage.getItem('calendar_users') || '[]');
      const user = storedUsers.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        toast.error('Invalid email or password');
        return false;
      }

      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      };

      setUser(userData);
      localStorage.setItem('calendar_user', JSON.stringify(userData));
      toast.success(`Welcome back, ${user.name}!`);
      
      console.log(`[AUTH] User logged in: ${user.name} (${user.email})`);
      return true;
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored users
      const storedUsers = JSON.parse(localStorage.getItem('calendar_users') || '[]');
      
      // Check if user already exists
      if (storedUsers.find((u: any) => u.email === email)) {
        toast.error('User already exists with this email');
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff`
      };

      // Store user
      storedUsers.push(newUser);
      localStorage.setItem('calendar_users', JSON.stringify(storedUsers));

      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar
      };

      setUser(userData);
      localStorage.setItem('calendar_user', JSON.stringify(userData));
      toast.success(`Welcome to Calendar, ${name}!`);
      
      console.log(`[AUTH] New user registered: ${name} (${email})`);
      return true;
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('calendar_user');
    toast.success('Logged out successfully');
    console.log('[AUTH] User logged out');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};