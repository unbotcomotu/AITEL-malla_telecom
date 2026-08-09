import React, { useState, useEffect } from 'react';
import { SemestersApi } from '../../services/admin/semestersApi';

const INPUT_CLASS = 'w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-accent';

// Mismo orden cronológico que usa el registro de cursos del alumno: el verano
// (-0) va enero-febrero, al INICIO del año (2024-0 → 2024-1 → 2024-2), que es
// el orden numérico natural del ciclo.
const semesterOrderKey = (semester) => {
  const [year, cycle] = semester.split('-').map(Number);
  return year * 3 + cycle;
};

const SemesterManagement = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSemester, setNewSemester] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadSemesters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SemestersApi.getAll();
      setSemesters([...data].sort((a, b) => semesterOrderKey(b.semestre) - semesterOrderKey(a.semestre)));
    } catch (err) {
      setError(`Error al cargar semestres: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const activeSemester = semesters.find(s => s.activo);

  const handleCreate = async () => {
    const trimmed = newSemester.trim();
    if (!/^\d{4}-[012]$/.test(trimmed)) {
      setError('El formato debe ser AAAA-C (ej: 2026-1, 2026-2, o 2026-0 para verano)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await SemestersApi.create(trimmed);
      setNewSemester('');
      setShowAddForm(false);
      await loadSemesters();
    } catch (err) {
      setError(`Error al crear el semestre: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (semester) => {
    const confirmado = window.confirm(
      `¿Marcar "${semester.semestre}" como el semestre académico actual?\n\n` +
      `Esto afecta a todos los estudiantes: define qué ciclo ven como "actual" al matricularse y en su historial.`
    );
    if (!confirmado) return;

    setLoading(true);
    setError(null);
    try {
      await SemestersApi.activate(semester.id);
      await loadSemesters();
    } catch (err) {
      setError(`Error al activar el semestre: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-ink">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="m-0 mb-2 font-display text-3xl font-bold tracking-tight text-accent">📅 Gestión de Semestres</h1>
            <p className="m-0 text-base text-muted">
              Define qué semestre es el "actual" — determina el ciclo académico vigente para toda la matrícula
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-ink-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Nuevo Semestre
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-bad/30 bg-bad/10 p-4 text-bad">
            <span>⚠️</span>
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="rounded-md bg-bad/20 px-3 py-1 text-sm font-medium hover:bg-bad/30">✕</button>
          </div>
        )}

        {activeSemester && (
          <div className="mb-6 rounded-xl border border-good/30 bg-good/10 p-5">
            <div className="text-sm text-muted">Semestre actual</div>
            <div className="text-2xl font-bold text-good">⚡ {activeSemester.semestre}</div>
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-accent">✨ Nuevo Semestre</h3>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-sm text-muted">Semestre (formato AAAA-C)</label>
                <input
                  type="text"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  placeholder="Ej: 2026-1"
                  className={INPUT_CLASS}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={loading || !newSemester.trim()}
                className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-ink-on-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Crear
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewSemester(''); setError(null); }}
                className="rounded-lg border border-line px-5 py-3 text-sm text-muted hover:bg-bg"
              >
                Cancelar
              </button>
            </div>
            <p className="m-0 mt-2 text-xs text-muted">
              El "C" es el ciclo: 1 (primer ciclo del año), 2 (segundo ciclo), o 0 (verano).
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {semesters.length === 0 && !loading && (
            <div className="p-10 text-center text-sm text-muted">No hay semestres registrados todavía</div>
          )}

          {semesters.map((semester, index) => (
            <div
              key={semester.id}
              className={`flex items-center justify-between px-6 py-4 ${index > 0 ? 'border-t border-line' : ''} ${semester.activo ? 'bg-good/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-ink">{semester.semestre}</span>
                {semester.activo && (
                  <span className="rounded-full bg-good/20 px-2.5 py-1 text-xs font-semibold text-good">⚡ Actual</span>
                )}
              </div>

              {!semester.activo && (
                <button
                  onClick={() => handleActivate(semester)}
                  disabled={loading}
                  className="rounded-lg bg-good/15 px-4 py-2 text-sm font-semibold text-good transition-colors hover:bg-good/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Marcar como actual
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/30 bg-surface p-6 text-ink">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
            <span className="text-base font-semibold">Procesando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterManagement;
