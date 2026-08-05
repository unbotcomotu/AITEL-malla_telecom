import React, { useState, useEffect } from 'react';
import { StudentApi } from '../../../services/student/studentApi';

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

  const getCourseStatusColor = (course) => {
    if (course.grade === null) return '#f59e0b'; // En curso
    if (course.grade >= 11) return '#10b981'; // Aprobado
    return '#ef4444'; // Desaprobado
  };

  const getCourseStatusIcon = (course) => {
    if (course.grade === null) return '⏳';
    if (course.grade >= 11) return '✅';
    return '❌';
  };

  const calculateSemesterStats = (semester) => {
    const totalCourses = semester.courses.length;
    const approved = semester.courses.filter(c => c.grade >= 11).length;
    const failed = semester.courses.filter(c => c.grade < 11 && c.grade !== null).length;
    const inProgress = semester.courses.filter(c => c.grade === null).length;
    const totalCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);
    const approvedCredits = semester.courses
      .filter(c => c.grade >= 11)
      .reduce((sum, c) => sum + c.credits, 0);

    return { totalCourses, approved, failed, inProgress, totalCredits, approvedCredits };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(6, 182, 212, 0.3)',
            borderTopColor: '#06b6d4',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '16px', color: '#cbd5e1' }}>
            Cargando historial académico...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)',
      padding: '24px',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto 32px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          📅 Historial Académico por Semestre
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>
          Visualiza tu trayectoria académica cronológicamente
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 24px',
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          color: '#fca5a5'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Timeline Container */}
      <div style={{
        overflowX: 'auto',
        paddingBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          gap: '24px',
          minWidth: 'fit-content',
          padding: '0 24px'
        }}>
          {semesterData.map((semester, index) => {
            const stats = calculateSemesterStats(semester);
            const isSuspended = semester.suspended;

            return (
              <div
                key={semester.semester}
                style={{
                  minWidth: '320px',
                  maxWidth: '320px',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  padding: '20px',
                  position: 'relative'
                }}
              >
                {/* Semester Header */}
                <div style={{
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      margin: 0
                    }}>
                      {semester.semester}
                    </h3>
                    <span style={{
                      fontSize: '24px',
                      color: '#94a3b8'
                    }}>
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    {semester.semester.endsWith('-0') ? 'Ciclo de Verano' : 'Ciclo Regular'}
                  </div>
                </div>

                {isSuspended ? (
                  /* Semester Suspended */
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#94a3b8'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏸️</div>
                    <p style={{ fontSize: '16px', fontWeight: '600' }}>
                      Semestre Suspendido
                    </p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                      No se llevaron cursos
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Stats Summary */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                          {stats.approved}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          Aprobados
                        </div>
                      </div>

                      {stats.failed > 0 && (
                        <div style={{
                          padding: '12px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
                            {stats.failed}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            Desaprobados
                          </div>
                        </div>
                      )}

                      {stats.inProgress > 0 && (
                        <div style={{
                          padding: '12px',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                            {stats.inProgress}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            En curso
                          </div>
                        </div>
                      )}

                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)'
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#06b6d4' }}>
                          {stats.approvedCredits}/{stats.totalCredits}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          Créditos
                        </div>
                      </div>
                    </div>

                    {/* Courses List */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {semester.courses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => setSelectedCourse(course)}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: `2px solid ${getCourseStatusColor(course)}40`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.borderColor = getCourseStatusColor(course);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.borderColor = `${getCourseStatusColor(course)}40`;
                          }}
                        >
                          {/* Status Icon */}
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            fontSize: '16px'
                          }}>
                            {getCourseStatusIcon(course)}
                          </div>

                          {/* Course Code */}
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: getCourseStatusColor(course),
                            marginBottom: '4px'
                          }}>
                            {course.code}
                          </div>

                          {/* Course Name */}
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#cbd5e1',
                            marginBottom: '8px',
                            lineHeight: '1.3',
                            paddingRight: '24px'
                          }}>
                            {course.name}
                          </div>

                          {/* Course Info */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px'
                          }}>
                            <span style={{ color: '#94a3b8' }}>
                              {course.credits} créditos
                            </span>
                            {course.grade !== null && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: `${getCourseStatusColor(course)}20`,
                                color: getCourseStatusColor(course),
                                fontWeight: '600'
                              }}>
                                Nota: {course.grade}
                              </span>
                            )}
                          </div>

                          {/* Exception Badge */}
                          {course.exception && (
                            <div style={{
                              marginTop: '8px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#f59e0b',
                              fontSize: '10px',
                              fontWeight: '600',
                              display: 'inline-block'
                            }}>
                              ⚠️ EXCEPCIÓN
                            </div>
                          )}

                          {/* Elective Badge */}
                          {course.isElective && (
                            <div style={{
                              marginTop: '8px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: 'rgba(139, 92, 246, 0.2)',
                              color: '#a855f7',
                              fontSize: '10px',
                              fontWeight: '600',
                              display: 'inline-block'
                            }}>
                              📚 ELECTIVO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Connector Line to Next Semester */}
                {index < semesterData.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-24px',
                    width: '24px',
                    height: '2px',
                    background: 'linear-gradient(to right, #06b6d4, transparent)',
                    transform: 'translateY(-50%)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      right: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '0',
                      height: '0',
                      borderLeft: '6px solid #06b6d4',
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent'
                    }} />
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
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
              borderRadius: '16px',
              border: `2px solid ${getCourseStatusColor(selectedCourse)}`,
              padding: '32px',
              maxWidth: '500px',
              width: '100%'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  color: getCourseStatusColor(selectedCourse),
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {selectedCourse.code}
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#cbd5e1',
                  margin: 0
                }}>
                  {selectedCourse.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  marginLeft: '16px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.6)'
              }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
                  Créditos
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: '600' }}>
                  {selectedCourse.credits}
                </div>
              </div>

              {selectedCourse.grade !== null && (
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: `${getCourseStatusColor(selectedCourse)}20`,
                  border: `1px solid ${getCourseStatusColor(selectedCourse)}40`
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
                    Nota Final
                  </div>
                  <div style={{
                    color: getCourseStatusColor(selectedCourse),
                    fontSize: '32px',
                    fontWeight: 'bold'
                  }}>
                    {selectedCourse.grade}/20
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: getCourseStatusColor(selectedCourse),
                    fontWeight: '600'
                  }}>
                    {selectedCourse.grade >= 11 ? '✅ Aprobado' : '❌ Desaprobado'}
                  </div>
                </div>
              )}

              {selectedCourse.grade === null && (
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                  <div style={{ color: '#f59e0b', fontSize: '16px', fontWeight: '600' }}>
                    Curso en progreso
                  </div>
                </div>
              )}

              {selectedCourse.subcategoryName && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <div style={{ color: '#a855f7', fontSize: '14px' }}>
                    📚 {selectedCourse.subcategoryName}
                  </div>
                </div>
              )}

              {selectedCourse.exception && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{ color: '#f59e0b', fontSize: '14px', fontWeight: '600' }}>
                    ⚠️ Excepción de matrícula
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                    Curso llevado sin cumplir prerrequisitos
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SemesterHistoryView;