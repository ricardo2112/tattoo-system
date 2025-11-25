import { createSafeContext } from "@/utils/createSafeContext";

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol?: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const [AuthContext, useAuthContext] =
  createSafeContext<AuthContextValue>(
    "useAuthContext must be used within AuthProvider"
  );
