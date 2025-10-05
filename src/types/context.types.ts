import { ReactNode } from 'react';
import { User } from './entities.types';

// Context Types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// Hook Types
export interface UseToastReturn {
  toast: (props: UseToastProps) => void;
  dismiss: (toastId?: string) => void;
}

export interface UseToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: ReactNode;
}
