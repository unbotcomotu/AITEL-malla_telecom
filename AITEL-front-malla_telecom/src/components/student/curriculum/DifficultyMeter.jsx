import React from 'react';

// Los tramos y las caritas los decide el backend (campo `level`), para que la
// regla viva en un solo sitio. Aqui solo se traduce a imagen y color.
const LEVELS = {
  EASY: { img: '/dificultad/easy.png', label: 'Fácil', className: 'text-good' },
  MEDIUM: { img: '/dificultad/medium.png', label: 'Medio', className: 'text-accent' },
  HARD: { img: '/dificultad/hard.png', label: 'Difícil', className: 'text-warn' },
  VERY_HARD: { img: '/dificultad/very-hard.png', label: 'Muy difícil', className: 'text-bad' },
};

// Escala de voto: 1-5. Se muestran las 4 caritas como referencia visual de los
// tramos, pero el voto es un numero, no un tramo.
const SCALE = [1, 2, 3, 4, 5];

const DifficultyMeter = ({ summary, canInteract, loading, onRate }) => {
  const level = summary?.level ? LEVELS[summary.level] : null;
  const average = summary?.average || 0;
  const count = summary?.count || 0;
  const myRating = summary?.myRating || 0;

  return (
    <div className="mb-6 rounded-xl bg-surface-2 p-4">
      <h3 className="m-0 mb-3 text-base font-semibold text-ink">😰 Dificultad del Curso</h3>

      {count > 0 && level ? (
        <div className="mb-4 flex items-center gap-4">
          <img
            src={level.img}
            alt={level.label}
            className="h-16 w-16 shrink-0 select-none"
            draggable="false"
          />
          <div>
            <div className={`text-lg font-bold ${level.className}`}>{level.label}</div>
            <div className="text-sm text-muted">
              {average.toFixed(1)}/5.0 &middot; {count} {count === 1 ? 'voto' : 'votos'}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-line bg-bg p-3">
          <span className="text-2xl">🤷</span>
          <p className="m-0 text-sm text-muted">
            Nadie ha calificado la dificultad todavía.
            {canInteract && ' ¡Sé el primero!'}
          </p>
        </div>
      )}

      <div className="border-t border-line pt-3">
        <div className="mb-2 text-xs font-medium text-muted">
          {canInteract
            ? myRating > 0 ? `Tu voto: ${myRating}/5` : '¿Qué tan difícil te pareció?'
            : 'Aprueba el curso para poder votar'}
        </div>

        <div className="flex items-center gap-2">
          {SCALE.map((value) => (
            <button
              key={value}
              type="button"
              disabled={!canInteract || loading}
              onClick={() => onRate(value)}
              aria-label={`Calificar dificultad ${value} de 5`}
              className={`h-9 w-9 rounded-lg border-2 text-sm font-bold transition-transform ${
                myRating === value
                  ? 'border-accent bg-accent text-ink-on-accent'
                  : 'border-line bg-bg text-muted'
              } ${canInteract && !loading ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'}`}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Referencia de los tramos, para que el numero tenga significado */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {Object.entries(LEVELS).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5" title={cfg.label}>
              <img src={cfg.img} alt="" aria-hidden="true" className="h-5 w-5 select-none opacity-80" draggable="false" />
              <span className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DifficultyMeter;
