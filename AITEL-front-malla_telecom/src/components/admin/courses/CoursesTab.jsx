import React, { useState, useEffect, useMemo } from 'react';
import { CoursesApi } from '../../../services/admin/courses/coursesApi';

// El backend modela todos los requisitos de un curso en un solo arreglo
// `prerequisites: [{source, type, minGrade}]` con type 'approved'|'min_grade'|'corequisite'.
// La UI los maneja como 3 listas separadas, así que se derivan aquí en ambas direcciones.
const normalizeCourse = (course) => {
  const prerequisites = course.prerequisites || [];
  return {
    ...course,
    isVisible: !course.isHidden,
    prerequisites: prerequisites.filter(p => p.type === 'approved').map(p => p.source),
    minGradePrereqs: prerequisites.filter(p => p.type === 'min_grade').map(p => ({ courseId: p.source, minGrade: p.minGrade })),
    corequisites: prerequisites.filter(p => p.type === 'corequisite').map(p => p.source),
  };
};

const buildPrerequisitesPayload = (course) => [
  ...(course.prerequisites || []).map(courseId => ({ courseId, type: 'approved' })),
  ...(course.minGradePrereqs || []).map(p => ({ courseId: p.courseId, type: 'min_grade', minGrade: p.minGrade })),
  ...(course.corequisites || []).map(courseId => ({ courseId, type: 'corequisite' })),
];

const INPUT_CLASS = 'w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-accent disabled:opacity-60';
const LABEL_CLASS = 'mb-2 block text-sm text-muted';

