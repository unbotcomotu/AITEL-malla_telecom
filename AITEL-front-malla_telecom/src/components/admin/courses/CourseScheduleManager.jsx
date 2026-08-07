import React, { useState, useEffect } from 'react';
import { SchedulesApi } from '../../../services/admin/courses/schedulesApi';

const INPUT_CLASS = 'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-good disabled:opacity-60';
const LABEL_CLASS = 'mb-2 block text-sm text-muted';

const CourseScheduleManager = ({ course, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [availableProfessors, setAvailableProfessors] = useState([]);
  const [showAddCycleForm, setShowAddCycleForm] = useState(false);
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false);
  const [selectedCycleForSchedule, setSelectedCycleForSchedule] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [expandedCycle, setExpandedCycle] = useState(null);

  const [newCycle, setNewCycle] = useState('');
  const [newSchedule, setNewSchedule] = useState({
    name: '', days: [{ day: 'Lunes', startTime: '08:00', endTime: '10:00' }], professors: [], classroom: ''
  });
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${(7 + i).toString().padStart(2, '0')}:00`);

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
        setError('Error al cargar horarios');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [course.id]);

  const handleAddCycle = async () => {
    if (!newCycle || scheduleData[newCycle]) return;
    try {
      setLoading(true);
      await SchedulesApi.createCycle(course.id, newCycle);
      setScheduleData({ ...scheduleData, [newCycle]: [] });
      setNewCycle('');
      setShowAddCycleForm(false);
    } catch (error) {
      setError('Error al crear ciclo');
    } finally {
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
      setError('Error al eliminar ciclo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedCycleForSchedule || !newSchedule.name.trim()) return;
    try {
      setLoading(true);
      const savedSchedule = await SchedulesApi.createSchedule(course.id, selectedCycleForSchedule, newSchedule);
      setScheduleData({
        ...scheduleData,
        [selectedCycleForSchedule]: [...(scheduleData[selectedCycleForSchedule] || []), savedSchedule]
      });
      resetScheduleForm();
    } catch (error) {
      setError('Error al crear horario');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (cycle, schedule) => {
    if (loading) return;
    setSelectedCycleForSchedule(cycle);
    setEditingSchedule(schedule);
    setNewSchedule({ ...schedule });
    setShowAddScheduleForm(true);
  };

  const handleUpdateSchedule = async () => {
    if (!selectedCycleForSchedule || !newSchedule.name.trim() || !editingSchedule) return;
    try {
      setLoading(true);
      const updatedSchedule = await SchedulesApi.updateSchedule(course.id, selectedCycleForSchedule, editingSchedule.id, newSchedule);
      setScheduleData({
        ...scheduleData,
        [selectedCycleForSchedule]: scheduleData[selectedCycleForSchedule].map(s => (s.id === editingSchedule.id ? updatedSchedule : s))
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
      setScheduleData({ ...scheduleData, [cycle]: scheduleData[cycle].filter(s => s.id !== scheduleId) });
    } catch (error) {
      setError('Error al eliminar horario');
    } finally {
      setLoading(false);
    }
  };

  const resetScheduleForm = () => {
    if (loading) return;
    setShowAddScheduleForm(false);
    setSelectedCycleForSchedule('');
    setEditingSchedule(null);
    setNewSchedule({ name: '', days: [{ day: 'Lunes', startTime: '08:00', endTime: '10:00' }], professors: [], classroom: '' });
  };

  const addDay = () => setNewSchedule({ ...newSchedule, days: [...newSchedule.days, { day: 'Lunes', startTime: '08:00', endTime: '10:00' }] });
  const removeDay = (index) => setNewSchedule({ ...newSchedule, days: newSchedule.days.filter((_, i) => i !== index) });
  const updateDay = (index, field, value) => {
    const updatedDays = newSchedule.days.map((day, i) => (i === index ? { ...day, [field]: value } : day));
    setNewSchedule({ ...newSchedule, days: updatedDays });
  };
  const addProfessor = (professor) => {
    if (!newSchedule.professors.includes(professor)) {
      setNewSchedule({ ...newSchedule, professors: [...newSchedule.professors, professor] });
    }
  };
  const removeProfessor = (professor) => setNewSchedule({ ...newSchedule, professors: newSchedule.professors.filter(p => p !== professor) });

  return (
    <div className="w-full max-w-5xl text-ink">
      <div className="mb-8 text-center">
        <h2 className="m-0 mb-2 text-2xl font-bold text-ink">{course.name}</h2>
        <p className="m-0 text-base text-muted">Gestión de horarios por ciclo académico</p>
      </div>

      {error && <div className="mb-5 rounded-xl border border-bad/40 bg-bad/10 p-4 text-bad">{error}</div>}

      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowAddCycleForm(true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-ink-on-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>+</span> Agregar Ciclo
        </button>

        <button
          onClick={() => { if (sortedCycles.length > 0) { setSelectedCycleForSchedule(sortedCycles[0]); setShowAddScheduleForm(true); } }}
          disabled={sortedCycles.length === 0 || loading}
          className="flex items-center gap-2 rounded-xl bg-good px-6 py-3 text-sm font-semibold text-ink-on-accent disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:opacity-60"
        >
          <span>📅</span> Nuevo Horario
        </button>
      </div>

      {showAddCycleForm && (
        <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/10 p-6">
          <h3 className="mb-4 text-lg text-accent">✨ Agregar Nuevo Ciclo</h3>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Ej: 2025-2, 2026-0..."
              value={newCycle}
              onChange={(e) => setNewCycle(e.target.value)}
              className="min-w-[150px] rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink outline-none"
            />
            <button onClick={handleAddCycle} disabled={loading} className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-ink-on-accent disabled:opacity-60">Agregar</button>
            <button onClick={() => { setShowAddCycleForm(false); setNewCycle(''); }} disabled={loading} className="rounded-lg border border-line px-5 py-3 text-sm text-muted disabled:opacity-60">Cancelar</button>
          </div>
        </div>
      )}

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

      <div className="flex flex-col gap-5">
        {sortedCycles.length === 0 ? (
          <div className="p-16 text-center text-muted">
            <div className="mb-4 text-5xl">📅</div>
            <h3 className="mb-2 text-xl text-ink">No hay ciclos programados</h3>
            <p className="text-base">Comienza agregando un ciclo académico para este curso</p>
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
              onAddSchedule={() => { setSelectedCycleForSchedule(cycle); setShowAddScheduleForm(true); }}
              onEditSchedule={(schedule) => handleEditSchedule(cycle, schedule)}
              onDeleteSchedule={(scheduleId) => handleDeleteSchedule(cycle, scheduleId)}
              loading={loading}
            />
          ))
        )}
      </div>

      <div className="mt-8 flex justify-end border-t border-line pt-6">
        <button onClick={onClose} disabled={loading} className="rounded-lg bg-good px-6 py-3 text-sm font-semibold text-ink-on-accent disabled:cursor-not-allowed disabled:opacity-60">Cerrar</button>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-good/30 bg-surface p-6 text-ink">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-good/30 border-t-good" />
            <span className="text-base font-semibold">Procesando horarios...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ScheduleForm = ({
  newSchedule, setNewSchedule, selectedCycleForSchedule, setSelectedCycleForSchedule,
  sortedCycles, daysOfWeek, timeSlots, availableProfessors, editingSchedule,
  onSave, onCancel, addDay, removeDay, updateDay, addProfessor, removeProfessor, loading
}) => {
  const [selectedProfessor, setSelectedProfessor] = useState('');

  return (
    <div className="mb-6 rounded-2xl border border-good/30 bg-good/10 p-6">
      <h3 className="mb-5 text-lg text-good">{editingSchedule ? '✏️ Editar Horario' : '📅 Nuevo Horario'}</h3>

      <div className="mb-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label className={LABEL_CLASS}>Ciclo académico</label>
          <select value={selectedCycleForSchedule} onChange={(e) => setSelectedCycleForSchedule(e.target.value)} disabled={editingSchedule !== null} className={INPUT_CLASS}>
            <option value="">Seleccionar ciclo...</option>
            {sortedCycles.map(cycle => <option key={cycle} value={cycle}>{cycle}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Nombre del horario</label>
          <input type="text" value={newSchedule.name} onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })} placeholder="Ej: Horario Principal, Mañana, Tarde..." className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Aula</label>
          <input type="text" value={newSchedule.classroom} onChange={(e) => setNewSchedule({ ...newSchedule, classroom: e.target.value })} placeholder="Ej: Aula 201, Lab 305..." className={INPUT_CLASS} />
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm text-muted">Días y horarios</label>
          <button onClick={addDay} disabled={loading} className="rounded-md bg-good px-3 py-1.5 text-xs text-ink-on-accent disabled:opacity-60">+ Agregar día</button>
        </div>

        {newSchedule.days.map((day, index) => (
          <div key={index} className="mb-2 grid gap-3 rounded-lg bg-bg p-3" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
            <select value={day.day} onChange={(e) => updateDay(index, 'day', e.target.value)} className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none">
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={day.startTime} onChange={(e) => updateDay(index, 'startTime', e.target.value)} className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none">
              {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
            </select>
            <select value={day.endTime} onChange={(e) => updateDay(index, 'endTime', e.target.value)} className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none">
              {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
            </select>
            {newSchedule.days.length > 1 && (
              <button disabled={loading} onClick={() => removeDay(index)} className="rounded-md bg-bad px-2 py-2 text-xs text-white disabled:opacity-60">×</button>
            )}
          </div>
        ))}
      </div>

      <div className="mb-5">
        <label className={LABEL_CLASS}>Profesores</label>
        <div className="mb-2 flex flex-wrap gap-2">
          <select value={selectedProfessor} onChange={(e) => setSelectedProfessor(e.target.value)} className="rounded-md border border-line bg-bg px-3 py-2 text-xs text-ink outline-none">
            <option value="">Seleccionar profesor...</option>
            {availableProfessors.filter(prof => !newSchedule.professors.includes(prof)).map(prof => <option key={prof} value={prof}>{prof}</option>)}
          </select>
          <button
            disabled={loading}
            onClick={() => { if (selectedProfessor) { addProfessor(selectedProfessor); setSelectedProfessor(''); } }}
            className="rounded-md bg-good px-3 py-2 text-xs text-ink-on-accent disabled:opacity-60"
          >
            + Agregar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {newSchedule.professors.map(prof => (
            <span key={prof} className="flex items-center gap-1 rounded-full bg-good/20 px-2 py-1 text-xs text-good">
              {prof}
              <button onClick={() => removeProfessor(prof)} disabled={loading} className="disabled:opacity-60">×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button disabled={loading} onClick={onCancel} className="rounded-lg border border-line px-5 py-2.5 text-sm text-muted disabled:opacity-60">Cancelar</button>
        <button
          onClick={onSave}
          disabled={!selectedCycleForSchedule || !newSchedule.name.trim() || loading}
          className="rounded-lg bg-good px-5 py-2.5 text-sm font-semibold text-ink-on-accent disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {editingSchedule ? 'Actualizar' : 'Crear'} Horario
        </button>
      </div>
    </div>
  );
};

const CycleCard = ({ cycle, schedules, isExpanded, onToggleExpand, onDeleteCycle, onAddSchedule, onEditSchedule, onDeleteSchedule, loading }) => (
  <div className="overflow-hidden rounded-2xl border border-line bg-surface">
    <div onClick={onToggleExpand} className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-accent/5">
      <div>
        <h3 className="m-0 mb-1 text-xl font-bold text-accent">📅 Ciclo {cycle}</h3>
        <p className="m-0 text-sm text-muted">{schedules.length} horario{schedules.length !== 1 ? 's' : ''} programado{schedules.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex items-center gap-3">
        <button disabled={loading} onClick={(e) => { e.stopPropagation(); onAddSchedule(); }} className="rounded-lg bg-good px-4 py-2 text-xs font-medium text-ink-on-accent disabled:opacity-60">+ Horario</button>
        <button disabled={loading} onClick={(e) => { e.stopPropagation(); onDeleteCycle(cycle); }} className="rounded-lg bg-bad/20 px-3 py-2 text-xs font-medium text-bad disabled:opacity-60">🗑️</button>
        <div className="text-lg text-accent transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
      </div>
    </div>

    {isExpanded && (
      <div className="border-t border-line/40 p-5">
        {schedules.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <div className="mb-3 text-3xl">📅</div>
            <p className="text-sm">No hay horarios programados para este ciclo</p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {schedules.map(schedule => (
              <ScheduleCard key={schedule.id} schedule={schedule} onEdit={() => onEditSchedule(schedule)} onDelete={() => onDeleteSchedule(schedule.id)} loading={loading} />
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const ScheduleCard = ({ schedule, onEdit, onDelete, loading }) => {
  const formatTimeRange = (days) => days.map(day => `${day.day} ${day.startTime}-${day.endTime}`).join(', ');

  return (
    <div className="rounded-xl border border-line bg-bg p-4 transition-transform hover:-translate-y-0.5">
      <div className="mb-3 flex items-start justify-between">
        <h4 className="m-0 text-base font-semibold text-ink">{schedule.name}</h4>
        <div className="flex gap-1.5">
          <button onClick={onEdit} disabled={loading} className="rounded-md bg-good/20 px-2 py-1 text-[11px] font-medium text-good disabled:opacity-60">✏️</button>
          <button onClick={onDelete} disabled={loading} className="rounded-md bg-bad/20 px-2 py-1 text-[11px] font-medium text-bad disabled:opacity-60">🗑️</button>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-[13px]">
        <div><span className="text-muted">⏰ Horario: </span><span className="text-ink">{formatTimeRange(schedule.days)}</span></div>
        <div><span className="text-muted">👨‍🏫 Profesor{schedule.professors.length !== 1 ? 'es' : ''}: </span><span className="text-ink">{schedule.professors.join(', ') || 'Sin asignar'}</span></div>
        {schedule.classroom && <div><span className="text-muted">🏫 Aula: </span><span className="text-ink">{schedule.classroom}</span></div>}
      </div>

      <div className="mt-3 rounded-lg bg-surface p-2">
        <div className="grid grid-cols-7 gap-0.5 text-[10px]">
          {DAY_LETTERS.map((day, index) => {
            const hasClass = schedule.days.some(d => d.day.startsWith(DAY_NAMES[index]));
            return (
              <div key={day} className={`rounded px-0.5 py-1 text-center font-semibold ${hasClass ? 'bg-accent text-ink-on-accent' : 'bg-line/30 text-muted font-normal'}`}>
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
