import React, { useState, useEffect } from 'react';
import { ProfessorApi } from '../../services/admin/professorApi';

const INPUT_CLASS = 'w-full rounded-lg border bg-bg px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-good disabled:cursor-not-allowed disabled:opacity-60';
const LABEL_CLASS = 'mb-2 block text-sm font-medium text-ink';

const ProfessorManagement = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);

  const loadProfessors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProfessorApi.getAllProfessors();
      setProfessors(data);
    } catch (err) {
      setError(`Error al cargar profesores: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessors();
  }, []);

  const handleCreateProfessor = async (professorData) => {
    setLoading(true);
    setError(null);
    try {
      const newProfessor = await ProfessorApi.createProfessor(professorData);
      setProfessors([...professors, newProfessor]);
      setShowModal(false);
    } catch (err) {
      setError(`Error al crear profesor: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfessor = async (id, professorData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProfessor = await ProfessorApi.updateProfessor(id, professorData);
      setProfessors(professors.map(p => (p.id === id ? updatedProfessor : p)));
      setShowModal(false);
      setEditingProfessor(null);
    } catch (err) {
      setError(`Error al actualizar profesor: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfessor = async (professorData) => {
    if (editingProfessor) {
      await handleUpdateProfessor(editingProfessor.id, professorData);
    } else {
      await handleCreateProfessor(professorData);
    }
  };

  const handleDeleteProfessor = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este profesor?')) return;

    setLoading(true);
    setError(null);
    try {
      await ProfessorApi.deleteProfessor(id);
      setProfessors(professors.filter(p => p.id !== id));
    } catch (err) {
      setError(`Error al eliminar profesor: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-ink">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="m-0 font-display text-3xl font-bold tracking-tight text-good">👨‍🏫 Gestión de Profesores</h1>

          <button
            onClick={() => { setEditingProfessor(null); setShowModal(true); }}
            disabled={loading}
            className="rounded-lg bg-good px-6 py-3 text-base font-semibold text-ink-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Agregar Profesor
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-bad/40 bg-bad/10 p-4 text-bad">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-lg text-bad">✕</button>
          </div>
        )}

        {loading && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-accent">
            <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-accent/30 border-t-accent" />
            <span>Cargando profesores...</span>
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div
            className="grid gap-4 border-b border-line bg-surface-2 p-5 font-semibold text-ink"
            style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}
          >
            <div>Nombre</div>
            <div>Email</div>
            <div>Código</div>
            <div>Acciones</div>
          </div>

          {professors.map((professor) => (
            <div
              key={professor.id}
              className="grid items-center gap-4 border-b border-line p-5 transition-colors last:border-b-0 hover:bg-good/5"
              style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}
            >
              <div className="text-ink">{professor.fullName}</div>
              <div className="text-muted">{professor.email}</div>
              <div className="text-muted">{professor.studentCode || '—'}</div>
              <div className="flex gap-2">
                <button className="rounded-md bg-accent px-3 py-1.5 text-xs text-ink-on-accent">Ver</button>
                <button
                  onClick={() => { setEditingProfessor(professor); setShowModal(true); }}
                  disabled={loading}
                  className="rounded-md bg-good px-3 py-1.5 text-xs text-ink-on-accent disabled:opacity-60"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteProfessor(professor.id)}
                  disabled={loading}
                  className="rounded-md bg-bad px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProfessorModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProfessor(null); }}
        onSave={handleSaveProfessor}
        professor={editingProfessor}
        loading={loading}
      />
    </div>
  );
};

const ProfessorModal = ({ isOpen, onClose, onSave, professor, loading }) => {
  const [formData, setFormData] = useState({ nombres: '', apellidos: '', correo: '', codigo: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (professor) {
      const [nombres = '', ...resto] = (professor.fullName || '').split(' ');
      setFormData({
        nombres,
        apellidos: resto.join(' '),
        correo: professor.email || '',
        codigo: professor.studentCode || ''
      });
    } else {
      setFormData({ nombres: '', apellidos: '', correo: '', codigo: '' });
    }
    setFormErrors({});
  }, [professor, isOpen]);

  const validateForm = () => {
    const errors = {};
    if (!formData.nombres.trim()) errors.nombres = 'El nombre es requerido';
    if (!formData.apellidos.trim()) errors.apellidos = 'El apellido es requerido';
    if (!formData.correo.trim()) {
      errors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = 'Correo inválido';
    }
    if (!formData.codigo.trim()) errors.codigo = 'El código es requerido';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-surface p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="m-0 font-display text-2xl font-bold text-good">
            {professor ? '✏️ Editar Profesor' : '➕ Agregar Profesor'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-2xl text-muted transition-colors hover:text-bad disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className={LABEL_CLASS}>Nombres *</label>
            <input
              type="text" name="nombres" value={formData.nombres} onChange={handleChange} disabled={loading}
              placeholder="Ej: Carlos"
              className={`${INPUT_CLASS} ${formErrors.nombres ? 'border-bad' : 'border-line'}`}
            />
            {formErrors.nombres && <span className="mt-1 block text-xs text-bad">{formErrors.nombres}</span>}
          </div>

          <div className="mb-5">
            <label className={LABEL_CLASS}>Apellidos *</label>
            <input
              type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} disabled={loading}
              placeholder="Ej: López"
              className={`${INPUT_CLASS} ${formErrors.apellidos ? 'border-bad' : 'border-line'}`}
            />
            {formErrors.apellidos && <span className="mt-1 block text-xs text-bad">{formErrors.apellidos}</span>}
          </div>

          <div className="mb-5">
            <label className={LABEL_CLASS}>Correo Institucional *</label>
            <input
              type="email" name="correo" value={formData.correo} onChange={handleChange} disabled={loading}
              placeholder="ejemplo@pucp.edu.pe"
              className={`${INPUT_CLASS} ${formErrors.correo ? 'border-bad' : 'border-line'}`}
            />
            {formErrors.correo && <span className="mt-1 block text-xs text-bad">{formErrors.correo}</span>}
          </div>

          <div className="mb-6">
            <label className={LABEL_CLASS}>Código *</label>
            <input
              type="text" name="codigo" value={formData.codigo} onChange={handleChange} disabled={loading}
              placeholder="Ej: PROF001"
              className={`${INPUT_CLASS} ${formErrors.codigo ? 'border-bad' : 'border-line'}`}
            />
            {formErrors.codigo && <span className="mt-1 block text-xs text-bad">{formErrors.codigo}</span>}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button" onClick={onClose} disabled={loading}
              className="rounded-lg border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-good px-6 py-3 text-sm font-semibold text-ink-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-on-accent/30 border-t-ink-on-accent" />}
              {loading ? 'Guardando...' : professor ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessorManagement;
