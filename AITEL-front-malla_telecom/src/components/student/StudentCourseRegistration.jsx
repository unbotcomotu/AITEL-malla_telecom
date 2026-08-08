import React, { useState, useMemo, useEffect } from 'react';
import { CourseRegistrationApi } from '../../services/student/courseRegistrationApi';
import { SystemApi } from '../../services/student/systemApi';

const CARD = 'mx-auto rounded-2xl border border-line bg-surface p-8';

// Orden cronológico real de un semestre dentro de su año: 1° ciclo, 2° ciclo, luego verano (-0).
const semesterOrderKey = (semester) => {
  const [year, cycle] = semester.split('-').map(Number);
  const cycleOrder = cycle === 1 ? 0 : cycle === 2 ? 1 : 2;
  return year * 3 + cycleOrder;
};

const buildSemesterSequence = (startingSemester, currentCycle) => {
  if (!startingSemester || !currentCycle) return [];

  const sequence = [];
  const [startYear, startCycle] = startingSemester.split('-').map(Number);
  let currentYear = startYear;
  let cycleCursor = startCycle;

  const [currentAcademicYear, currentAcademicCycle] = currentCycle.split('-').map(Number);

  while (currentYear < currentAcademicYear ||
         (currentYear === currentAcademicYear && cycleCursor <= currentAcademicCycle)) {
    sequence.push(`${currentYear}-${cycleCursor}`);

    if (cycleCursor === 1) {
      cycleCursor = 2;
    } else if (cycleCursor === 2) {
      cycleCursor = 0;
      currentYear++;
    } else {
      cycleCursor = 1;
    }
  }

  return sequence;
};

