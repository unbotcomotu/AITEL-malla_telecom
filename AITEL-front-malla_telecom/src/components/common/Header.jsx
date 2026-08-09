import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import AitelLogo from './AitelLogo';

const Header = ({ user, onMenuClick, onLogout }) => {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-6 py-4 text-ink">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="rounded-md p-2 text-muted transition-colors hover:bg-bg hover:text-ink"
        >
          ☰
        </button>

        <div className="flex items-center gap-2.5">
          <AitelLogo className="h-8 w-auto" />
          <h1 className="m-0 font-display text-xl font-bold tracking-tight">
            Matricula<span className="text-accent">TEL</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />

        <span className="hidden text-sm text-muted sm:inline">
          Hola, {user?.fullName || user?.email}
        </span>

        <button
          onClick={onLogout}
          className="rounded-md border border-bad/40 bg-bad/10 px-4 py-2 text-sm text-bad transition-colors hover:border-bad hover:bg-bad/20"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Header;
