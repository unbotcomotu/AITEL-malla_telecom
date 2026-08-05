import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, user, currentPath }) => {
  const navigate = useNavigate();

  const menuItems = [
    // Items para estudiantes
    ...(user?.role !== 'admin' ? [
      { path: '/curriculum', label: 'Malla Curricular', icon: '🗺️' },
      { path: '/catalog', label: 'Catálogo de Cursos', icon: '📚' }, // ← NUEVO
      { path: '/history', label: 'Historial Académico', icon: '📅' }, // ← NUEVO
      { path: '/onboarding', label: 'Configurar Cursos', icon: '⚙️' }
    ] : []),
    
    // Items para administradores
    ...(user?.role === 'admin' ? [
      { path: '/admin', label: 'Panel Admin', icon: '👨‍💼' },
      { path: '/admin/system', label: 'Sistema de Cursos', icon: '🎓' },
      { path: '/admin/professors', label: 'Gestionar Profesores', icon: '👨‍🏫' }
    ] : [])
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
        />
      )}
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '280px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        transform: `translateX(${isOpen ? '0' : '-100%'})`,
        transition: 'transform 0.3s ease',
        zIndex: 999,
        borderRight: '1px solid rgba(148, 163, 184, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        color: 'white'
      }}>
        {/* Header del sidebar */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎓 Navegación
          </div>
          
          <div style={{
            fontSize: '14px',
            color: '#94a3b8',
            marginTop: '8px'
          }}>
            {user?.role === 'admin' ? 'Administrador' : 'Estudiante'}
          </div>
        </div>

        {/* Menu items */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              style={{
                width: '100%',
                padding: '16px 24px',
                border: 'none',
                background: currentPath === item.path 
                  ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' 
                  : 'transparent',
                color: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentPath !== item.path) {
                  e.target.style.background = 'rgba(6, 182, 212, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPath !== item.path) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;