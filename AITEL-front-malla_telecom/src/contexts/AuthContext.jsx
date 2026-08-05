import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// ✅ Mantener useAuth solo aquí
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔧 MODO DESARROLLO - Usuario mock
  const DEV_MODE = true; // Cambiar a false en producción
  
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Iniciando checkAuth, DEV_MODE:', DEV_MODE);
      
      try {
        // 🔧 DESARROLLO: Simular usuario autenticado
        if (DEV_MODE) {
          console.log('🔧 Modo desarrollo activado');
          setTimeout(() => {
            const mockUser = {
              id: 1,
              email: 'admin@pucp.edu.pe', // Cambiar aquí para probar diferentes roles
              fullName: 'Administrador de Prueba',
              studentCode: '20201234',
              role: 'student', // 'admin' o 'student'
              isFirstLogin: false // true para probar onboarding
            };
            console.log('✅ Usuario mock creado:', mockUser);
            setUser(mockUser);
            setLoading(false);
          }, 1000);
          return;
        }

        // Código original de producción
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('❌ Error en checkAuth:', error);
        localStorage.removeItem('authToken');
      } finally {
        if (!DEV_MODE) {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    if (DEV_MODE) {
      const mockUser = {
        id: 1,
        email: credentials.email,
        fullName: 'Usuario de Prueba',
        studentCode: '20201234',
        role: credentials.email.includes('admin') ? 'admin' : 'student',
        isFirstLogin: credentials.email.includes('nuevo')
      };
      
      setUser(mockUser);
      localStorage.setItem('authToken', 'mock-token-123');
      return { success: true };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const register = async (userData) => {
    if (DEV_MODE) {
      const mockUser = {
        id: 1,
        email: userData.email,
        fullName: userData.fullName,
        studentCode: userData.studentCode,
        role: 'student',
        isFirstLogin: true
      };
      
      setUser(mockUser);
      localStorage.setItem('authToken', 'mock-token-123');
      return { success: true };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
