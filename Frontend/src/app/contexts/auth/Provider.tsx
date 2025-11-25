import { ReactNode, useState, useEffect } from "react";
import { AuthContext, type AuthContextValue, User } from "./context";

// ----------------------------------------------------------------------

const initialState: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificación de autenticación
    const checkAuth = async () => {
      try {
        // Aquí verificarías el token almacenado
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // TEMPORAL: Usuario mock para desarrollo
          // Elimina este bloque cuando implementes el login real
          const mockUser: User = {
            id: "1",
            nombre: "Ricardo Becerra",
            email: "ricardo@example.com",
            rol: "admin",
          };
          setUser(mockUser);
          localStorage.setItem("user", JSON.stringify(mockUser));
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Aquí harías la petición al backend
      // Por ahora, simulamos un usuario
      const mockUser: User = {
        id: "1",
        nombre: "Ricardo Becerra",
        email: email,
        rol: "admin",
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const contextValue: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext value={contextValue}>{children}</AuthContext>;
}