const StudentCourseRegistration = () => {
  const [currentStep, setCurrentStep] = useState('initial'); // 'initial', 'semester', 'completed'
  const [startingSemester, setStartingSemester] = useState('');
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const [registeredSemesters, setRegisteredSemesters] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCycle, setCurrentCycle] = useState('');

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { currentCycle } = await SystemApi.getCurrentAcademicCycle();
      setCurrentCycle(currentCycle);

      // El backend devuelve un array (List<SemesterHistoryEntry>); el resto del componente
      // trabaja con un objeto indexado por semestre (igual que al registrar uno nuevo).
      const registered = await CourseRegistrationApi.getRegisteredSemesters();
      const registeredMap = Array.isArray(registered)
        ? Object.fromEntries(registered.map(entry => [entry.semester, entry]))
        : registered;
      setRegisteredSemesters(registeredMap);
    } catch (err) {
      setError(`Error al cargar datos del sistema: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const availableSemesters = useMemo(() => {
    const semesters = [];
    for (let year = 2018; year <= 2025; year++) {
      semesters.push(`${year}-1`, `${year}-2`);
      if (year >= 2019) semesters.push(`${year}-0`);
    }
    return semesters.sort().reverse();
  }, []);

  const semesterSequence = useMemo(
    () => buildSemesterSequence(startingSemester, currentCycle),
    [startingSemester, currentCycle]
  );

  // El backend identifica los cursos de un semestre por el ciclo curricular (1-10),
  // no por el período académico ("2020-1"). Los ciclos de verano ("-0") no avanzan
  // el ciclo curricular, y tampoco lo hace un semestre marcado como suspendido
  // (un alumno atrasado puede llevar un curso de ciclo 6 en su 7mo semestre real).
  const semesterCycles = useMemo(() => {
    let cycle = 0;
    return semesterSequence.map(sem => {
      const isVerano = sem.endsWith('-0');
      const isSuspended = Boolean(registeredSemesters[sem]?.suspended);
      if (!isVerano && !isSuspended) cycle += 1;
      return cycle || 1;
    });
  }, [semesterSequence, registeredSemesters]);

  const currentSemester = semesterSequence[currentSemesterIndex] || '';
  const currentAcademicCycle = semesterCycles[currentSemesterIndex] || 1;
  const isLastSemester = currentSemesterIndex >= semesterSequence.length - 1;
  const isCurrentAcademicCycle = currentSemester === currentCycle;

  const handleStartRegistration = () => {
    if (!startingSemester) {
      alert('Por favor selecciona tu primer semestre');
      return;
    }
    setCurrentStep('semester');
  };

  const handleResumeRegistration = () => {
    const registeredKeys = Object.keys(registeredSemesters);
    if (registeredKeys.length === 0) return;

    const earliest = registeredKeys.reduce((min, s) => (semesterOrderKey(s) < semesterOrderKey(min) ? s : min));
    const sequence = buildSemesterSequence(earliest, currentCycle);
    const nextIndex = sequence.findIndex(sem => !registeredKeys.includes(sem));

    setStartingSemester(earliest);
    if (nextIndex === -1) {
      // Ya se registraron todos los semestres hasta el ciclo académico actual.
      setCurrentSemesterIndex(Math.max(sequence.length - 1, 0));
      setCurrentStep('completed');
    } else {
      setCurrentSemesterIndex(nextIndex);
      setCurrentStep('semester');
    }
  };

  const handleResetHistory = async () => {
    const confirmado = window.confirm(
      'Esto borrará TODOS los semestres y cursos que ya registraste, para que puedas empezar el registro desde cero. Esta acción no se puede deshacer. ¿Continuar?'
    );
    if (!confirmado) return;

    setLoading(true);
    setError(null);
    try {
      await CourseRegistrationApi.resetAcademicHistory();
      setRegisteredSemesters({});
    } catch (err) {
      setError(`Error al reiniciar el registro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSemester = async (semesterData) => {
    setLoading(true);
    setError(null);

    try {
      if (!semesterData.suspended && semesterData.courses.length > 0) {
        // Cursos aprobados en semestres previos + los que se estan llevando en este mismo
        // semestre (necesario para que los correquisitos del mismo semestre se den por cumplidos).
        const previousCourseIds = Object.values(registeredSemesters).flatMap(s => (s.courses || []).map(c => c.id));
        const currentCourseIds = semesterData.courses.map(c => c.courseId);

        for (const course of semesterData.courses) {
          if (!course.exception) {
            const validation = await CourseRegistrationApi.validatePrerequisites(
              course.courseId,
              [...previousCourseIds, ...currentCourseIds]
            );

            if (!validation.valid) {
              setValidationErrors(validation.errors);
              setLoading(false);
              return;
            }
          }
        }
      }

      const savedSemester = await CourseRegistrationApi.registerSemester(currentSemester, semesterData);

      setRegisteredSemesters(prev => ({ ...prev, [currentSemester]: savedSemester }));
      setValidationErrors([]);

      if (isLastSemester) {
        await CourseRegistrationApi.completeRegistration();
        setCurrentStep('completed');
      } else {
        setCurrentSemesterIndex(prev => prev + 1);
      }
    } catch (err) {
      setError(`Error al registrar semestre: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderInitialStep = () => (
    <div className={`${CARD} max-w-xl`}>
      <div className="mb-8 text-center">
        <h2 className="m-0 mb-3 font-display text-3xl font-bold tracking-tight text-ink">📚 Registro de Cursos Académicos</h2>
        <p className="m-0 text-base text-muted">Registra tu historial académico semestre por semestre</p>
      </div>

      {Object.keys(registeredSemesters).length > 0 && (
        <div className="mb-8 rounded-xl border border-accent/30 bg-accent/10 p-5">
          <div className="mb-2 text-base font-semibold text-accent">
            📖 Ya tienes {Object.keys(registeredSemesters).length} semestre{Object.keys(registeredSemesters).length !== 1 ? 's' : ''} registrado{Object.keys(registeredSemesters).length !== 1 ? 's' : ''}
          </div>
          <p className="m-0 mb-3 text-sm text-ink">
            Puedes continuar tu registro justo donde te quedaste, o reiniciarlo desde cero si fue un intento incompleto o con errores.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleResumeRegistration}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-on-accent hover:opacity-90"
            >
              ▶️ Continuar donde me quedé
            </button>
            <button
              onClick={handleResetHistory}
              className="rounded-lg border border-warn/40 bg-warn/20 px-4 py-2 text-sm font-semibold text-warn hover:bg-warn/30"
            >
              🗑️ Reiniciar registro desde cero
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <label className="mb-3 block text-base font-semibold text-ink">
          ¿Cuál fue tu primer semestre en la universidad?
        </label>
        <select
          value={startingSemester}
          onChange={(e) => setStartingSemester(e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-line bg-bg px-5 py-4 text-base text-ink outline-none focus:border-accent"
        >
          <option value="">Selecciona tu primer semestre...</option>
          {availableSemesters.map(semester => (
            <option key={semester} value={semester}>
              {semester.endsWith('-0') ? `Verano ${semester.split('-')[0]}` : semester}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8 rounded-xl border border-accent/30 bg-accent/10 p-5">
        <div className="mb-2 text-base font-semibold text-accent">💡 ¿Qué vas a registrar?</div>
        <ul className="m-0 list-disc pl-5 text-sm text-ink">
          <li>Los cursos que llevaste en cada semestre</li>
          <li>Las notas que obtuviste (para validar prerrequisitos)</li>
          <li>Excepciones de matrícula cuando aplique</li>
          <li>Semestres suspendidos (si los hubo)</li>
        </ul>
      </div>

      <button
        onClick={handleStartRegistration}
        disabled={!startingSemester}
        className="w-full rounded-xl bg-accent px-6 py-4 text-base font-semibold text-ink-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:opacity-100"
      >
        🚀 Comenzar Registro
      </button>
    </div>
  );

  const renderSemesterStep = () => (
    <div className={`${CARD} max-w-[1000px]`}>
      <SemesterRegistrationForm
        key={currentSemester}
        semester={currentSemester}
        academicCycle={currentAcademicCycle}
        semesterIndex={currentSemesterIndex}
        totalSemesters={semesterSequence.length}
        isCurrentCycle={isCurrentAcademicCycle}
        onRegister={handleRegisterSemester}
        onBack={() => {
          if (currentSemesterIndex > 0) {
            setCurrentSemesterIndex(prev => prev - 1);
          } else {
            setCurrentStep('initial');
          }
        }}
        validationErrors={validationErrors}
        previousSemesters={registeredSemesters}
      />
    </div>
  );

  const renderCompletedStep = () => (
    <div className={`${CARD} max-w-xl text-center`}>
      <div className="mb-6 text-6xl">🎉</div>
      <h2 className="m-0 mb-4 font-display text-3xl font-bold text-good">¡Registro Completado!</h2>
      <p className="mb-8 text-base leading-relaxed text-ink">
        Has registrado exitosamente tu historial académico. Ahora puedes visualizar tu malla curricular
        con todos tus cursos aprobados y planificar tu ruta académica.
      </p>

      <div className="mb-8 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="rounded-xl border border-good/30 bg-good/10 p-5">
          <div className="mb-2 text-2xl font-bold text-good">{Object.keys(registeredSemesters).length}</div>
          <div className="text-sm text-ink">Semestres registrados</div>
        </div>

        <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
          <div className="mb-2 text-2xl font-bold text-accent">
            {Object.values(registeredSemesters).reduce((total, semester) => total + (semester.courses?.length || 0), 0)}
          </div>
          <div className="text-sm text-ink">Cursos registrados</div>
        </div>
      </div>

      <button
        onClick={() => { window.location.href = '/curriculum'; }}
        className="w-full rounded-xl bg-good px-6 py-4 text-base font-semibold text-ink-on-accent transition-opacity hover:opacity-90"
      >
        🗺️ Ver Mi Malla Curricular
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-ink">
      {currentStep === 'initial' && renderInitialStep()}
      {currentStep === 'semester' && renderSemesterStep()}
      {currentStep === 'completed' && renderCompletedStep()}

      {loading && (
        <div className="fixed right-5 top-5 z-[1000] flex items-center gap-3 rounded-xl bg-accent px-5 py-3 text-ink-on-accent shadow-lg">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-on-accent/30 border-t-ink-on-accent" />
          Guardando...
        </div>
      )}

      {error && (
        <div className="fixed left-1/2 top-5 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-xl border border-bad bg-bad px-6 py-4 text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

const SemesterRegistrationForm = ({
  semester,
  academicCycle,
  semesterIndex,
  totalSemesters,
  isCurrentCycle,
  onRegister,
  onBack,
  validationErrors,
  previousSemesters,
}) => {
  const [semesterData, setSemesterData] = useState({ courses: [], suspended: false, notes: '' });
  const [showElectiveOptions, setShowElectiveOptions] = useState({});
  const [availableCourses, setAvailableCourses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAvailableCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester]);

  const loadAvailableCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const courses = await CourseRegistrationApi.getAvailableCoursesForSemester(academicCycle);
      setAvailableCourses(courses);
    } catch (err) {
      setError(`Error al cargar cursos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleElectiveOptions = (subcategoryId) => {
    setShowElectiveOptions(prev => ({ ...prev, [subcategoryId]: !prev[subcategoryId] }));
  };

  const handleAddCourse = (course) => {
    const newCourse = {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      credits: course.credits,
      grade: isCurrentCycle ? null : 11,
      exception: false,
      isElective: course.isElective || false,
      subcategoryId: course.subcategoryId || null,
      subcategoryName: course.subcategoryName || null
    };

    setSemesterData(prev => ({ ...prev, courses: [...prev.courses, newCourse] }));
  };

  const isCourseTaken = (courseId) => semesterData.courses.some(c => c.courseId === courseId);

  const getSubcategoryProgress = (subcategoryId) => {
    const previousApproved = Object.values(previousSemesters || {}).reduce((count, sem) => {
      const approved = sem.courses?.filter(c => c.subcategoryId === subcategoryId && c.grade >= 11).length || 0;
      return count + approved;
    }, 0);

    const currentApproved = !isCurrentCycle
      ? semesterData.courses.filter(c => c.subcategoryId === subcategoryId && c.grade >= 11).length
      : 0;

    return previousApproved + currentApproved;
  };

  const handleRemoveCourse = (courseId) => {
    setSemesterData(prev => ({ ...prev, courses: prev.courses.filter(c => c.courseId !== courseId) }));
  };

  const handleUpdateGrade = (courseId, grade) => {
    setSemesterData(prev => ({
      ...prev,
      courses: prev.courses.map(c => (c.courseId === courseId ? { ...c, grade: parseInt(grade) } : c))
    }));
  };

  const handleToggleException = (courseId) => {
    setSemesterData(prev => ({
      ...prev,
      courses: prev.courses.map(c => (c.courseId === courseId ? { ...c, exception: !c.exception } : c))
    }));
  };

  const handleSubmit = () => {
    onRegister(semesterData);
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" />
        <p className="text-ink">Cargando cursos disponibles...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-line pb-5">
        <div>
          <h3 className="m-0 mb-1 font-display text-2xl font-bold text-accent">
            📅 Semestre {semester}
            {isCurrentCycle && (
              <span className="ml-3 rounded-full bg-good/15 px-2 py-1 text-xs font-semibold text-good">⚡ ACTUAL</span>
            )}
          </h3>
          <p className="m-0 text-muted">{semester.endsWith('-0') ? 'Ciclo de Verano' : 'Ciclo Regular'}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted">
          <span>Semestre {semesterIndex + 1} de {totalSemesters}</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${((semesterIndex + 1) / totalSemesters) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-bad/40 bg-bad/10 p-4 text-bad">{error}</div>
      )}

      {/* Suspend option */}
      <div className="mb-6 rounded-xl border border-warn/30 bg-warn/10 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={semesterData.suspended}
            onChange={(e) => setSemesterData(prev => ({
              ...prev,
              suspended: e.target.checked,
              courses: e.target.checked ? [] : prev.courses
            }))}
            className="h-[18px] w-[18px] accent-warn"
          />
          <div>
            <span className="text-base font-semibold text-warn">⏸️ Suspendí este semestre</span>
            <p className="m-0 mt-1 text-sm text-ink">Marca esta opción si no llevaste cursos en este semestre</p>
          </div>
        </label>
      </div>

      {!semesterData.suspended && availableCourses && (
        <>
          <CourseSection
            sectionKey="previous"
            title="📌 Cursos Pendientes de Ciclos Anteriores"
            bucket={availableCourses.previousCycleCourses}
            showCycleBadge
            isCourseTaken={isCourseTaken}
            addCourse={handleAddCourse}
            removeCourse={handleRemoveCourse}
            getSubcategoryProgress={getSubcategoryProgress}
            semesterData={semesterData}
            showElectiveOptions={showElectiveOptions}
            toggleElectiveOptions={toggleElectiveOptions}
          />

          <CourseSection
            sectionKey="current"
            title={`Cursos del Ciclo ${academicCycle}`}
            bucket={availableCourses.currentCycleCourses}
            isCourseTaken={isCourseTaken}
            addCourse={handleAddCourse}
            removeCourse={handleRemoveCourse}
            getSubcategoryProgress={getSubcategoryProgress}
            semesterData={semesterData}
            showElectiveOptions={showElectiveOptions}
            toggleElectiveOptions={toggleElectiveOptions}
          />

          <CourseSection
            sectionKey="other"
            title="Otros Cursos (requieren excepción)"
            bucket={availableCourses.otherCourses}
            showCycleBadge
            collapsedByDefault
            isCourseTaken={isCourseTaken}
            addCourse={handleAddCourse}
            removeCourse={handleRemoveCourse}
            getSubcategoryProgress={getSubcategoryProgress}
            semesterData={semesterData}
            showElectiveOptions={showElectiveOptions}
            toggleElectiveOptions={toggleElectiveOptions}
          />

          {semesterData.courses.length > 0 && (
            <div className="mb-8">
              <h4 className="mb-4 text-lg font-semibold text-accent">✅ Cursos Seleccionados ({semesterData.courses.length})</h4>
              <div className="overflow-hidden rounded-xl border border-line bg-bg">
                <div
                  className="grid items-center gap-4 border-b border-line bg-surface-2 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted"
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto' }}
                >
                  <div>Curso</div>
                  <div>Créditos</div>
                  <div>Nota (0-20)</div>
                  <div>Excepción</div>
                  <div />
                </div>
                {semesterData.courses.map((course, index) => (
                  <SelectedCourseRow
                    key={course.courseId}
                    course={course}
                    index={index}
                    isCurrentCycle={isCurrentCycle}
                    onRemove={() => handleRemoveCourse(course.courseId)}
                    onUpdateGrade={(grade) => handleUpdateGrade(course.courseId, grade)}
                    onToggleException={() => handleToggleException(course.courseId)}
                  />
                ))}
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mb-6 rounded-xl border border-bad/30 bg-bad/10 p-4">
              <h5 className="mb-3 text-base font-semibold text-bad">⚠️ Errores de Prerrequisitos</h5>
              <ul className="m-0 list-disc pl-5 text-sm text-bad">
                {validationErrors.map((err, index) => (
                  <li key={index} className="mb-1">{err}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                💡 Tip: Puedes marcar "Excepción de matrícula" en los cursos que llevaste sin cumplir prerrequisitos
              </p>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
        <button onClick={onBack} className="rounded-xl border border-line px-6 py-3 text-sm font-medium text-ink hover:bg-bg">
          ← Anterior
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setSemesterData({ courses: [], suspended: false, notes: '' })}
            className="rounded-xl border border-line px-5 py-3 text-sm text-muted hover:bg-bg"
          >
            🗑️ Limpiar
          </button>

          <button
            onClick={handleSubmit}
            disabled={!semesterData.suspended && semesterData.courses.length === 0}
            className="rounded-xl bg-good px-6 py-3 text-sm font-semibold text-ink-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:opacity-100"
          >
            {semesterData.suspended ? '⏸️ Registrar Suspensión' : '✅ Confirmar Semestre'} →
          </button>
        </div>
      </div>
    </>
  );
};

// Agrupa un "bucket" de cursos pendientes (obligatorios sueltos + subcategorias) bajo un
// encabezado. Se reutiliza 3 veces: ciclos anteriores pendientes, ciclo actual, y el resto.
const CourseSection = ({
  sectionKey,
  title,
  bucket,
  showCycleBadge = false,
  collapsedByDefault = false,
  isCourseTaken,
  addCourse,
  removeCourse,
  getSubcategoryProgress,
  semesterData,
  showElectiveOptions,
  toggleElectiveOptions,
}) => {
  const [collapsed, setCollapsed] = useState(collapsedByDefault);

  const hasObligatory = bucket?.obligatory?.length > 0;
  const mandatorySubcategories = (bucket?.electiveSubcategories || []).filter(s => s.requiresAll);
  const trueElectiveSubcategories = (bucket?.electiveSubcategories || []).filter(s => !s.requiresAll);
  const isEmpty = !hasObligatory && mandatorySubcategories.length === 0 && trueElectiveSubcategories.length === 0;

  if (isEmpty) return null;

  const totalCount = (bucket.obligatory?.length || 0) +
    [...mandatorySubcategories, ...trueElectiveSubcategories].reduce((sum, s) => sum + s.courses.length, 0);

  const groupKey = (subcategoryId) => `${sectionKey}-${subcategoryId}`;

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => collapsedByDefault && setCollapsed(prev => !prev)}
        className={`mb-3 flex w-full items-center justify-between text-left ${collapsedByDefault ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <h4 className="m-0 text-lg font-semibold text-ink">
          {title} <span className="text-sm font-normal text-muted">({totalCount})</span>
        </h4>
        {collapsedByDefault && (
          <span className={`text-muted transition-transform duration-300 ${!collapsed ? 'rotate-180' : ''}`}>▼</span>
        )}
      </button>

      {!collapsed && (
        <>
          {hasObligatory && (
            <div className="mb-6">
              <h5 className="mb-3 text-base text-ink">Cursos Obligatorios</h5>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {bucket.obligatory.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isTaken={isCourseTaken(course.id)}
                    onAdd={() => addCourse(course)}
                    onRemove={() => removeCourse(course.id)}
                    showCycleBadge={showCycleBadge}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Subcategorías con "requiere todos" (ej. EEGGCC, cursos de facultad) son obligatorias,
              no electivas: solo agrupan cursos para mostrar progreso, no implican una elección. */}
          {mandatorySubcategories.length > 0 && (
            <div className="mb-6">
              <h5 className="mb-3 text-base text-ink">Cursos Obligatorios por Grupo</h5>
              {mandatorySubcategories.map(subcategory => (
                <SubcategoryGroup
                  key={subcategory.id}
                  subcategory={subcategory}
                  elective={false}
                  showCycleBadge={showCycleBadge}
                  isOpen={!!showElectiveOptions[groupKey(subcategory.id)]}
                  onToggle={() => toggleElectiveOptions(groupKey(subcategory.id))}
                  approvedCount={getSubcategoryProgress(subcategory.id)}
                  inProgressCount={semesterData.courses.filter(c => c.subcategoryId === subcategory.id).length}
                  isCourseTaken={isCourseTaken}
                  onAddCourse={(course) => addCourse({
                    ...course,
                    isElective: false,
                    subcategoryId: subcategory.id,
                    subcategoryName: subcategory.name
                  })}
                  onRemoveCourse={removeCourse}
                />
              ))}
            </div>
          )}

          {trueElectiveSubcategories.length > 0 && (
            <div className="mb-6">
              <h5 className="mb-3 text-base text-ink">Subcategorías Electivas</h5>
              {trueElectiveSubcategories.map(subcategory => (
                <SubcategoryGroup
                  key={subcategory.id}
                  subcategory={subcategory}
                  elective
                  showCycleBadge={showCycleBadge}
                  isOpen={!!showElectiveOptions[groupKey(subcategory.id)]}
                  onToggle={() => toggleElectiveOptions(groupKey(subcategory.id))}
                  approvedCount={getSubcategoryProgress(subcategory.id)}
                  inProgressCount={semesterData.courses.filter(c => c.subcategoryId === subcategory.id).length}
                  isCourseTaken={isCourseTaken}
                  onAddCourse={(course) => addCourse({
                    ...course,
                    isElective: true,
                    subcategoryId: subcategory.id,
                    subcategoryName: subcategory.name
                  })}
                  onRemoveCourse={removeCourse}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SubcategoryGroup = ({
  subcategory,
  elective,
  showCycleBadge,
  isOpen,
  onToggle,
  approvedCount,
  inProgressCount,
  isCourseTaken,
  onAddCourse,
  onRemoveCourse,
}) => {
  const isCompleted = approvedCount >= subcategory.requiredCourses;
  // "Completado" ya no bloquea el grupo: un elective cumplido igual puede
  // seguir teniendo cursos sin tomar que al alumno le interese llevar
  // igual, aunque ya no le cuenten para el requisito.
  const hasMoreCourses = subcategory.courses.length > 0;

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        disabled={isCompleted && !hasMoreCourses}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left text-base font-semibold transition-colors ${
          isCompleted
            ? `border-good/30 bg-good/10 text-good ${hasMoreCourses ? '' : 'cursor-not-allowed opacity-70'}`
            : elective
              ? 'border-accent-deep/30 bg-accent-deep/10 text-accent-deep'
              : 'border-line bg-surface-2 text-ink'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            {isCompleted && <span>✅</span>}
            <span>{subcategory.name}</span>
          </div>
          <div className="mt-1 text-xs opacity-80">
            {isCompleted ? (
              `Completado (${approvedCount}/${subcategory.requiredCourses})${hasMoreCourses ? ' • puedes llevar más cursos igual' : ''}`
            ) : (
              <>
                {subcategory.requiresAll
                  ? `Requiere todos los cursos (${subcategory.requiredCourses})`
                  : `Requiere ${subcategory.requiredCourses} curso${subcategory.requiredCourses !== 1 ? 's' : ''}`}
                {approvedCount > 0 && ` • ${approvedCount} ya aprobado${approvedCount !== 1 ? 's' : ''}`}
                {inProgressCount > 0 && ` • ${inProgressCount} en este semestre`}
              </>
            )}
          </div>
        </div>
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (isCompleted ? hasMoreCourses : true) && (
        <div className="mt-3 rounded-xl border border-line bg-bg p-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {subcategory.courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isTaken={isCourseTaken(course.id)}
                onAdd={() => onAddCourse(course)}
                onRemove={() => onRemoveCourse(course.id)}
                isElective={elective}
                showCycleBadge={showCycleBadge}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course, isTaken, onAdd, onRemove, isElective = false, showCycleBadge = false }) => {
  return (
    <div className={`relative rounded-xl border p-4 ${showCycleBadge ? 'pt-9' : ''} ${isTaken ? 'border-good/30 bg-good/10' : 'border-line bg-bg'}`}>
      {showCycleBadge && (
        <div className="absolute right-2 top-2 rounded-full border border-warn/30 bg-warn/20 px-2 py-0.5 text-[10px] font-semibold text-warn">
          Ciclo {course.cycle}
        </div>
      )}

      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <div className={`mb-1 text-sm font-semibold ${isElective ? 'text-accent-deep' : 'text-accent'}`}>{course.code}</div>
          <div className="mb-1 text-base font-semibold text-ink">{course.name}</div>
          <div className="text-xs text-muted">{course.credits} crédito{course.credits !== 1 ? 's' : ''}</div>
        </div>

        <button
          onClick={isTaken ? onRemove : onAdd}
          className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${isTaken ? 'bg-bad' : 'bg-good'}`}
        >
          {isTaken ? '✕' : '+'}
        </button>
      </div>
    </div>
  );
};

const SelectedCourseRow = ({ course, index, isCurrentCycle, onRemove, onUpdateGrade, onToggleException }) => {
  return (
    <div
      className={`grid items-center gap-4 px-5 py-4 ${index > 0 ? 'border-t border-line' : ''}`}
      style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto' }}
    >
      <div>
        <div className={`mb-0.5 text-sm font-semibold ${course.isElective ? 'text-accent-deep' : 'text-accent'}`}>
          {course.courseCode}
          {course.isElective && (
            <span className="ml-2 rounded-full bg-accent-deep/20 px-1.5 py-0.5 text-[10px]">ELECTIVO</span>
          )}
        </div>
        <div className="text-sm text-ink">{course.courseName}</div>
        {course.subcategoryName && <div className="mt-0.5 text-xs text-muted">{course.subcategoryName}</div>}
      </div>

      <div className="text-sm text-muted">{course.credits} crédito{course.credits !== 1 ? 's' : ''}</div>

      <div>
        {isCurrentCycle ? (
          <span className="rounded-lg bg-warn/20 px-3 py-1.5 text-xs font-semibold text-warn">En curso</span>
        ) : (
          <input
            type="number"
            min="0"
            max="20"
            value={course.grade || ''}
            onChange={(e) => onUpdateGrade(e.target.value)}
            placeholder="Nota"
            className="w-[60px] rounded-md border border-line bg-bg px-2 py-1.5 text-center text-sm text-ink outline-none focus:border-accent"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted">
          <input type="checkbox" checked={course.exception} onChange={onToggleException} className="h-3.5 w-3.5 accent-warn" />
          Excepción
        </label>
      </div>

      <button onClick={onRemove} className="rounded-md bg-bad/20 px-2 py-1.5 text-xs text-bad">🗑️</button>
    </div>
  );
};

export default StudentCourseRegistration;
