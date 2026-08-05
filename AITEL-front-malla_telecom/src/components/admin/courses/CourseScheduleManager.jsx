import React, { useState,useEffect } from 'react';
import { SchedulesApi } from '../../../services/admin/courses/SchedulesApi';

const CourseScheduleManager = ({ course, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Datos mock de horarios por ciclo
  const [scheduleData, setScheduleData] = useState({});
  const [availableProfessors, setAvailableProfessors] = useState([]);
  const [showAddCycleForm, setShowAddCycleForm] = useState(false);
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false);
  const [selectedCycleForSchedule, setSelectedCycleForSchedule] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [expandedCycle, setExpandedCycle] = useState(null);

  const [newCycle, setNewCycle] = useState('');
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    days: [{ day: 'Lunes', startTime: '08:00', endTime: '10:00' }],
    professors: [],
    classroom: ''
  });
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const timeSlots = Array.from({length: 14}, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const sortedCycles = Object.keys(scheduleData).sort((a, b) => {
    const [yearA, cycleA] = a.split('-');
    const [yearB, cycleB] = b.split('-');
    if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
    return parseInt(cycleB) - parseInt(cycleA);
  });

  useEffect(() => {
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [schedules, professors] = await Promise.all([
        SchedulesApi.getCourseSchedules(course.id),
        SchedulesApi.getProfessors()
      ]);
      setScheduleData(schedules);
      setAvailableProfessors(professors);
    } catch (error) {
      console.error('Error al cargar horarios');
      setError('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };
  
  loadInitialData();
}, [course.id]);

  const handleAddCycle = async () => {
    if (!newCycle || scheduleData[newCycle]) return;
    try{
      setLoading(true);
      await SchedulesApi.createCycle(course.id,newCycle);
      setScheduleData({
        ...scheduleData,
        [newCycle]: []
      });
      setNewCycle('');
      setShowAddCycleForm(false);
    }catch(error){
      console.error('Error al crear ciclo');
      setError('Error al crear ciclo');
    }finally{
      setLoading(false);
    }

  };

  const handleDeleteCycle = async (cycle) => {
    if (!window.confirm(`¿Estás seguro de eliminar el ciclo ${cycle}?`)) return;
    
    try {
      setLoading(true);
      await SchedulesApi.deleteCycle(course.id, cycle);
      const newData = { ...scheduleData };
      delete newData[cycle];
      setScheduleData(newData);
    } catch (error) {
      console.error('Error al eliminar ciclo');
      setError('Error al eliminar ciclo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedCycleForSchedule || !newSchedule.name.trim()) return;
    
    try {
      setLoading(true);
      const savedSchedule = await SchedulesApi.createSchedule(
        course.id, 
        selectedCycleForSchedule, 
        newSchedule
      );
      
      setScheduleData({
        ...scheduleData,
        [selectedCycleForSchedule]: [
          ...(scheduleData[selectedCycleForSchedule] || []), 
          savedSchedule
        ]
      });
      resetScheduleForm();
    } catch (error) {
      setError('Error al crear horario');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (cycle, schedule) => {
    if (loading) return; // Prevenir edición durante carga
    
    setSelectedCycleForSchedule(cycle);
    setEditingSchedule(schedule);
    setNewSchedule({ ...schedule });
    setShowAddScheduleForm(true);
  };

  const handleUpdateSchedule = async () => {
    if (!selectedCycleForSchedule || !newSchedule.name.trim() || !editingSchedule) return;
    
    try {
      setLoading(true);
      const updatedSchedule = await SchedulesApi.updateSchedule(
        course.id,
        selectedCycleForSchedule,
        editingSchedule.id,
        newSchedule
      );
      
      setScheduleData({
        ...scheduleData,
        [selectedCycleForSchedule]: scheduleData[selectedCycleForSchedule].map(s => 
          s.id === editingSchedule.id ? updatedSchedule : s
        )
      });
      resetScheduleForm();
    } catch (error) {
      setError('Error al actualizar horario');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (cycle, scheduleId) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario?')) return;
    
    try {
      setLoading(true);
      await SchedulesApi.deleteSchedule(course.id, cycle, scheduleId);
      
      setScheduleData({
        ...scheduleData,
        [cycle]: scheduleData[cycle].filter(s => s.id !== scheduleId)
      });
    } catch (error) {
      setError('Error al eliminar horario');
    } finally {
      setLoading(false);
    }
  };

  const resetScheduleForm = () => {
    if (loading) return; // Prevenir reset durante operaciones

    setShowAddScheduleForm(false);
    setSelectedCycleForSchedule('');
    setEditingSchedule(null);
    setNewSchedule({
      name: '',
      days: [{ day: 'Lunes', startTime: '08:00', endTime: '10:00' }],
      professors: [],
      classroom: ''
    });
  };

  const addDay = () => {
    setNewSchedule({
      ...newSchedule,
      days: [...newSchedule.days, { day: 'Lunes', startTime: '08:00', endTime: '10:00' }]
    });
  };

  const removeDay = (index) => {
    setNewSchedule({
      ...newSchedule,
      days: newSchedule.days.filter((_, i) => i !== index)
    });
  };

  const updateDay = (index, field, value) => {
    const updatedDays = newSchedule.days.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    );
    setNewSchedule({ ...newSchedule, days: updatedDays });
  };

  const addProfessor = (professor) => {
    if (!newSchedule.professors.includes(professor)) {
      setNewSchedule({
        ...newSchedule,
        professors: [...newSchedule.professors, professor]
      });
    }
  };

  const removeProfessor = (professor) => {
    setNewSchedule({
      ...newSchedule,
      professors: newSchedule.professors.filter(p => p !== professor)
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'white',
          margin: 0,
          marginBottom: '8px'
        }}>
          {course.name}
        </h2>
        <p style={{
          color: '#94a3b8',
          fontSize: '16px',
          margin: 0
        }}>
          Gestión de horarios por ciclo académico
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setShowAddCycleForm(true)}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <span>+</span>
          Agregar Ciclo
        </button>

        <button
          onClick={() => {
            if (sortedCycles.length > 0) {
              setSelectedCycleForSchedule(sortedCycles[0]);
              setShowAddScheduleForm(true);
            }
          }}
          disabled={sortedCycles.length === 0||loading}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: sortedCycles.length > 0 
              ? 'linear-gradient(135deg, #10b981, #059669)' 
              : 'rgba(148, 163, 184, 0.3)',
            color: 'white',
            cursor: sortedCycles.length <= 0 || loading ? 'not-allowed':'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: sortedCycles.length <= 0 || loading ? 0.6 : 1
            
          }}
        >
          <span>📅</span>
          Nuevo Horario
        </button>
      </div>

      {/* Add Cycle Form */}
      {showAddCycleForm && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            color: '#67e8f9',
            marginBottom: '16px',
            fontSize: '18px'
          }}>
            ✨ Agregar Nuevo Ciclo
          </h3>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Ej: 2025-2, 2026-0..."
              value={newCycle}
              onChange={(e) => setNewCycle(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                minWidth: '150px'
              }}
            />
            <button
              onClick={handleAddCycle}
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#06b6d4',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Agregar
            </button>
            <button
              onClick={() => {
                setShowAddCycleForm(false);
                setNewCycle('');
              }}
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Schedule Form */}
      {showAddScheduleForm && (
        <ScheduleForm 
          newSchedule={newSchedule}
          setNewSchedule={setNewSchedule}
          selectedCycleForSchedule={selectedCycleForSchedule}
          setSelectedCycleForSchedule={setSelectedCycleForSchedule}
          sortedCycles={sortedCycles}
          daysOfWeek={daysOfWeek}
          timeSlots={timeSlots}
          availableProfessors={availableProfessors}
          editingSchedule={editingSchedule}
          onSave={editingSchedule ? handleUpdateSchedule : handleAddSchedule}
          onCancel={resetScheduleForm}
          addDay={addDay}
          removeDay={removeDay}
          updateDay={updateDay}
          addProfessor={addProfessor}
          removeProfessor={removeProfessor}
          loading={loading}
        />
      )}

      {/* Cycles List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {sortedCycles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
              No hay ciclos programados
            </h3>
            <p style={{ fontSize: '16px' }}>
              Comienza agregando un ciclo académico para este curso
            </p>
          </div>
        ) : (
          sortedCycles.map(cycle => (
            <CycleCard
              key={cycle}
              cycle={cycle}
              schedules={scheduleData[cycle]}
              isExpanded={expandedCycle === cycle}
              onToggleExpand={() => setExpandedCycle(expandedCycle === cycle ? null : cycle)}
              onDeleteCycle={handleDeleteCycle}
              onAddSchedule={() => {
                setSelectedCycleForSchedule(cycle);
                setShowAddScheduleForm(true);
              }}
              onEditSchedule={(schedule) => handleEditSchedule(cycle, schedule)}
              onDeleteSchedule={(scheduleId) => handleDeleteSchedule(cycle, scheduleId)}
              loading={loading}
            />
          ))
        )}
      </div>

      {/* Save/Cancel Actions */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        borderTop: '1px solid rgba(148, 163, 184, 0.2)',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '14px',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(scheduleData)}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Guardar Cambios
        </button>
      </div>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'white'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(16, 185, 129, 0.3)',
              borderTop: '4px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>
              Procesando horarios...
            </span>
          </div>
        </div>
      )}

      {/* CSS para la animación */}
      <style>
        {`@keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`}
      </style>
    </div>
  );
};

