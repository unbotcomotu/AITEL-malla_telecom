import React from 'react';
import { useNavigate } from 'react-router-dom';
import AitelLogo from './AitelLogo';

const Sidebar = ({ isOpen, onClose, user, currentPath }) => {
  const navigate = useNavigate();

  const menuItems = [
    // Items para estudiantes
    ...(user?.role !== 'admin' ? [
      { path: '/curriculum', label: 'Malla Curricular', icon: '🗺️' },
      { path: '/catalog', label: 'Catálogo de Cursos', icon: '📚' },
      { path: '/history', label: 'Historial Académico', icon: '📅' },
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
          className="fixed inset-0 z-[998] bg-black/50"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-[999] flex h-screen w-[280px] flex-col border-r border-line bg-surface-2 text-ink transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del sidebar */}
        <div className="border-b border-line px-6 py-6">
          <div className="flex items-center gap-3">
            <AitelLogo className="h-10 w-auto" />
            <div>
              <div className="font-display text-lg font-bold leading-tight">
                Matricula<span className="text-accent">TEL</span>
              </div>
              <div className="mt-1 text-sm text-muted">
                {user?.role === 'admin' ? 'Administrador' : 'Estudiante'}
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex w-full items-center gap-3 px-6 py-4 text-left text-base transition-colors ${
                  active
                    ? 'bg-accent font-medium text-ink-on-accent'
                    : 'text-muted hover:bg-accent/10 hover:text-ink'
                }`}
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
