# Layouts del Sistema

Este directorio contiene los layouts principales de la aplicación.

## Layouts Disponibles

### DynamicLayout
Layout completo con header y sidebar. Usado para la mayoría de páginas de la aplicación.

**Características:**
- Header con saludo personalizado y fecha
- Sidebar con navegación lateral
- Área de contenido con padding y max-width

**Uso:** Páginas principales como Dashboard, Clientes, Citas, etc.

### AppLayout
Layout simple solo con header (sin sidebar). Usado para páginas que no requieren navegación lateral.

**Características:**
- Header con saludo personalizado y fecha
- Sin sidebar
- Área de contenido full-width con max-width

**Uso:** Páginas de configuración, perfil, etc.

## Implementación del Login

Actualmente el sistema usa un usuario mock para desarrollo. Para implementar autenticación real:

### 1. Actualizar AuthProvider
Edita `src/app/contexts/auth/Provider.tsx` y:
- Elimina el bloque TEMPORAL en el useEffect (líneas 27-36)
- Implementa la llamada al backend en la función `login`
- Agrega verificación de token JWT

### 2. Activar la ruta de login
Edita `src/app/router/index.tsx` y descomenta las líneas 10-21

### 3. Conectar con el backend
En la función `login` del AuthProvider:
```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    const user = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol
    };

    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', data.token);
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};
```

### 4. Verificar token en checkAuth
```typescript
const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Verificar token con el backend
    const response = await fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.error("Error verificando autenticación:", error);
  } finally {
    setIsLoading(false);
  }
};
```

## Archivos Relacionados

- **AuthGuard**: `src/middleware/AuthGuard.tsx`
- **AuthContext**: `src/app/contexts/auth/context.ts`
- **AuthProvider**: `src/app/contexts/auth/Provider.tsx`
- **Header**: `src/components/template/Header.tsx`
- **Sidebar**: `src/components/template/Sidebar.tsx`
- **Login Page**: `src/app/pages/auth/Login.tsx`
