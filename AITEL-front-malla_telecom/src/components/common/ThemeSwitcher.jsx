import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PREVIEW_COLORS = {
  senal: '#1979C3',
  bitacora: '#E8A94A',
  cuaderno: '#33538C',
};

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
      {themes.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setTheme(option.id)}
          title={option.hint}
          aria-pressed={theme === option.id}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            theme === option.id
              ? 'bg-accent text-ink-on-accent'
              : 'text-muted hover:text-ink'
          }`}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: PREVIEW_COLORS[option.id] }}
            aria-hidden="true"
          />
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
