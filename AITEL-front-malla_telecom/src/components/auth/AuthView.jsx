import React, { useState, useEffect } from 'react';

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    studentCode: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Animación de partículas en el fondo
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 2 + 0.5,
          direction: Math.random() * 360
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    }

    // Validación de contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) {
      // Validaciones adicionales para registro
      if (!formData.fullName) {
        newErrors.fullName = 'El nombre completo es requerido';
      }

      if (!formData.studentCode) {
        newErrors.studentCode = 'El código de estudiante es requerido';
      } else if (!/^\d{8}$/.test(formData.studentCode)) {
        newErrors.studentCode = 'El código debe tener 8 dígitos';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    
    // Aquí iría la lógica real de autenticación
    console.log('Datos del formulario:', formData);
    alert(isLogin ? '¡Inicio de sesión exitoso!' : '¡Registro exitoso!');
  };

  const toggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        studentCode: '',
        acceptTerms: false
      });
      setErrors({});
      setIsAnimating(false);
    }, 300);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Simular autenticación con Google
    setTimeout(() => {
      setIsLoading(false);
      alert('Autenticación con Google exitosa!');
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Partículas animadas de fondo */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              borderRadius: '50%',
              opacity: particle.opacity,
              animation: `float ${particle.speed + 3}s ease-in-out infinite`,
              transform: `rotate(${particle.direction}deg)`
            }}
          />
        ))}
      </div>

      {/* Contenedor principal */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header con logo y título */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎓
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px 0'
          }}>
            Malla Curricular
          </h1>
          <p style={{
            color: '#cbd5e1',
            fontSize: '16px',
            margin: 0
          }}>
            Ingeniería de Telecomunicaciones - PUCP
          </p>
        </div>

        {/* Tarjeta principal */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.1)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Indicador de modo */}
          <div style={{
            display: 'flex',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '16px',
            margin: '20px',
            padding: '4px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              width: '50%',
              height: '100%',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              borderRadius: '12px',
              transform: `translateX(${isLogin ? '0%' : '100%'})`,
              transition: 'transform 0.3s ease',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
            }} />
            <button
              onClick={toggleMode}
              disabled={isAnimating}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: isLogin ? 'white' : '#94a3b8',
                fontWeight: '600',
                fontSize: '14px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                position: 'relative',
                zIndex: 1
              }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={toggleMode}
              disabled={isAnimating}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: !isLogin ? 'white' : '#94a3b8',
                fontWeight: '600',
                fontSize: '14px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                position: 'relative',
                zIndex: 1
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Formulario */}
          <div style={{
            padding: '0 24px 24px 24px',
            transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
            opacity: isAnimating ? 0.5 : 1,
            transition: 'all 0.3s ease'
          }}>
            <div onSubmit={handleSubmit}>
              {/* Nombre completo (solo en registro) */}
              {!isLogin && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#67e8f9',
                    marginBottom: '8px'
                  }}>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${errors.fullName ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}`,
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Juan Pérez García"
                    onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                    onBlur={(e) => e.target.style.borderColor = errors.fullName ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}
                  />
                  {errors.fullName && (
                    <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}

              {/* Código de estudiante (solo en registro) */}
              {!isLogin && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#67e8f9',
                    marginBottom: '8px'
                  }}>
                    Código de Estudiante
                  </label>
                  <input
                    type="text"
                    name="studentCode"
                    value={formData.studentCode}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${errors.studentCode ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}`,
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="20201234"
                    maxLength="8"
                    onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                    onBlur={(e) => e.target.style.borderColor = errors.studentCode ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}
                  />
                  {errors.studentCode && (
                    <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                      {errors.studentCode}
                    </p>
                  )}
                </div>
              )}

              {/* Correo electrónico */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#67e8f9',
                  marginBottom: '8px'
                }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `2px solid ${errors.email ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}`,
                    background: 'rgba(30, 41, 59, 0.6)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  placeholder="estudiante@pucp.edu.pe"
                  onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                  onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}
                />
                {errors.email && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#67e8f9',
                  marginBottom: '8px'
                }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '14px 50px 14px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${errors.password ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}`,
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="••••••••"
                    onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                    onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmar contraseña (solo en registro) */}
              {!isLogin && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#67e8f9',
                    marginBottom: '8px'
                  }}>
                    Confirmar Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '14px 50px 14px 16px',
                        borderRadius: '12px',
                        border: `2px solid ${errors.confirmPassword ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}`,
                        background: 'rgba(30, 41, 59, 0.6)',
                        color: 'white',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      placeholder="••••••••"
                      onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                      onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Términos y condiciones (solo en registro) */}
              {!isLogin && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#cbd5e1'
                  }}>
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '12px',
                        accent: '#06b6d4'
                      }}
                    />
                    Acepto los{' '}
                    <span style={{ color: '#06b6d4', textDecoration: 'underline', marginLeft: '4px' }}>
                      términos y condiciones
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 30px' }}>
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>
              )}

              {/* Botón principal */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isLoading 
                    ? '#64748b' 
                    : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.background = 'linear-gradient(135deg, #0891b2, #2563eb)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 32px rgba(6, 182, 212, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.background = 'linear-gradient(135deg, #06b6d4, #3b82f6)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 24px rgba(6, 182, 212, 0.4)';
                  }
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Procesando...
                  </div>
                ) : (
                  `${isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'} 🚀`
                )}
              </button>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '24px 0',
                gap: '16px'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.3)' }} />
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>o</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.3)' }} />
              </div>

              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid rgba(148, 163, 184, 0.3)',
                  background: 'rgba(30, 41, 59, 0.6)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.borderColor = '#06b6d4';
                    e.target.style.background = 'rgba(6, 182, 212, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                    e.target.style.background = 'rgba(30, 41, 59, 0.6)';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>🚀</span>
                Continuar con Google
              </button>

              {/* Enlace adicional */}
              {isLogin && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#06b6d4',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={() => alert('Función de recuperación de contraseña')}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para animaciones */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(120deg); }
            66% { transform: translateY(5px) rotate(240deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AuthView;