const CoursesTab = ({ selectedSubcategory, onCourseSelect, onBack }) => {
  const [courses, setCourses] = useState([]);
  const [schedulesByCourse, setSchedulesByCourse] = useState({});
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState('all');
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);

  const [showFreezeConfirmation, setShowFreezeConfirmation] = useState(null);
  const [showUnfreezeConfirmation, setShowUnfreezeConfirmation] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [confirmationTimer, setConfirmationTimer] = useState(10);
  const [canConfirm, setCanConfirm] = useState(false);

  const [newCourse, setNewCourse] = useState({
    code: '', name: '', description: '', credits: 3,
    hours: { theory: 2, practice: 2, lab: 0 },
    prerequisites: [], minGradePrereqs: [], corequisites: [],
    cycle: selectedSubcategory?.cycle || 1, isVisible: true
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!selectedSubcategory?.id) return;
      try {
        setLoading(true);
        const [coursesData, allCoursesData] = await Promise.all([
          CoursesApi.getCoursesBySubcategory(selectedSubcategory.id),
          CoursesApi.getAllCoursesForPrerequisites()
        ]);
        const normalizedCourses = coursesData.map(normalizeCourse);
        setCourses(normalizedCourses);
        setAllCourses(allCoursesData.map(normalizeCourse));

        const schedulesPromises = normalizedCourses.map(course =>
          CoursesApi.getCourseSchedules(course.id)
            .then(schedules => ({ courseId: course.id, schedules }))
            .catch(() => ({ courseId: course.id, schedules: [] }))
        );
        const schedulesResults = await Promise.all(schedulesPromises);
        const schedulesMap = schedulesResults.reduce((acc, { courseId, schedules }) => {
          acc[courseId] = schedules;
          return acc;
        }, {});
        setSchedulesByCourse(schedulesMap);
      } catch (error) {
        setError('Error al cargar cursos');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [selectedSubcategory?.id]);

  useEffect(() => {
    let timer;
    if ((showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && confirmationTimer > 0) {
      timer = setTimeout(() => setConfirmationTimer(confirmationTimer - 1), 1000);
    } else if (confirmationTimer === 0) {
      setCanConfirm(true);
    }
    return () => clearTimeout(timer);
  }, [showFreezeConfirmation, showUnfreezeConfirmation, showDeleteConfirmation, confirmationTimer]);

  const resetConfirmationState = () => {
    setShowFreezeConfirmation(null);
    setShowUnfreezeConfirmation(null);
    setShowDeleteConfirmation(null);
    setConfirmationTimer(10);
    setCanConfirm(false);
  };

  const getStatusColor = (course) => {
    if (course.isFrozen || selectedSubcategory?.isFrozen) return 'var(--t-muted)';
    if (!course.isVisible) return 'var(--t-warn)';
    return selectedSubcategory?.color || 'var(--t-accent)';
  };

  const getStatusIcon = (course) => {
    if (course.isFrozen || selectedSubcategory?.isFrozen) return '❄️';
    if (!course.isVisible) return '👁️‍🗨️';
    return '✅';
  };

  const getCourseById = (courseId) => allCourses.find(c => c.id === courseId) || { code: courseId, name: 'Curso no encontrado' };

  // Los horarios se cargan por separado (llegan después que los cursos), así que el conteo
  // se deriva aquí en vez de guardarse en el propio objeto curso.
  const coursesWithScheduleCounts = useMemo(
    () => courses.map(course => ({ ...course, schedulesCount: (schedulesByCourse[course.id] || []).length })),
    [courses, schedulesByCourse]
  );

  const filteredCourses = coursesWithScheduleCounts.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVisible === 'all' ||
      (filterVisible === 'visible' && course.isVisible) ||
      (filterVisible === 'hidden' && !course.isVisible);
    return matchesSearch && matchesFilter;
  });

  const handleAddCourse = async () => {
    if (!newCourse.name.trim() || !newCourse.code.trim()) return;
    try {
      setLoading(true);
      const payload = { ...newCourse, prerequisites: buildPrerequisitesPayload(newCourse) };
      const savedCourse = await CoursesApi.createCourse(selectedSubcategory.id, payload);
      setCourses([...courses, normalizeCourse(savedCourse)]);
      resetForm();
    } catch (error) {
      setError('Error al crear curso');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({ ...course });
    setShowAddForm(true);
  };

  const handleUpdateCourse = async () => {
    try {
      setLoading(true);
      const payload = { ...newCourse, prerequisites: buildPrerequisitesPayload(newCourse) };
      const updatedCourse = await CoursesApi.updateCourse(editingCourse.id, payload);
      setCourses(courses.map(course => (course.id === editingCourse.id ? normalizeCourse(updatedCourse) : course)));
      resetForm();
    } catch (error) {
      setError('Error al actualizar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = (course) => setShowDeleteConfirmation(course);

  const confirmDeleteCourse = async () => {
    const courseToDelete = showDeleteConfirmation;
    try {
      setLoading(true);
      await CoursesApi.deleteCourse(courseToDelete.id);
      setCourses(courses.filter(course => course.id !== courseToDelete.id));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo eliminar el curso "${courseToDelete.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeCourse = (course) => setShowFreezeConfirmation(course);

  const confirmFreezeCourse = async () => {
    const courseToFreeze = showFreezeConfirmation;
    try {
      setLoading(true);
      await CoursesApi.freezeCourse(courseToFreeze.id);
      setCourses(courses.map(course => (course.id === courseToFreeze.id ? { ...course, isFrozen: true } : course)));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo congelar el curso "${courseToFreeze.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreezeCourse = (course) => setShowUnfreezeConfirmation(course);

  const confirmUnfreezeCourse = async () => {
    const courseToUnfreeze = showUnfreezeConfirmation;
    try {
      setLoading(true);
      await CoursesApi.unfreezeCourse(courseToUnfreeze.id);
      setCourses(courses.map(course => (course.id === courseToUnfreeze.id ? { ...course, isFrozen: false } : course)));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo descongelar el curso "${courseToUnfreeze.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisible = async (courseId) => {
    try {
      setLoading(true);
      const updatedCourse = await CoursesApi.toggleCourseVisibility(courseId);
      setCourses(courses.map(course => (course.id === courseId ? normalizeCourse(updatedCourse) : course)));
    } catch (error) {
      setError('No se pudo cambiar la visibilidad del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    if (course.isFrozen || selectedSubcategory?.isFrozen) return;
    if (selectedCourseInfo?.id === course.id) {
      onCourseSelect(course);
    } else {
      setSelectedCourseInfo(course);
    }
  };

  const handleScheduleManager = (course) => {
    setSelectedCourseInfo(course);
    setShowScheduleManager(true);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingCourse(null);
    setNewCourse({
      code: '', name: '', description: '', credits: 3,
      hours: { theory: 2, practice: 2, lab: 0 },
      prerequisites: [], minGradePrereqs: [], corequisites: [],
      cycle: selectedSubcategory?.cycle || 1, isVisible: true
    });
  };

  if (selectedSubcategory?.isFrozen) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-muted/30 bg-muted/10 p-16 text-center">
          <div className="mb-4 text-5xl">❄️</div>
          <h3 className="mb-2 text-2xl text-muted">Subcategoría Congelada</h3>
          <p className="mb-6 text-base text-muted">
            La subcategoría "{selectedSubcategory.name}" está congelada. No se pueden realizar acciones en sus cursos.
          </p>
          <button
            disabled={loading}
            onClick={onBack}
            className="rounded-lg bg-line px-6 py-3 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← Volver a Subcategorías
          </button>
        </div>
      </div>
    );
  }

  const subcategoryColor = selectedSubcategory?.color || 'var(--t-accent-deep)';

  return (
    <div className="p-8 text-ink">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted">
        <button disabled={loading} onClick={onBack} className="text-accent underline disabled:opacity-60">📂 Categorías</button>
        <span>→</span>
        <button disabled={loading} onClick={onBack} className="text-accent underline disabled:opacity-60">📁 Subcategorías</button>
        <span>→</span>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: subcategoryColor }} />
          <span className="font-medium text-ink">{selectedSubcategory?.name || 'Subcategoría no seleccionada'}</span>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 mb-2 text-2xl font-bold" style={{ color: subcategoryColor }}>
            📚 Cursos de {selectedSubcategory?.name}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <p className="m-0 text-base text-muted">{selectedSubcategory?.description}</p>
            {selectedSubcategory?.requiredCourses && (
              <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: `${subcategoryColor}20`, color: subcategoryColor }}>
                ✅ {selectedSubcategory.requiredCourses} curso{selectedSubcategory.requiredCourses !== 1 ? 's' : ''} requerido{selectedSubcategory.requiredCourses !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          disabled={loading}
          style={{ background: `linear-gradient(135deg, ${subcategoryColor}, ${subcategoryColor}CC)` }}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg">+</span>
          Nuevo Curso
        </button>
      </div>

      {error && <div className="mb-5 rounded-xl border border-bad/40 bg-bad/10 p-4 text-bad">{error}</div>}

      <div className="mb-6 flex flex-wrap gap-4">
        <input
          disabled={loading}
          type="text"
          placeholder="🔍 Buscar cursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[250px] flex-1 rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-accent disabled:opacity-60"
        />
        <select
          disabled={loading}
          value={filterVisible}
          onChange={(e) => setFilterVisible(e.target.value)}
          className="rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-accent disabled:opacity-60"
        >
          <option value="all">Todos los cursos</option>
          <option value="visible">Solo visibles</option>
          <option value="hidden">Solo ocultos</option>
        </select>
      </div>

      {showAddForm && (
        <CourseForm
          newCourse={newCourse}
          setNewCourse={setNewCourse}
          selectedSubcategory={selectedSubcategory}
          allCourses={allCourses}
          editingCourse={editingCourse}
          onSave={editingCourse ? handleUpdateCourse : handleAddCourse}
          onCancel={resetForm}
          getCourseById={getCourseById}
          loading={loading}
        />
      )}

      <div className="grid gap-8" style={{ gridTemplateColumns: selectedCourseInfo ? '1fr 400px' : '1fr' }}>
        <div>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                selectedSubcategory={selectedSubcategory}
                isSelected={selectedCourseInfo?.id === course.id}
                onSelect={() => handleCourseClick(course)}
                onEdit={() => handleEditCourse(course)}
                onDelete={() => handleDeleteCourse(course)}
                onFreeze={() => handleFreezeCourse(course)}
                onUnfreeze={() => handleUnfreezeCourse(course)}
                onToggleVisible={() => handleToggleVisible(course.id)}
                onScheduleManager={() => handleScheduleManager(course)}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                getCourseById={getCourseById}
                loading={loading}
              />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="p-16 text-center text-muted">
              <div className="mb-4 text-5xl">📚</div>
              <h3 className="mb-2 text-xl text-ink">No se encontraron cursos</h3>
              <p className="text-base">{searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primer curso'}</p>
            </div>
          )}
        </div>

        {selectedCourseInfo && !showScheduleManager && (
          <CourseDetailsPanel
            course={selectedCourseInfo}
            schedules={schedulesByCourse[selectedCourseInfo.id] || []}
            selectedSubcategory={selectedSubcategory}
            onClose={() => setSelectedCourseInfo(null)}
            onNavigateToSchedules={() => onCourseSelect(selectedCourseInfo)}
            onScheduleManager={() => setShowScheduleManager(true)}
            getStatusColor={getStatusColor}
            getCourseById={getCourseById}
            loading={loading}
          />
        )}

        {selectedCourseInfo && showScheduleManager && (
          <ScheduleManagerPanel
            course={selectedCourseInfo}
            schedules={schedulesByCourse[selectedCourseInfo.id] || []}
            selectedSubcategory={selectedSubcategory}
            onClose={() => { setShowScheduleManager(false); setSelectedCourseInfo(null); }}
            onBackToDetails={() => setShowScheduleManager(false)}
            loading={loading}
          />
        )}
      </div>

      {(showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && (
        <ConfirmationModal
          type={showFreezeConfirmation ? 'freeze' : showUnfreezeConfirmation ? 'unfreeze' : 'delete'}
          item={showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation}
          itemType="curso"
          timer={confirmationTimer}
          canConfirm={canConfirm}
          onConfirm={showFreezeConfirmation ? confirmFreezeCourse : showUnfreezeConfirmation ? confirmUnfreezeCourse : confirmDeleteCourse}
          onCancel={resetConfirmationState}
          loading={loading}
        />
      )}

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border p-6 text-ink" style={{ background: 'var(--t-surface)', borderColor: `${subcategoryColor}60` }}>
            <div className="h-10 w-10 animate-spin rounded-full border-4" style={{ borderColor: `${subcategoryColor}30`, borderTopColor: subcategoryColor }} />
            <span className="text-base font-semibold">Procesando cursos...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({
  course, selectedSubcategory, isSelected, onSelect, onEdit, onDelete, onFreeze, onUnfreeze, onToggleVisible, onScheduleManager,
  getStatusColor, getStatusIcon, getCourseById, loading
}) => {
  const canDelete = course.schedulesCount === 0;
  const isDisabled = course.isFrozen || selectedSubcategory?.isFrozen;
  const totalHours = course.hours.theory + course.hours.practice + course.hours.lab;
  const statusColor = getStatusColor(course);

  return (
    <div
      onClick={onSelect}
      style={{
        borderColor: isSelected ? statusColor : `${statusColor}60`,
        boxShadow: isSelected ? `0 8px 30px ${statusColor}40` : 'none',
      }}
      className={`relative overflow-hidden rounded-2xl border-2 bg-surface p-6 transition-all ${
        isDisabled || loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:-translate-y-1'
      } ${isSelected ? 'scale-[1.02]' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: statusColor }} />
      <div className="absolute right-3 top-3 text-xl">{getStatusIcon(course)}</div>

      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-md px-2 py-1 text-xs font-semibold" style={{ background: `${statusColor}20`, color: statusColor }}>{course.code}</span>
          <span className="text-xs text-muted">{course.credits} créditos • {totalHours}h</span>
        </div>
        <h3 className="m-0 text-lg font-bold text-ink">{course.name}</h3>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted">{course.description || 'Sin descripción disponible'}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          disabled={loading}
          onClick={(e) => { e.stopPropagation(); onScheduleManager(); }}
          style={{ background: `${statusColor}20`, color: statusColor }}
          className="rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-60"
        >
          📅 Horarios ({course.schedulesCount})
        </button>

        {!isDisabled && (
          <>
            <button disabled={loading} onClick={(e) => { e.stopPropagation(); onEdit(course); }} className="rounded-md bg-good/20 px-3 py-1.5 text-xs font-medium text-good disabled:opacity-60">✏️ Editar</button>
            <button disabled={loading} onClick={(e) => { e.stopPropagation(); onFreeze(course); }} className="rounded-md bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted disabled:opacity-60">❄️ Congelar</button>
            <button
              disabled={loading}
              onClick={(e) => { e.stopPropagation(); onToggleVisible(course.id); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${course.isVisible ? 'bg-warn/20 text-warn' : 'bg-good/20 text-good'}`}
            >
              {course.isVisible ? '🙈 Ocultar' : '👁️ Mostrar'}
            </button>
          </>
        )}

        {course.isFrozen && !selectedSubcategory?.isFrozen && (
          <button disabled={loading} onClick={(e) => { e.stopPropagation(); onUnfreeze(course); }} className="rounded-md bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent disabled:opacity-60">🔥 Descongelar</button>
        )}

        {canDelete && !isDisabled && (
          <button disabled={loading} onClick={(e) => { e.stopPropagation(); onDelete(course); }} className="rounded-md bg-bad/20 px-3 py-1.5 text-xs font-medium text-bad disabled:opacity-60">🗑️ Eliminar</button>
        )}
      </div>

      {(course.prerequisites.length > 0 || course.minGradePrereqs.length > 0 || course.corequisites.length > 0) && (
        <div className="mb-3 rounded-lg bg-bg p-3">
          <h5 className="mb-2 text-xs font-semibold text-muted">🔗 Requisitos</h5>
          <div className="flex flex-col gap-1 text-[11px]">
            {course.prerequisites.length > 0 && (
              <div>
                <span className="text-good">Prerrequisitos: </span>
                <span className="text-muted">{course.prerequisites.map(prereqId => getCourseById(prereqId).code).join(', ')}</span>
              </div>
            )}
            {course.minGradePrereqs.length > 0 && (
              <div>
                <span className="text-warn">Nota mínima: </span>
                <span className="text-muted">{course.minGradePrereqs.map(prereq => `${getCourseById(prereq.courseId).code} (≥${prereq.minGrade})`).join(', ')}</span>
              </div>
            )}
            {course.corequisites.length > 0 && (
              <div>
                <span className="text-accent">Correquisitos: </span>
                <span className="text-muted">{course.corequisites.map(coreqId => getCourseById(coreqId).code).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!canDelete && !isDisabled && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-line/20 px-3 py-2 text-xs text-muted">
          <span>⚠️</span>
          No se puede eliminar: tiene horarios programados
        </div>
      )}

      {isSelected && <div className="absolute bottom-3 right-3 text-sm" style={{ color: statusColor }}>✨ Seleccionado</div>}
      {!isDisabled && !isSelected && <div className="absolute bottom-3 right-3 text-sm opacity-60" style={{ color: statusColor }}>👆 Clic para detalles</div>}
    </div>
  );
};

const CourseDetailsPanel = ({ course, schedules, selectedSubcategory, onClose, onScheduleManager, getStatusColor, getCourseById, loading }) => {
  const totalHours = course.hours.theory + course.hours.practice + course.hours.lab;
  const statusColor = getStatusColor(course);

  return (
    <div className="sticky top-5 h-fit rounded-2xl border bg-surface p-6" style={{ borderColor: `${statusColor}60` }}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <span className="mb-2 inline-block rounded-md px-2 py-1 text-xs font-semibold" style={{ background: `${statusColor}20`, color: statusColor }}>{course.code}</span>
          <h3 className="m-0 mb-2 text-xl font-bold" style={{ color: statusColor }}>📚 {course.name}</h3>
          <p className="m-0 text-sm leading-snug text-muted">{course.description}</p>
        </div>
        <button disabled={loading} onClick={onClose} className="rounded-md bg-bg px-2.5 py-1.5 text-sm font-medium text-muted hover:text-ink disabled:opacity-60">✕</button>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: `${statusColor}20`, color: statusColor }}>
          {course.isFrozen || selectedSubcategory?.isFrozen ? '❄️ Congelado' : !course.isVisible ? '🙈 Oculto' : '✅ Visible'}
        </span>
        <span className="rounded-full bg-line/60 px-2 py-1 text-xs font-semibold text-muted">{course.credits} créditos • {totalHours}h</span>
      </div>

      <div className="mb-5 rounded-lg bg-bg p-4">
        <h4 className="mb-3 text-sm font-semibold text-muted">⏰ Distribución de Horas</h4>
        <div className="grid grid-cols-3 gap-3">
          {[['theory', 'Teoría'], ['practice', 'Práctica'], ['lab', 'Laboratorio']].map(([key, label]) => (
            <div key={key} className="text-center">
              <div className="text-lg font-bold" style={{ color: statusColor }}>{course.hours[key]}h</div>
              <div className="text-xs text-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {(course.prerequisites.length > 0 || course.minGradePrereqs.length > 0 || course.corequisites.length > 0) && (
        <div className="mb-5">
          <h4 className="mb-3 text-sm font-semibold text-muted">🔗 Requisitos</h4>
          <div className="flex flex-col gap-2 rounded-lg bg-bg p-3 text-[13px]">
            {course.prerequisites.length > 0 && (
              <div>
                <span className="font-semibold text-good">Prerrequisitos: </span>
                <span className="text-muted">{course.prerequisites.map(prereqId => getCourseById(prereqId).code).join(', ')}</span>
              </div>
            )}
            {course.minGradePrereqs.length > 0 && (
              <div>
                <span className="font-semibold text-warn">Nota mínima: </span>
                <span className="text-muted">{course.minGradePrereqs.map(prereq => `${getCourseById(prereq.courseId).code} (≥${prereq.minGrade})`).join(', ')}</span>
              </div>
            )}
            {course.corequisites.length > 0 && (
              <div>
                <span className="font-semibold text-accent">Correquisitos: </span>
                <span className="text-muted">{course.corequisites.map(coreqId => getCourseById(coreqId).code).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-5">
        <h4 className="mb-3 text-sm font-semibold text-muted">📅 Horarios Programados ({schedules.length})</h4>
        {schedules.length > 0 ? (
          <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto">
            {schedules.map(schedule => (
              <div key={schedule.id} className="rounded-lg bg-bg p-3 transition-colors hover:bg-surface-2" style={{ border: `1px solid ${statusColor}30` }}>
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded px-1.5 py-0.5 text-xs font-semibold" style={{ color: statusColor, background: `${statusColor}20` }}>{schedule.cycle}</span>
                    <span className="text-sm font-medium text-ink">{schedule.name}</span>
                  </div>
                  <span className="text-xs text-muted">{schedule.enrolledStudents} estudiantes</span>
                </div>
                <div className="mb-1 text-xs text-muted">📍 {schedule.classroom} • 👨‍🏫 {schedule.professors.join(', ')}</div>
                <div className="text-xs text-ink">⏰ {schedule.days.join(' • ')}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-center text-sm italic text-muted">No hay horarios programados</div>
        )}
      </div>

      <button
        onClick={onScheduleManager}
        disabled={loading}
        style={{ background: `linear-gradient(135deg, ${statusColor}, ${statusColor}80)` }}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>📅</span>
        Gestionar Horarios
      </button>
    </div>
  );
};

const ScheduleManagerPanel = ({ course, schedules: initialSchedules, selectedSubcategory, onClose, onBackToDetails, loading }) => {
  const [schedules] = useState(initialSchedules || []);
  const [expandedCycle, setExpandedCycle] = useState(null);
  const subcategoryColor = selectedSubcategory?.color || 'var(--t-accent-deep)';

  const schedulesByCycle = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.cycle]) acc[schedule.cycle] = [];
    acc[schedule.cycle].push(schedule);
    return acc;
  }, {});

  return (
    <div className="sticky top-5 max-h-[90vh] overflow-y-auto rounded-2xl border bg-surface p-6" style={{ borderColor: `${subcategoryColor}60` }}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="m-0 text-xl font-bold" style={{ color: subcategoryColor }}>📅 Horarios</h3>
        <div className="flex gap-2">
          <button disabled={loading} onClick={onBackToDetails} className="rounded-md bg-line/40 px-2.5 py-1.5 text-xs text-muted disabled:opacity-60">← Detalles</button>
          <button disabled={loading} onClick={onClose} className="rounded-md bg-bad/20 px-2.5 py-1.5 text-xs text-bad disabled:opacity-60">✕ Cerrar</button>
        </div>
      </div>

      <div className="mb-5 rounded-lg bg-bg p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md px-2 py-1 text-xs font-semibold" style={{ background: `${subcategoryColor}20`, color: subcategoryColor }}>{course.code}</span>
          <span className="text-xs text-muted">{course.credits} créditos</span>
        </div>
        <h4 className="m-0 text-base font-semibold text-ink">{course.name}</h4>
      </div>

      <div className="flex flex-col gap-4">
        {Object.keys(schedulesByCycle).length === 0 ? (
          <div className="p-10 text-center text-muted">
            <div className="mb-4 text-5xl">📅</div>
            <h4>No hay horarios programados</h4>
            <p>Este curso aún no tiene horarios asignados</p>
          </div>
        ) : (
          Object.keys(schedulesByCycle).map(cycle => (
            <ReadOnlyCycleCard
              key={cycle}
              cycle={cycle}
              schedules={schedulesByCycle[cycle]}
              isExpanded={expandedCycle === cycle}
              onToggleExpand={() => setExpandedCycle(expandedCycle === cycle ? null : cycle)}
              subcategoryColor={subcategoryColor}
            />
          ))
        )}
      </div>
    </div>
  );
};

const ReadOnlyCycleCard = ({ cycle, schedules, isExpanded, onToggleExpand, subcategoryColor }) => {
  const totalStudents = schedules.reduce((total, schedule) => total + schedule.enrolledStudents, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-2">
      <div onClick={onToggleExpand} className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent/5">
        <div>
          <h4 className="m-0 mb-1 text-base font-bold text-accent">📅 Ciclo {cycle}</h4>
          <p className="m-0 text-xs text-muted">{schedules.length} horario{schedules.length !== 1 ? 's' : ''} • {totalStudents} estudiante{totalStudents !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-sm text-accent transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
      </div>

      {isExpanded && (
        <div className="border-t border-line/40 p-4">
          {schedules.length === 0 ? (
            <div className="p-6 text-center text-muted">
              <div className="mb-2 text-2xl">📅</div>
              <p className="text-xs">No hay horarios programados para este ciclo</p>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {schedules.map(schedule => (
                <ReadOnlyScheduleCard key={schedule.id} schedule={schedule} subcategoryColor={subcategoryColor} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const ReadOnlyScheduleCard = ({ schedule, subcategoryColor }) => {
  const formatTimeRange = (days) => days.map(day => `${day.day} ${day.startTime}-${day.endTime}`).join(', ');

  return (
    <div className="rounded-lg border border-line bg-bg p-3 transition-transform hover:-translate-y-0.5">
      <h5 className="m-0 mb-2 text-sm font-semibold text-ink">{schedule.name}</h5>
      <div className="flex flex-col gap-1 text-xs">
        <div><span className="text-muted">⏰ </span><span className="text-ink">{formatTimeRange(schedule.days)}</span></div>
        {schedule.classroom && <div><span className="text-muted">🏫 </span><span className="text-ink">{schedule.classroom}</span></div>}
        <div><span className="text-muted">👨‍🏫 </span><span className="text-ink">{schedule.professors.length > 0 ? schedule.professors.join(', ') : 'Sin asignar'}</span></div>
      </div>
      <div className="mt-2.5 rounded bg-surface-2 p-1.5">
        <div className="grid grid-cols-7 gap-0.5 text-[8px]">
          {DAY_LETTERS.map((day, index) => {
            const hasClass = schedule.days.some(d => d.day === DAY_NAMES[index]);
            return (
              <div
                key={day}
                className="rounded-sm py-1 text-center font-medium"
                style={{ background: hasClass ? subcategoryColor : 'var(--t-line)', color: hasClass ? '#fff' : 'var(--t-muted)' }}
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

const CourseForm = ({ newCourse, setNewCourse, selectedSubcategory, allCourses, editingCourse, onSave, onCancel, getCourseById, loading }) => {
  const [selectedPrerequisite, setSelectedPrerequisite] = useState('');
  const [selectedCorequisite, setSelectedCorequisite] = useState('');
  const [minGradeEntry, setMinGradeEntry] = useState({ courseId: '', minGrade: 13 });
  const subcategoryColor = selectedSubcategory?.color || 'var(--t-accent-deep)';

  const addPrerequisite = () => {
    if (selectedPrerequisite && !newCourse.prerequisites.includes(selectedPrerequisite)) {
      setNewCourse({ ...newCourse, prerequisites: [...newCourse.prerequisites, selectedPrerequisite] });
      setSelectedPrerequisite('');
    }
  };
  const removePrerequisite = (prereqId) => setNewCourse({ ...newCourse, prerequisites: newCourse.prerequisites.filter(id => id !== prereqId) });

  const addCorequisite = () => {
    if (selectedCorequisite && !newCourse.corequisites.includes(selectedCorequisite)) {
      setNewCourse({ ...newCourse, corequisites: [...newCourse.corequisites, selectedCorequisite] });
      setSelectedCorequisite('');
    }
  };
  const removeCorequisite = (coreqId) => setNewCourse({ ...newCourse, corequisites: newCourse.corequisites.filter(id => id !== coreqId) });

  const addMinGradePrereq = () => {
    if (minGradeEntry.courseId && minGradeEntry.minGrade) {
      const exists = newCourse.minGradePrereqs.find(p => p.courseId === minGradeEntry.courseId);
      if (!exists) {
        setNewCourse({ ...newCourse, minGradePrereqs: [...newCourse.minGradePrereqs, { ...minGradeEntry }] });
        setMinGradeEntry({ courseId: '', minGrade: 13 });
      }
    }
  };
  const removeMinGradePrereq = (courseId) => setNewCourse({ ...newCourse, minGradePrereqs: newCourse.minGradePrereqs.filter(p => p.courseId !== courseId) });

  return (
    <div className="mb-6 rounded-2xl border p-6" style={{ borderColor: `${subcategoryColor}40`, background: `${subcategoryColor}0D` }}>
      <h3 className="mb-5 text-xl font-bold" style={{ color: subcategoryColor }}>{editingCourse ? '✏️ Editar Curso' : '➕ Nuevo Curso'}</h3>

      <div className="mb-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label className={LABEL_CLASS}>Código del curso *</label>
          <input type="text" placeholder="Ej: MAT101, FIS102..." value={newCourse.code} disabled={loading}
            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Créditos</label>
          <input type="number" min="1" max="10" step="0.5" value={newCourse.credits} disabled={loading}
            onChange={(e) => setNewCourse({ ...newCourse, credits: parseFloat(e.target.value) || 1 })} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Ciclo correspondiente</label>
          <input type="number" min="1" max="12" value={newCourse.cycle} disabled={loading}
            onChange={(e) => setNewCourse({ ...newCourse, cycle: parseInt(e.target.value) || 1 })} className={INPUT_CLASS} />
        </div>
      </div>

      <div className="mb-5">
        <label className={LABEL_CLASS}>Nombre del curso *</label>
        <input type="text" placeholder="Ej: Cálculo Diferencial, Física Mecánica..." value={newCourse.name} disabled={loading}
          onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} className={INPUT_CLASS} />
      </div>

      <div className="mb-5">
        <label className={LABEL_CLASS}>Descripción</label>
        <textarea placeholder="Descripción del contenido y objetivos del curso..." value={newCourse.description} disabled={loading}
          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} rows={3} className={`${INPUT_CLASS} resize-y`} />
      </div>

      <div className="mb-5">
        <label className="mb-3 block text-sm text-muted">Distribución de horas semanales</label>
        <div className="grid grid-cols-3 gap-3">
          {[['theory', 'Teoría'], ['practice', 'Práctica'], ['lab', 'Laboratorio']].map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs text-muted">{label}</label>
              <input
                type="number" min="0" max="10" value={newCourse.hours[key]} disabled={loading}
                onChange={(e) => setNewCourse({ ...newCourse, hours: { ...newCourse.hours, [key]: parseInt(e.target.value) || 0 } })}
                className={INPUT_CLASS}
              />
            </div>
          ))}
        </div>
      </div>

      <RequirementPicker
        label="Prerrequisitos"
        options={allCourses.filter(course => !newCourse.prerequisites.includes(course.id))}
        selected={selectedPrerequisite}
        setSelected={setSelectedPrerequisite}
        onAdd={addPrerequisite}
        loading={loading}
        colorClass="good"
        tags={newCourse.prerequisites.map(prereqId => ({ key: prereqId, label: getCourseById(prereqId).code, onRemove: () => removePrerequisite(prereqId) }))}
      />

      <div className="mb-5">
        <label className={LABEL_CLASS}>Prerrequisitos con nota mínima</label>
        <div className="mb-2 flex flex-wrap gap-2">
          <select value={minGradeEntry.courseId} disabled={loading} onChange={(e) => setMinGradeEntry({ ...minGradeEntry, courseId: e.target.value })} className="rounded-md border border-line bg-bg px-3 py-2 text-xs text-ink outline-none disabled:opacity-60">
            <option value="">Seleccionar curso...</option>
            {allCourses.filter(course => !newCourse.minGradePrereqs.find(p => p.courseId === course.id)).map(course => (
              <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
            ))}
          </select>
          <input
            type="number" min="10" max="20" value={minGradeEntry.minGrade} disabled={loading}
            onChange={(e) => setMinGradeEntry({ ...minGradeEntry, minGrade: parseInt(e.target.value) || 13 })}
            placeholder="Nota mín." className="w-20 rounded-md border border-line bg-bg px-3 py-2 text-xs text-ink outline-none disabled:opacity-60"
          />
          <button onClick={addMinGradePrereq} disabled={loading || !minGradeEntry.courseId} className="rounded-md bg-warn px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50">+ Agregar</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {newCourse.minGradePrereqs.map(prereq => {
            const course = getCourseById(prereq.courseId);
            return (
              <span key={prereq.courseId} className="flex items-center gap-1 rounded-full bg-warn/20 px-2 py-1 text-xs text-warn">
                {course.code} (≥{prereq.minGrade})
                <button onClick={() => removeMinGradePrereq(prereq.courseId)} disabled={loading} className="text-warn disabled:opacity-60">×</button>
              </span>
            );
          })}
        </div>
      </div>

      <RequirementPicker
        label="Correquisitos"
        options={allCourses.filter(course => !newCourse.corequisites.includes(course.id))}
        selected={selectedCorequisite}
        setSelected={setSelectedCorequisite}
        onAdd={addCorequisite}
        loading={loading}
        colorClass="accent"
        tags={newCourse.corequisites.map(coreqId => ({ key: coreqId, label: getCourseById(coreqId).code, onRemove: () => removeCorequisite(coreqId) }))}
      />

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} disabled={loading} className="rounded-lg border border-line px-5 py-2.5 text-sm text-muted hover:bg-bg disabled:opacity-60">Cancelar</button>
        <button
          onClick={onSave}
          disabled={loading || !newCourse.name.trim() || !newCourse.code.trim()}
          style={{ background: (!newCourse.name.trim() || !newCourse.code.trim() || loading) ? undefined : `linear-gradient(135deg, ${subcategoryColor}, ${subcategoryColor}80)` }}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {editingCourse ? 'Actualizar' : 'Crear'} Curso
        </button>
      </div>
    </div>
  );
};

const RequirementPicker = ({ label, options, selected, setSelected, onAdd, loading, colorClass, tags }) => (
  <div className="mb-5">
    <label className={LABEL_CLASS}>{label}</label>
    <div className="mb-2 flex flex-wrap gap-2">
      <select value={selected} disabled={loading} onChange={(e) => setSelected(e.target.value)} className="rounded-md border border-line bg-bg px-3 py-2 text-xs text-ink outline-none disabled:opacity-60">
        <option value="">Seleccionar curso...</option>
        {options.map(course => <option key={course.id} value={course.id}>{course.code} - {course.name}</option>)}
      </select>
      <button
        onClick={onAdd}
        disabled={loading || !selected}
        className={`rounded-md px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50 ${colorClass === 'good' ? 'bg-good' : 'bg-accent'}`}
      >
        + Agregar
      </button>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {tags.map(tag => (
        <span key={tag.key} className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${colorClass === 'good' ? 'bg-good/20 text-good' : 'bg-accent/20 text-accent'}`}>
          {tag.label}
          <button onClick={tag.onRemove} disabled={loading} className="disabled:opacity-60">×</button>
        </span>
      ))}
    </div>
  </div>
);

const MODAL_CONFIG = {
  freeze: { colorVar: '--t-muted', colorClass: 'text-muted', bgClass: 'bg-muted', icon: '❄️', title: 'Congelar', action: 'congelar' },
  unfreeze: { colorVar: '--t-accent', colorClass: 'text-accent', bgClass: 'bg-accent', icon: '🔥', title: 'Descongelar', action: 'descongelar' },
  delete: { colorVar: '--t-bad', colorClass: 'text-bad', bgClass: 'bg-bad', icon: '🗑️', title: 'Eliminar', action: 'eliminar' },
};

const ConfirmationModal = ({ type, item, itemType, timer, canConfirm, onConfirm, onCancel, loading }) => {
  const cfg = MODAL_CONFIG[type] || MODAL_CONFIG.delete;
  const itemLabel = itemType === 'curso' ? 'el curso' : 'la subcategoría';
  const message = `¿Estás seguro de que deseas ${cfg.action} ${itemLabel} "${item.name || item.code}"?`;
  const warning = type === 'delete'
    ? `Esta acción es irreversible. ${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} será eliminado permanentemente.`
    : type === 'freeze'
      ? `${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} será congelado y no se podrán realizar modificaciones.`
      : `${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} será descongelado y se podrán realizar modificaciones.`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border-2 bg-surface p-8" style={{ borderColor: `var(${cfg.colorVar})` }}>
        <div className="mb-6 text-center">
          <div className="mb-4 text-5xl">{cfg.icon}</div>
          <h3 className={`mb-2 text-2xl font-bold ${cfg.colorClass}`}>{cfg.title}</h3>
          <p className="text-base leading-relaxed text-ink">{message}</p>
        </div>

        <div className="mb-6 rounded-xl border p-4" style={{ borderColor: `var(${cfg.colorVar})30`, background: `var(${cfg.colorVar})15` }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <p className="m-0 text-sm leading-relaxed text-warn">{warning}</p>
          </div>
        </div>

        {timer > 0 && (
          <div className="mb-6 flex justify-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 border-line ${cfg.colorClass}`} style={{ borderTopColor: `var(${cfg.colorVar})` }}>
              <span className="text-2xl font-bold">{timer}</span>
            </div>
          </div>
        )}

        {canConfirm && <div className="mb-5 text-center text-sm font-semibold text-good">✅ Ya puedes confirmar la acción</div>}

        <div className="flex justify-center gap-3">
          <button disabled={loading} onClick={onCancel} className="rounded-lg border border-line px-6 py-3 text-sm font-semibold text-muted hover:bg-bg disabled:opacity-60">Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            className={`rounded-lg px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted ${canConfirm ? cfg.bgClass : ''}`}
          >
            {cfg.action.charAt(0).toUpperCase() + cfg.action.slice(1)} {itemType}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursesTab;
