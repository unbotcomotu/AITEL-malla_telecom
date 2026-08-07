import React, { useState, useEffect } from 'react';
import { StudentApi } from '../../../services/student/studentApi';

const KIND_CLASSES = {
  good: {
    text: 'text-good', border: 'border-good', borderSoft: 'border-good/25', bg: 'bg-good/10', bgSoft: 'bg-good/20',
    card: 'border-good/25 hover:border-good',
  },
  bad: {
    text: 'text-bad', border: 'border-bad', borderSoft: 'border-bad/25', bg: 'bg-bad/10', bgSoft: 'bg-bad/20',
    card: 'border-bad/25 hover:border-bad',
  },
  warn: {
    text: 'text-warn', border: 'border-warn', borderSoft: 'border-warn/25', bg: 'bg-warn/10', bgSoft: 'bg-warn/20',
    card: 'border-warn/25 hover:border-warn',
  },
};

const SemesterHistoryView = () => {
  const [semesterData, setSemesterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadSemesterHistory();
  }, []);

  const loadSemesterHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await StudentApi.getSemesterHistory();
      setSemesterData(history);
    } catch (err) {
      setError(`Error al cargar historial: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCourseStatusKind = (course) => {
    if (course.grade === null || course.grade === undefined) return 'warn';
    if (course.grade >= 11) return 'good';
    return 'bad';
  };

  const getCourseStatusIcon = (course) => {
    if (course.grade === null || course.grade === undefined) return '⏳';
    if (course.grade >= 11) return '✅';
    return '❌';
  };

  const calculateSemesterStats = (semester) => {
    const totalCourses = semester.courses.length;
    const approved = semester.courses.filter(c => c.grade >= 11).length;
    const failed = semester.courses.filter(c => c.grade < 11 && c.grade !== null && c.grade !== undefined).length;
    const inProgress = semester.courses.filter(c => c.grade === null || c.grade === undefined).length;
    const totalCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);
    const approvedCredits = semester.courses
      .filter(c => c.grade >= 11)
      .reduce((sum, c) => sum + c.credits, 0);

    return { totalCourses, approved, failed, inProgress, totalCredits, approvedCredits };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-ink">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" />
          <p className="text-base text-muted">Cargando historial académico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6 text-ink">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-full text-center">
        <h1 className="m-0 mb-2 font-display text-4xl font-bold tracking-tight">📅 Historial Académico por Semestre</h1>
        <p className="text-base text-muted">Visualiza tu trayectoria académica cronológicamente</p>
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-bad/40 bg-bad/10 p-4 text-bad">
          ⚠️ {error}
        </div>
      )}

      {/* Timeline */}
      <div className="overflow-x-auto pb-6">
        <div className="flex min-w-fit gap-6 px-6">
          {semesterData.map((semester, index) => {
            const stats = calculateSemesterStats(semester);
            const isSuspended = semester.suspended;

            return (
              <div key={semester.semester} className="relative min-w-[320px] max-w-[320px] rounded-2xl border border-line bg-surface p-5">
                {/* Semester Header */}
                <div className="mb-4 border-b border-line pb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="m-0 font-display text-xl font-bold text-accent">{semester.semester}</h3>
                    <span className="text-2xl text-muted">#{index + 1}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {semester.semester.endsWith('-0') ? 'Ciclo de Verano' : 'Ciclo Regular'}
                  </div>
                </div>

                {isSuspended ? (
                  <div className="p-10 text-center text-muted">
                    <div className="mb-3 text-5xl">⏸️</div>
                    <p className="text-base font-semibold">Semestre Suspendido</p>
                    <p className="mt-2 text-sm">No se llevaron cursos</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Summary */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-good/30 bg-good/10 p-3">
                        <div className="text-xl font-bold text-good">{stats.approved}</div>
                        <div className="text-xs text-muted">Aprobados</div>
                      </div>

                      {stats.failed > 0 && (
                        <div className="rounded-lg border border-bad/30 bg-bad/10 p-3">
                          <div className="text-xl font-bold text-bad">{stats.failed}</div>
                          <div className="text-xs text-muted">Desaprobados</div>
                        </div>
                      )}

                      {stats.inProgress > 0 && (
                        <div className="rounded-lg border border-warn/30 bg-warn/10 p-3">
                          <div className="text-xl font-bold text-warn">{stats.inProgress}</div>
                          <div className="text-xs text-muted">En curso</div>
                        </div>
                      )}

                      <div className="rounded-lg border border-accent/30 bg-accent/10 p-3">
                        <div className="text-xl font-bold text-accent">{stats.approvedCredits}/{stats.totalCredits}</div>
                        <div className="text-xs text-muted">Créditos</div>
                      </div>
                    </div>

                    {/* Courses List */}
                    <div className="flex flex-col gap-2">
                      {semester.courses.map((course) => {
                        const kind = KIND_CLASSES[getCourseStatusKind(course)];
                        return (
                          <div
                            key={course.id}
                            onClick={() => setSelectedCourse(course)}
                            className={`relative cursor-pointer rounded-lg border-2 bg-bg p-3 transition-all hover:translate-x-1 ${kind.card}`}
                          >
                            <div className="absolute right-2 top-2 text-base">{getCourseStatusIcon(course)}</div>

                            <div className={`mb-1 text-xs font-semibold ${kind.text}`}>{course.code}</div>

                            <div className="mb-2 pr-6 text-sm font-semibold leading-tight text-ink">{course.name}</div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted">{course.credits} créditos</span>
                              {course.grade !== null && course.grade !== undefined && (
                                <span className={`rounded px-2 py-0.5 font-semibold ${kind.bg} ${kind.text}`}>
                                  Nota: {course.grade}
                                </span>
                              )}
                            </div>

                            {course.exception && (
                              <div className="mt-2 inline-block rounded bg-warn/20 px-2 py-0.5 text-[10px] font-semibold text-warn">
                                ⚠️ EXCEPCIÓN
                              </div>
                            )}

                            {course.isElective && (
                              <div className="mt-2 inline-block rounded bg-accent-deep/20 px-2 py-0.5 text-[10px] font-semibold text-accent-deep">
                                📚 ELECTIVO
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Connector */}
                {index < semesterData.length - 1 && (
                  <div className="absolute right-[-24px] top-1/2 h-0.5 w-6 -translate-y-1/2 bg-gradient-to-r from-accent to-transparent">
                    <div className="absolute right-[-4px] top-1/2 h-0 w-0 -translate-y-1/2 border-y-4 border-l-[6px] border-y-transparent border-l-accent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div
          onClick={() => setSelectedCourse(null)}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[500px] rounded-2xl border-2 bg-surface p-8 ${KIND_CLASSES[getCourseStatusKind(selectedCourse)].border}`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <div className={`mb-2 text-sm font-semibold ${KIND_CLASSES[getCourseStatusKind(selectedCourse)].text}`}>
                  {selectedCourse.code}
                </div>
                <h3 className="m-0 font-display text-2xl font-bold text-ink">{selectedCourse.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="ml-4 text-2xl text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-bg p-4">
                <div className="mb-1 text-xs text-muted">Créditos</div>
                <div className="text-lg font-semibold text-ink">{selectedCourse.credits}</div>
              </div>

              {selectedCourse.grade !== null && selectedCourse.grade !== undefined ? (
                <div className={`rounded-lg border p-4 ${KIND_CLASSES[getCourseStatusKind(selectedCourse)].borderSoft} ${KIND_CLASSES[getCourseStatusKind(selectedCourse)].bg}`}>
                  <div className="mb-1 text-xs text-muted">Nota Final</div>
                  <div className={`text-3xl font-bold ${KIND_CLASSES[getCourseStatusKind(selectedCourse)].text}`}>
                    {selectedCourse.grade}/20
                  </div>
                  <div className={`mt-2 text-sm font-semibold ${KIND_CLASSES[getCourseStatusKind(selectedCourse)].text}`}>
                    {selectedCourse.grade >= 11 ? '✅ Aprobado' : '❌ Desaprobado'}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-warn/40 bg-warn/20 p-4 text-center">
                  <div className="mb-2 text-3xl">⏳</div>
                  <div className="text-base font-semibold text-warn">Curso en progreso</div>
                </div>
              )}

              {selectedCourse.subcategoryName && (
                <div className="rounded-lg border border-accent-deep/30 bg-accent-deep/15 p-3">
                  <div className="text-sm text-accent-deep">📚 {selectedCourse.subcategoryName}</div>
                </div>
              )}

              {selectedCourse.exception && (
                <div className="rounded-lg border border-warn/30 bg-warn/15 p-3">
                  <div className="text-sm font-semibold text-warn">⚠️ Excepción de matrícula</div>
                  <div className="mt-1 text-xs text-muted">Curso llevado sin cumplir prerrequisitos</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterHistoryView;
