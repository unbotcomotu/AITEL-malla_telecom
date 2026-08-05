import React, { useState, useEffect } from 'react';

import { ProfessorApi } from '../../services/admin/professorApi';
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
      setProfessors(professors.map(p => p.id === id ? updatedProfessor : p));
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
      // Actualizar profesor existente
      await handleUpdateProfessor(editingProfessor.id, professorData);
    } else {
      // Crear nuevo profesor
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
    <div style={{
      padding: '24px',
      color: 'white',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #10b981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            👨‍🏫 Gestión de Profesores
          </h1>
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} style={{
                background: 'transparent',
                border: 'none',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: '18px'
              }}>✕</button>
            </div>
          )}
          <button 
            onClick={() => {
              setEditingProfessor(null);
              setShowModal(true);
            }}
            disabled={loading}
            style={{
            
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              opacity: loading ? '0.6' : '1',
              cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            + Agregar Profesor
          </button>
        </div>
        {loading && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: 'rgba(6, 182, 212, 0.2)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '12px',
            color: '#67e8f9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '3px solid rgba(6, 182, 212, 0.3)',
              borderTopColor: '#06b6d4',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span>Cargando profesores...</span>
          </div>
        )}
        {/* Tabla de profesores */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
            gap: '16px',
            padding: '20px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.3)',
            fontWeight: '600',
            color: '#67e8f9'
          }}>
            <div>Nombre</div>
            <div>Email</div>
            <div>Especialización</div>
            <div>Cursos</div>
            <div>Acciones</div>
          </div>
          
          {professors.map((professor) => (
            <div key={professor.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
              gap: '16px',
              padding: '20px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ color: '#cbd5e1' }}>{professor.name}</div>
              <div style={{ color: '#94a3b8' }}>{professor.email}</div>
              <div style={{ color: '#94a3b8' }}>{professor.specialization}</div>
              <div style={{ color: '#94a3b8' }}>{professor.courses}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#06b6d4',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  Ver
                </button>
                <button 
                  onClick={() => {
                    setEditingProfessor(professor);
                    setShowModal(true);
                  }}
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#10b981',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                  Editar
                </button>
                <button 
                  onClick={() => handleDeleteProfessor(professor.id)}
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    opacity: loading ? '0.5' : '1'
                  }}
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
          onClose={() => {
            setShowModal(false);
            setEditingProfessor(null);
          }}
          onSave={handleSaveProfessor}
          professor={editingProfessor}
          loading={loading}
        />
    </div>
  );
};


const ProfessorModal = ({ isOpen, onClose, onSave, professor, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: '',
    department: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Cargar datos si estamos editando
  useEffect(() => {
    if (professor) {
      setFormData({
        name: professor.name || '',
        email: professor.email || '',
        specialization: professor.specialization || '',
        phone: professor.phone || '',
        department: professor.department || ''
      });
    } else {
      // Resetear form si es nuevo
      setFormData({
        name: '',
        email: '',
        specialization: '',
        phone: '',
        department: ''
      });
    }
    setFormErrors({});
  }, [professor, isOpen]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.specialization.trim()) {
      errors.specialization = 'La especialización es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo al escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}
    onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #10b981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {professor ? '✏️ Editar Profesor' : '➕ Agregar Profesor'}
          </h2>
          
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '4px',
              transition: 'color 0.2s ease',
              opacity: loading ? '0.5' : '1'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.color = '#94a3b8')}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Nombre completo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: Dr. Carlos López"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: formErrors.name ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(30, 41, 59, 0.5)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s ease',
                opacity: loading ? '0.6' : '1',
                cursor: loading ? 'not-allowed' : 'text'
              }}
              onFocus={(e) => !formErrors.name && (e.currentTarget.style.border = '1px solid #10b981')}
              onBlur={(e) => !formErrors.name && (e.currentTarget.style.border = '1px solid rgba(148, 163, 184, 0.3)')}
            />
            {formErrors.name && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {formErrors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Email Institucional *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="ejemplo@pucp.edu.pe"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: formErrors.email ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(30, 41, 59, 0.5)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s ease',
                opacity: loading ? '0.6' : '1',
                cursor: loading ? 'not-allowed' : 'text'
              }}
              onFocus={(e) => !formErrors.email && (e.currentTarget.style.border = '1px solid #10b981')}
              onBlur={(e) => !formErrors.email && (e.currentTarget.style.border = '1px solid rgba(148, 163, 184, 0.3)')}
            />
            {formErrors.email && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {formErrors.email}
              </span>
            )}
          </div>

          {/* Especialización */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Especialización *
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: Matemáticas, Física, Química"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: formErrors.specialization ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(30, 41, 59, 0.5)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s ease',
                opacity: loading ? '0.6' : '1',
                cursor: loading ? 'not-allowed' : 'text'
              }}
              onFocus={(e) => !formErrors.specialization && (e.currentTarget.style.border = '1px solid #10b981')}
              onBlur={(e) => !formErrors.specialization && (e.currentTarget.style.border = '1px solid rgba(148, 163, 184, 0.3)')}
            />
            {formErrors.specialization && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {formErrors.specialization}
              </span>
            )}
          </div>

          {/* Teléfono (opcional) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Teléfono <span style={{ color: '#64748b' }}>(opcional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: +51 999 999 999"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(30, 41, 59, 0.5)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s ease',
                opacity: loading ? '0.6' : '1',
                cursor: loading ? 'not-allowed' : 'text'
              }}
              onFocus={(e) => e.currentTarget.style.border = '1px solid #10b981'}
              onBlur={(e) => e.currentTarget.style.border = '1px solid rgba(148, 163, 184, 0.3)'}
            />
          </div>

          {/* Departamento (opcional) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Departamento <span style={{ color: '#64748b' }}>(opcional)</span>
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: Ciencias"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(30, 41, 59, 0.5)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s ease',
                opacity: loading ? '0.6' : '1',
                cursor: loading ? 'not-allowed' : 'text'
              }}
              onFocus={(e) => e.currentTarget.style.border = '1px solid #10b981'}
              onBlur={(e) => e.currentTarget.style.border = '1px solid rgba(148, 163, 184, 0.3)'}
            />
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'transparent',
                color: '#cbd5e1',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: loading ? '0.5' : '1'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'transparent')}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: loading 
                  ? 'rgba(16, 185, 129, 0.5)' 
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              )}
              {loading ? 'Guardando...' : professor ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>

        {/* CSS para animación */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};



export default ProfessorManagement;