// Componente para el formulario de horarios
const ScheduleForm = ({ 
  newSchedule, setNewSchedule, selectedCycleForSchedule, setSelectedCycleForSchedule,
  sortedCycles, daysOfWeek, timeSlots, availableProfessors, editingSchedule,
  onSave, onCancel, addDay, removeDay, updateDay, addProfessor, removeProfessor ,loading
}) => {
  const [selectedProfessor, setSelectedProfessor] = useState('');

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{
        color: '#67e8f9',
        marginBottom: '20px',
        fontSize: '18px'
      }}>
        {editingSchedule ? '✏️ Editar Horario' : '📅 Nuevo Horario'}
      </h3>

      {/* Basic Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Ciclo académico
          </label>
          <select
            value={selectedCycleForSchedule}
            onChange={(e) => setSelectedCycleForSchedule(e.target.value)}
            disabled={editingSchedule !== null}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="">Seleccionar ciclo...</option>
            {sortedCycles.map(cycle => (
              <option key={cycle} value={cycle}>{cycle}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Nombre del horario
          </label>
          <input
            type="text"
            value={newSchedule.name}
            onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
            placeholder="Ej: Horario Principal, Mañana, Tarde..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Aula
          </label>
          <input
            type="text"
            value={newSchedule.classroom}
            onChange={(e) => setNewSchedule({...newSchedule, classroom: e.target.value})}
            placeholder="Ej: Aula 201, Lab 305..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Days and Times */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <label style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Días y horarios
          </label>
          <button
            onClick={addDay}
            disabled={loading}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              fontSize: '12px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            + Agregar día
          </button>
        </div>

        {newSchedule.days.map((day, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr auto',
            gap: '12px',
            marginBottom: '8px',
            padding: '12px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px'
          }}>
            <select
              value={day.day}
              onChange={(e) => updateDay(index, 'day', e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(30, 41, 59, 0.6)',
                color: 'white',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              {daysOfWeek.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={day.startTime}
              onChange={(e) => updateDay(index, 'startTime', e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(30, 41, 59, 0.6)',
                color: 'white',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>

            <select
              value={day.endTime}
              onChange={(e) => updateDay(index, 'endTime', e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(30, 41, 59, 0.6)',
                color: 'white',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>

            {newSchedule.days.length > 1 && (
              <button
                disabled={loading}
                onClick={() => removeDay(index)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '12px',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Professors */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Profesores
        </label>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap'
        }}>
          <select
            value={selectedProfessor}
            onChange={(e) => setSelectedProfessor(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            <option value="">Seleccionar profesor...</option>
            {availableProfessors
              .filter(prof => !newSchedule.professors.includes(prof))
              .map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
          </select>
          <button
            disabled={loading}
            onClick={() => {
              if (selectedProfessor) {
                addProfessor(selectedProfessor);
                setSelectedProfessor('');
              }
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              fontSize: '12px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            + Agregar
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {newSchedule.professors.map(prof => (
            <span
              key={prof}
              style={{
                padding: '4px 8px',
                borderRadius: '12px',
                background: '#10b98120',
                color: '#10b981',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {prof}
              <button
                onClick={() => removeProfessor(prof)}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '10px',
                  padding: '0 2px',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          disabled={loading}
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '14px',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={!selectedCycleForSchedule || !newSchedule.name.trim()||loading}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: (!selectedCycleForSchedule || !newSchedule.name.trim()) 
              ? 'rgba(148, 163, 184, 0.3)' 
              : '#10b981',
            color: 'white',
            cursor: (!selectedCycleForSchedule || !newSchedule.name.trim() || loading) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            opacity: (!selectedCycleForSchedule || !newSchedule.name.trim() || loading) ? 0.6 : 1,
            
          }}
        >
          {editingSchedule ? 'Actualizar' : 'Crear'} Horario
        </button>
      </div>
    </div>
  );
};

// Componente para cada card de ciclo
const CycleCard = ({ 
  cycle, schedules, isExpanded, onToggleExpand, onDeleteCycle, 
  onAddSchedule, onEditSchedule, onDeleteSchedule ,loading
}) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      overflow: 'hidden'
    }}>
      {/* Cycle Header */}
      <div 
        onClick={onToggleExpand}
        style={{
          padding: '20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div>
          <h3 style={{
            color: '#06b6d4',
            fontSize: '20px',
            fontWeight: '700',
            margin: 0,
            marginBottom: '4px'
          }}>
            📅 Ciclo {cycle}
          </h3>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            margin: 0
          }}>
            {schedules.length} horario{schedules.length !== 1 ? 's' : ''} programado{schedules.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
          disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onAddSchedule();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              fontSize: '12px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            + Horario
          </button>

          <button
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCycle(cycle);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            🗑️
          </button>

          <div style={{
            color: '#06b6d4',
            fontSize: '18px',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
          padding: '20px'
        }}>
          {schedules.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
              <p style={{ fontSize: '14px' }}>
                No hay horarios programados para este ciclo
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {schedules.map(schedule => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onEdit={() => onEditSchedule(schedule)}
                  onDelete={() => onDeleteSchedule(schedule.id)}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para cada card de horario
const ScheduleCard = ({ schedule, onEdit, onDelete,loading}) => {
  const formatTimeRange = (days) => {
    return days.map(day => `${day.day} ${day.startTime}-${day.endTime}`).join(', ');
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      borderRadius: '12px',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      padding: '16px',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Schedule Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <h4 style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          margin: 0
        }}>
          {schedule.name}
        </h4>
        
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onEdit}
            disabled={loading}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              fontSize: '11px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '11px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Schedule Details */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontSize: '13px'
      }}>
        {/* Time Slots */}
        <div>
          <span style={{ color: '#94a3b8' }}>⏰ Horario: </span>
          <span style={{ color: '#cbd5e1' }}>
            {formatTimeRange(schedule.days)}
          </span>
        </div>

        {/* Professors */}
        <div>
          <span style={{ color: '#94a3b8' }}>👨‍🏫 Profesor{schedule.professors.length !== 1 ? 'es' : ''}: </span>
          <span style={{ color: '#cbd5e1' }}>
            {schedule.professors.join(', ') || 'Sin asignar'}
          </span>
        </div>

        {/* Classroom */}
        {schedule.classroom && (
          <div>
            <span style={{ color: '#94a3b8' }}>🏫 Aula: </span>
            <span style={{ color: '#cbd5e1' }}>
              {schedule.classroom}
            </span>
          </div>
        )}
      </div>

      {/* Visual Schedule Grid */}
      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          fontSize: '10px'
        }}>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => {
            const hasClass = schedule.days.some(d => 
              d.day.startsWith(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][index])
            );
            return (
              <div
                key={day}
                style={{
                  padding: '4px 2px',
                  textAlign: 'center',
                  borderRadius: '4px',
                  background: hasClass ? '#06b6d4' : 'rgba(148, 163, 184, 0.2)',
                  color: hasClass ? 'white' : '#94a3b8',
                  fontWeight: hasClass ? '600' : '400'
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseScheduleManager;