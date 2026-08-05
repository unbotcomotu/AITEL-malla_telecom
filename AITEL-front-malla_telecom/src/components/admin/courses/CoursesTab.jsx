import React, { useState, useEffect } from 'react';
import { CoursesApi } from '../../../services/admin/courses/coursesApi';
const CoursesTab = ({ selectedSubcategory, onCourseSelect, onBack }) => {
  // Mock data para cursos
  const [courses, setCourses] = useState([]);

  // Mock data para horarios por curso
  const [schedulesByCourse, setSchedulesByCourse] = useState({});

  // Simulamos todos los cursos disponibles para prerrequisitos

  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Estados del componente
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState('all'); // 'all', 'visible', 'hidden'
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  
  // Estados para modales de confirmación
  const [showFreezeConfirmation, setShowFreezeConfirmation] = useState(null);
  const [showUnfreezeConfirmation, setShowUnfreezeConfirmation] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [confirmationTimer, setConfirmationTimer] = useState(10);
  const [canConfirm, setCanConfirm] = useState(false);
  
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    hours: { theory: 2, practice: 2, lab: 0 },
    prerequisites: [],
    minGradePrereqs: [],
    corequisites: [],
    cycle: selectedSubcategory?.cycle || 1,
    isVisible: true
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
        
        setCourses(coursesData);
        setAllCourses(allCoursesData);
        
        // Cargar horarios para cada curso
        const schedulesPromises = coursesData.map(course => 
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

  // Timer effect para confirmaciones
  useEffect(() => {
    let timer;
    if ((showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && confirmationTimer > 0) {
      timer = setTimeout(() => {
        setConfirmationTimer(confirmationTimer - 1);
      }, 1000);
    } else if (confirmationTimer === 0) {
      setCanConfirm(true);
    }
    return () => clearTimeout(timer);
  }, [showFreezeConfirmation, showUnfreezeConfirmation, showDeleteConfirmation, confirmationTimer]);

  // Funciones auxiliares
  const resetConfirmationState = () => {
    setShowFreezeConfirmation(null);
    setShowUnfreezeConfirmation(null);
    setShowDeleteConfirmation(null);
    setConfirmationTimer(10);
    setCanConfirm(false);
  };

  const getStatusColor = (course) => {
    if (course.isFrozen || selectedSubcategory?.isFrozen) return '#64748b';
    if (!course.isVisible) return '#f59e0b';
    return selectedSubcategory?.color || '#8b5cf6';
  };

  const getStatusIcon = (course) => {
    if (course.isFrozen || selectedSubcategory?.isFrozen) return '❄️';
    if (!course.isVisible) return '👁️‍🗨️';
    return '✅';
  };

  const getCourseById = (courseId) => {
    return allCourses.find(c => c.id === courseId) || { code: courseId, name: 'Curso no encontrado' };
  };

  // Filtros
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterVisible === 'all' || 
                         (filterVisible === 'visible' && course.isVisible) ||
                         (filterVisible === 'hidden' && !course.isVisible);
    
    return matchesSearch && matchesFilter;
  });

  

  // Handlers
  const handleAddCourse = async () => {
    if (!newCourse.name.trim() || !newCourse.code.trim()) return;
    
    try {
      setLoading(true);
      const savedCourse = await CoursesApi.createCourse(selectedSubcategory.id, newCourse);
      setCourses([...courses, savedCourse]);
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
      const updatedCourse = await CoursesApi.updateCourse(editingCourse.id, newCourse);
      setCourses(courses.map(course => 
        course.id === editingCourse.id ? updatedCourse : course
      ));
      resetForm();
    } catch (error) {
      setError('Error al actualizar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = (course) => {
    setShowDeleteConfirmation(course);
  };

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

  const handleFreezeCourse = (course) => {
    setShowFreezeConfirmation(course);
  };

  const confirmFreezeCourse = async () => {
    const courseToFreeze = showFreezeConfirmation;
    try {
      setLoading(true);
      await CoursesApi.freezeCourse(courseToFreeze.id);
      setCourses(courses.map(course => 
        course.id === courseToFreeze.id ? { ...course, isFrozen: true } : course
      ));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo congelar el curso "${courseToFreeze.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreezeCourse = (course) => {
    setShowUnfreezeConfirmation(course);
  };

  const confirmUnfreezeCourse = async () => {
    const courseToUnfreeze = showUnfreezeConfirmation;
    try {
      setLoading(true);
      await CoursesApi.unfreezeCourse(courseToUnfreeze.id);
      setCourses(courses.map(course => 
        course.id === courseToUnfreeze.id ? { ...course, isFrozen: false } : course
      ));
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
      setCourses(courses.map(course => 
        course.id === courseId ? updatedCourse : course
      ));
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
      code: '',
      name: '',
      description: '',
      credits: 3,
      hours: { theory: 2, practice: 2, lab: 0 },
      prerequisites: [],
      minGradePrereqs: [],
      corequisites: [],
      cycle: selectedSubcategory?.cycle || 1,
      isVisible: true
    });
  };

  // Si la subcategoría padre está congelada
  if (selectedSubcategory?.isFrozen) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          background: 'rgba(100, 116, 139, 0.1)',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❄️</div>
          <h3 style={{ fontSize: '24px', marginBottom: '8px', color: '#64748b' }}>
            Subcategoría Congelada
          </h3>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '24px' }}>
            La subcategoría "{selectedSubcategory.name}" está congelada. No se pueden realizar acciones en sus cursos.
          </p>
          <button
            disabled={loading}
            onClick={onBack}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(148, 163, 184, 0.3)',
              color: '#cbd5e1',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            ← Volver a Subcategorías
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        fontSize: '14px',
        color: '#94a3b8',
        flexWrap: 'wrap'
      }}>
        <button
          disabled={loading}
          onClick={() => console.log('Volver a categorías')}
          style={{
            background: 'none',
            border: 'none',
            color: '#06b6d4',
            fontSize: '14px',
            textDecoration: 'underline',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          📂 Categorías
        </button>
        <span>→</span>
        <button
          disabled={loading}
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#06b6d4',
            fontSize: '14px',
            textDecoration: 'underline',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          📁 Subcategorías
        </button>
        <span>→</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: selectedSubcategory?.color || '#8b5cf6'
          }} />
          <span style={{ color: 'white', fontWeight: '500' }}>
            {selectedSubcategory?.name || 'Subcategoría no seleccionada'}
          </span>
        </div>
      </div>

      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: `linear-gradient(to right, ${selectedSubcategory?.color || '#8b5cf6'}, ${selectedSubcategory?.color || '#8b5cf6'}80)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '8px'
          }}>
            📚 Cursos de {selectedSubcategory?.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
              {selectedSubcategory?.description}
            </p>
            {selectedSubcategory?.requiredCourses && (
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: `${selectedSubcategory?.color || '#8b5cf6'}20`,
                color: selectedSubcategory?.color || '#8b5cf6',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                ✅ {selectedSubcategory.requiredCourses} curso{selectedSubcategory.requiredCourses !== 1 ? 's' : ''} requerido{selectedSubcategory.requiredCourses !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${selectedSubcategory?.color || '#8b5cf6'}, ${selectedSubcategory?.color || '#8b5cf6'}80)`,
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 15px ${selectedSubcategory?.color || '#8b5cf6'}30`,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          Nuevo Curso
        </button>
      </div>

      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <input
          disabled={loading}
          type="text"
          placeholder="🔍 Buscar cursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(30, 41, 59, 0.6)',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
            opacity: loading ? 0.6 : 1
          }}
        />
        
        <select
          disabled={loading}
          value={filterVisible}
          onChange={(e) => setFilterVisible(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(30, 41, 59, 0.6)',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
            opacity: loading ? 0.6 : 1
          }}
        >
          <option value="all">Todos los cursos</option>
          <option value="visible">Solo visibles</option>
          <option value="hidden">Solo ocultos</option>
        </select>
      </div>

      {/* Add/Edit Form */}
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

      {/* Main Content Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedCourseInfo ? '1fr 400px' : '1fr',
        gap: '32px'
      }}>
        
        {/* Courses Grid */}
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
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
            <div style={{
              textAlign: 'center',
              padding: '64px 24px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                No se encontraron cursos
              </h3>
              <p style={{ fontSize: '16px' }}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primer curso'}
              </p>
            </div>
          )}
        </div>

        {/* Course Details Panel */}
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

        {/* Schedule Manager Panel */}
        {selectedCourseInfo && showScheduleManager && (
          <ScheduleManagerPanel
            course={selectedCourseInfo}
            schedules={schedulesByCourse[selectedCourseInfo.id] || []}
            selectedSubcategory={selectedSubcategory}
            onClose={() => {
              setShowScheduleManager(false);
              setSelectedCourseInfo(null);
            }}
            onBackToDetails={() => setShowScheduleManager(false)}
            loading={loading}
          />
        )}
      </div>

      {/* Confirmation Modals */}
      {(showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && (
        <ConfirmationModal
          type={showFreezeConfirmation ? 'freeze' : showUnfreezeConfirmation ? 'unfreeze' : 'delete'}
          item={showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation}
          itemType="curso"
          timer={confirmationTimer}
          canConfirm={canConfirm}
          onConfirm={showFreezeConfirmation ? confirmFreezeCourse : showUnfreezeConfirmation ? confirmUnfreezeCourse : confirmDeleteCourse}
          onCancel={resetConfirmationState}
        />
      )}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: `1px solid ${selectedSubcategory?.color || '#8b5cf6'}60`,
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
              border: `4px solid ${selectedSubcategory?.color || '#8b5cf6'}30`,
              borderTop: `4px solid ${selectedSubcategory?.color || '#8b5cf6'}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>
              Procesando cursos...
            </span>
          </div>
        </div>
      )}

      <style>
        {`@keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`}
      </style>
    </div>
  );
};


const CourseCard = ({ 
  course, selectedSubcategory, isSelected, onSelect, onEdit, onDelete, onFreeze, onUnfreeze, onToggleVisible, onScheduleManager,
  getStatusColor, getStatusIcon, getCourseById,loading
}) => {
  const canDelete = course.schedulesCount === 0;
  const isDisabled = course.isFrozen || selectedSubcategory?.isFrozen;
  const totalHours = course.hours.theory + course.hours.practice + course.hours.lab;
  
  return (
    <div
      disabled={loading}
      onClick={onSelect}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
        borderRadius: '16px',
        border: `2px solid ${isSelected ? getStatusColor(course) : `${getStatusColor(course)}60`}`,
        padding: '24px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: isDisabled || loading ? 'not-allowed' : 'pointer',
        opacity: isDisabled || loading ? 0.7 : 1,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected ? `0 8px 30px ${getStatusColor(course)}40` : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 40px ${getStatusColor(course)}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'translateY(0)';
          e.currentTarget.style.boxShadow = isSelected ? `0 8px 30px ${getStatusColor(course)}40` : 'none';
        }
      }}
    >
      {/* Color accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${getStatusColor(course)}, ${getStatusColor(course)}80)`
      }} />
      
      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        fontSize: '20px'
      }}>
        {getStatusIcon(course)}
      </div>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: `${getStatusColor(course)}20`,
              color: getStatusColor(course),
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {course.code}
            </span>
            <span style={{
              color: '#94a3b8',
              fontSize: '12px'
            }}>
              {course.credits} créditos • {totalHours}h
            </span>
          </div>
          <h3 style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '700',
            margin: 0
          }}>
            {course.name}
          </h3>
        </div>
      </div>

      <p style={{
        color: '#cbd5e1',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '20px',
        opacity: 0.9
      }}>
        {course.description || 'Sin descripción disponible'}
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}>
        <button
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation();
            onScheduleManager();
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: `${getStatusColor(course)}20`,
            color: getStatusColor(course),
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          📅 Horarios ({course.schedulesCount})
        </button>

        {!isDisabled && (
          <>
            <button
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(course);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              ✏️ Editar
            </button>

            <button
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                onFreeze(course);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(100, 116, 139, 0.2)',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              ❄️ Congelar
            </button>

            <button
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisible(course.id);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: course.isVisible ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: course.isVisible ? '#f59e0b' : '#10b981',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {course.isVisible ? '🙈 Ocultar' : '👁️ Mostrar'}
            </button>
          </>
        )}

        {course.isFrozen && !selectedSubcategory?.isFrozen && (
          <button
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onUnfreeze(course);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(6, 182, 212, 0.2)',
              color: '#06b6d4',
              fontSize: '12px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            🔥 Descongelar
          </button>
        )}

        {canDelete && !isDisabled && (
          <button
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            🗑️ Eliminar
          </button>
        )}
      </div>

      {/* Prerequisites */}
      {(course.prerequisites.length > 0 || course.minGradePrereqs.length > 0 || course.corequisites.length > 0) && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(30, 41, 59, 0.4)',
          marginBottom: '12px'
        }}>
          <h5 style={{
            color: '#cbd5e1',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            🔗 Requisitos
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            {course.prerequisites.length > 0 && (
              <div>
                <span style={{ color: '#10b981' }}>Prerrequisitos: </span>
                <span style={{ color: '#cbd5e1' }}>
                  {course.prerequisites.map(prereqId => getCourseById(prereqId).code).join(', ')}
                </span>
              </div>
            )}
            {course.minGradePrereqs.length > 0 && (
              <div>
                <span style={{ color: '#f59e0b' }}>Nota mínima: </span>
                <span style={{ color: '#cbd5e1' }}>
                  {course.minGradePrereqs.map(prereq => 
                    `${getCourseById(prereq.courseId).code} (≥${prereq.minGrade})`
                  ).join(', ')}
                </span>
              </div>
            )}
            {course.corequisites.length > 0 && (
              <div>
                <span style={{ color: '#06b6d4' }}>Correquisitos: </span>
                <span style={{ color: '#cbd5e1' }}>
                  {course.corequisites.map(coreqId => getCourseById(coreqId).code).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!canDelete && !isDisabled && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(71, 85, 105, 0.2)',
          fontSize: '12px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>⚠️</span>
          No se puede eliminar: tiene horarios programados
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          color: getStatusColor(course),
          fontSize: '14px',
          animation: 'pulse 2s infinite'
        }}>
          ✨ Seleccionado
        </div>
      )}

      {/* Click indicator */}
      {!isDisabled && !isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          color: getStatusColor(course),
          fontSize: '14px',
          opacity: 0.6
        }}>
          👆 Clic para detalles
        </div>
      )}
    </div>
  );
};

const CourseDetailsPanel = ({ course, schedules, selectedSubcategory, onClose, onNavigateToSchedules, onScheduleManager, getStatusColor, getCourseById,loading}) => {
  const totalHours = course.hours.theory + course.hours.practice + course.hours.lab;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderRadius: '16px',
      border: `1px solid ${getStatusColor(course)}60`,
      padding: '24px',
      height: 'fit-content',
      position: 'sticky',
      top: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: `${getStatusColor(course)}20`,
              color: getStatusColor(course),
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {course.code}
            </span>
          </div>
          <h3 style={{
            color: getStatusColor(course),
            fontSize: '20px',
            fontWeight: '700',
            margin: 0,
            marginBottom: '8px'
          }}>
            📚 {course.name}
          </h3>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {course.description}
          </p>
        </div>
        
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            background: 'rgba(148, 163, 184, 0.2)',
            border: 'none',
            borderRadius: '6px',
            color: '#94a3b8',
            fontSize: '14px',
            padding: '6px 10px',
            fontWeight: '500',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Status Info */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          background: `${getStatusColor(course)}20`,
          color: getStatusColor(course),
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {course.isFrozen || selectedSubcategory?.isFrozen ? '❄️ Congelado' : !course.isVisible ? '🙈 Oculto' : '✅ Visible'}
        </span>
        
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          background: 'rgba(148, 163, 184, 0.2)',
          color: '#94a3b8',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {course.credits} créditos • {totalHours}h
        </span>
      </div>

      {/* Hours Breakdown */}
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        background: 'rgba(30, 41, 59, 0.6)',
        marginBottom: '20px'
      }}>
        <h4 style={{
          color: '#cbd5e1',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '12px'
        }}>
          ⏰ Distribución de Horas
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: getStatusColor(course)
            }}>
              {course.hours.theory}h
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              Teoría
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: getStatusColor(course)
            }}>
              {course.hours.practice}h
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              Práctica
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: getStatusColor(course)
            }}>
              {course.hours.lab}h
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              Laboratorio
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {(course.prerequisites.length > 0 || course.minGradePrereqs.length > 0 || course.corequisites.length > 0) && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            color: '#cbd5e1',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            🔗 Requisitos
          </h4>
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(30, 41, 59, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px'
          }}>
            {course.prerequisites.length > 0 && (
              <div>
                <span style={{ color: '#10b981', fontWeight: '600' }}>Prerrequisitos: </span>
                <span style={{ color: '#cbd5e1' }}>
                  {course.prerequisites.map(prereqId => getCourseById(prereqId).code).join(', ')}
                </span>
              </div>
            )}
            {course.minGradePrereqs.length > 0 && (
              <div>
                <span style={{ color: '#f59e0b', fontWeight: '600' }}>Nota mínima: </span>
                <span style={{ color: '#cbd5e1' }}>
                  {course.minGradePrereqs.map(prereq => 
                    `${getCourseById(prereq.courseId).code} (≥${prereq.minGrade})`
                  ).join(', ')}
                </span>
              </div>
            )}
            {course.corequisites.length > 0 && (
              <div>
                <span style={{ color: '#06b6d4', fontWeight: '600' }}>Correquisitos: </span>
                <span style={{ color: '#cbd5e1' }}>
                  {course.corequisites.map(coreqId => getCourseById(coreqId).code).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedules List */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          color: '#cbd5e1',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '12px'
        }}>
          📅 Horarios Programados ({schedules.length})
        </h4>
        
        {schedules.length > 0 ? (
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {schedules.map(schedule => (
              <div
                key={schedule.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: `1px solid ${getStatusColor(course)}30`,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      color: getStatusColor(course),
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: `${getStatusColor(course)}20`
                    }}>
                      {schedule.cycle}
                    </span>
                    <span style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {schedule.name}
                    </span>
                  </div>
                  <span style={{
                    color: '#94a3b8',
                    fontSize: '12px'
                  }}>
                    {schedule.enrolledStudents} estudiantes
                  </span>
                </div>
                
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '4px'
                }}>
                  📍 {schedule.classroom} • 👨‍🏫 {schedule.professors.join(', ')}
                </div>
                
                <div style={{
                  fontSize: '12px',
                  color: '#cbd5e1'
                }}>
                  ⏰ {schedule.days.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            No hay horarios programados
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: 'column'
      }}>
        <button
          onClick={onScheduleManager}
          disabled={loading}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            background: `linear-gradient(135deg, ${getStatusColor(course)}, ${getStatusColor(course)}80)`,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <span>📅</span>
          Gestionar Horarios
        </button>
      </div>
    </div>
  );
};

const ScheduleManagerPanel = ({ course, schedules: initialSchedules, selectedSubcategory, onClose, onBackToDetails,loading}) => {
  const [schedules, setSchedules] = useState(initialSchedules || []);
  const [canConfirm, setCanConfirm] = useState(false); // ✅ Añadir esta línea

  const [expandedCycle, setExpandedCycle] = useState(null);
  
  // Estados para confirmación de eliminación
  const [showDeleteCycleConfirmation, setShowDeleteCycleConfirmation] = useState(null);
  const [showDeleteScheduleConfirmation, setShowDeleteScheduleConfirmation] = useState(null);
  const [confirmationTimer, setConfirmationTimer] = useState(10);

  // Agrupar horarios por ciclo
  const schedulesByCycle = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.cycle]) acc[schedule.cycle] = [];
    acc[schedule.cycle].push(schedule);
    return acc;
  }, {});

  // Timer para confirmaciones
  useEffect(() => {
    let timer;
    if ((showDeleteCycleConfirmation || showDeleteScheduleConfirmation) && confirmationTimer > 0) {
      timer = setTimeout(() => {
        setConfirmationTimer(confirmationTimer - 1);
      }, 1000);
    } else if (confirmationTimer === 0) {
      setCanConfirm(true);
    }
    return () => clearTimeout(timer);
  }, [showDeleteCycleConfirmation, showDeleteScheduleConfirmation, confirmationTimer]);


  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderRadius: '16px',
      border: `1px solid ${selectedSubcategory?.color || '#8b5cf6'}60`,
      padding: '24px',
      height: 'fit-content',
      position: 'sticky',
      top: '20px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          color: selectedSubcategory?.color || '#8b5cf6',
          fontSize: '20px',
          fontWeight: '700',
          margin: 0
        }}>
          📅 Horarios
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onBackToDetails}
            disabled={loading}
            style={{
              background: 'rgba(148, 163, 184, 0.2)',
              border: 'none',
              borderRadius: '6px',
              color: '#94a3b8',
              fontSize: '12px',
              padding: '6px 10px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            ← Detalles
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              borderRadius: '6px',
              color: '#ef4444',
              fontSize: '12px',
              padding: '6px 10px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      {/* Course Info */}
      <CourseInfoCard course={course} selectedSubcategory={selectedSubcategory} loading={loading} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.keys(schedulesByCycle).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h4>No hay horarios programados</h4>
            <p>Este curso aún no tiene horarios asignados</p>
          </div>
        ) : (
          Object.keys(schedulesByCycle).map(cycle => (
            <CycleCard
              key={cycle}
              cycle={cycle}
              schedules={schedulesByCycle[cycle]}
              isExpanded={expandedCycle === cycle}
              onToggleExpand={() => setExpandedCycle(expandedCycle === cycle ? null : cycle)}
              onDeleteCycle={() => {}} // Función vacía - no hace nada
              onAddSchedule={() => {}} // Función vacía - no hace nada  
              onEditSchedule={() => {}} // Función vacía - no hace nada
              onDeleteSchedule={() => {}} // Función vacía - no hace nada
              selectedSubcategory={selectedSubcategory}
              readOnly={true} // Nuevo prop para indicar modo lectura
              loading={loading}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Componente para mostrar información del curso
const CourseInfoCard = ({ course, selectedSubcategory,loading}) => (
  <div style={{
    padding: '16px',
    borderRadius: '8px',
    background: 'rgba(30, 41, 59, 0.6)',
    marginBottom: '20px'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    }}>
      <span style={{
        padding: '4px 8px',
        borderRadius: '6px',
        background: `${selectedSubcategory?.color || '#8b5cf6'}20`,
        color: selectedSubcategory?.color || '#8b5cf6',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {course.code}
      </span>
      <span style={{
        color: '#94a3b8',
        fontSize: '12px'
      }}>
        {course.credits} créditos
      </span>
    </div>
    <h4 style={{
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      margin: 0
    }}>
      {course.name}
    </h4>
  </div>
);

// Componente para cada card de ciclo
const CycleCard = ({ 
  cycle, schedules, isExpanded, onToggleExpand, onDeleteCycle, 
  onAddSchedule, onEditSchedule, onDeleteSchedule, selectedSubcategory,readOnly=false,loading
}) => {
  const totalStudents = schedules.reduce((total, schedule) => total + schedule.enrolledStudents, 0);
  const canDeleteCycle = schedules.every(schedule => schedule.enrolledStudents === 0);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      overflow: 'hidden'
    }}>
      {/* Cycle Header */}
      <div 
        onClick={onToggleExpand}
        style={{
          padding: '16px',
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
          <h4 style={{
            color: '#06b6d4',
            fontSize: '16px',
            fontWeight: '700',
            margin: 0,
            marginBottom: '4px'
          }}>
            📅 Ciclo {cycle}
          </h4>
          <p style={{
            color: '#94a3b8',
            fontSize: '12px',
            margin: 0
          }}>
            {schedules.length} horario{schedules.length !== 1 ? 's' : ''} • {totalStudents} estudiante{totalStudents !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {!readOnly && (
            <>
          <button
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onAddSchedule();
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              fontSize: '10px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            + Horario
          </button>

          {canDeleteCycle && (
            <button
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCycle();
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '10px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              🗑️
            </button>
          )}
            </>
          )}
          

          <div style={{
            color: '#06b6d4',
            fontSize: '14px',
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
          padding: '16px'
        }}>
          {schedules.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
              <p style={{ fontSize: '12px' }}>
                No hay horarios programados para este ciclo
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {schedules.map(schedule => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onEdit={readOnly ? () => {} : () => onEditSchedule(schedule)}
                  onDelete={readOnly ? () => {} : () => onDeleteSchedule(schedule.id)}
                  selectedSubcategory={selectedSubcategory}
                  readOnly={true}
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
const ScheduleCard = ({ schedule, onEdit, onDelete, selectedSubcategory,readOnly=false,loading}) => {
  const formatTimeRange = (days) => {
    return days.map(day => `${day.day} ${day.startTime}-${day.endTime}`).join(', ');
  };

  const canDelete = schedule.enrolledStudents === 0;

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      borderRadius: '8px',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      padding: '12px',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 4px 15px ${selectedSubcategory?.color || '#8b5cf6'}20`;
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
        marginBottom: '10px'
      }}>
        <h5 style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          margin: 0
        }}>
          {schedule.name}
        </h5>
        {!readOnly && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              disabled={loading}
              onClick={onEdit}
              style={{
                padding: '3px 6px',
                borderRadius: '4px',
                border: 'none',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                fontSize: '9px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              ✏️
            </button>
            {canDelete && (
              <button
                disabled={loading}
                onClick={onDelete}
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: '9px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Schedule Details */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '11px'
      }}>
        {/* Time Slots */}
        <div>
          <span style={{ color: '#94a3b8' }}>⏰ </span>
          <span style={{ color: '#cbd5e1' }}>
            {formatTimeRange(schedule.days)}
          </span>
        </div>

        {/* Classroom */}
        {schedule.classroom && (
          <div>
            <span style={{ color: '#94a3b8' }}>🏫 </span>
            <span style={{ color: '#cbd5e1' }}>
              {schedule.classroom}
            </span>
          </div>
        )}

        {/* Professors */}
        <div>
          <span style={{ color: '#94a3b8' }}>👨‍🏫 </span>
          <span style={{ color: '#cbd5e1' }}>
            {schedule.professors.length > 0 ? schedule.professors.join(', ') : 'Sin asignar'}
          </span>
        </div>

        {/* Students */}
        <div>
          <span style={{ color: '#94a3b8' }}>👥 </span>
          <span style={{ color: selectedSubcategory?.color || '#8b5cf6', fontWeight: '600' }}>
            {schedule.enrolledStudents}
          </span>
          <span style={{ color: '#94a3b8' }}>
            /{schedule.maxStudents || 30} estudiantes
          </span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div style={{
        marginTop: '8px',
        height: '4px',
        borderRadius: '2px',
        background: 'rgba(148, 163, 184, 0.3)',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min((schedule.enrolledStudents / (schedule.maxStudents || 30)) * 100, 100)}%`,
          background: schedule.enrolledStudents > (schedule.maxStudents || 30) * 0.8 
            ? '#ef4444' 
            : schedule.enrolledStudents > (schedule.maxStudents || 30) * 0.6 
            ? '#f59e0b' 
            : '#10b981',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Warning for deletion */}
      {!canDelete && !readOnly && (
        <div style={{
          marginTop: '8px',
          padding: '6px 8px',
          borderRadius: '4px',
          background: 'rgba(239, 68, 68, 0.1)',
          fontSize: '9px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>⚠️</span>
          No se puede eliminar: tiene estudiantes inscritos
        </div>
      )}

      {/* Visual Schedule Grid */}
      <div style={{
        marginTop: '10px',
        padding: '6px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '4px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '2px',
          fontSize: '8px'
        }}>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => {
            const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            const hasClass = schedule.days.some(d => d.day === dayNames[index]);
            return (
              <div
                key={day}
                style={{
                  padding: '3px 1px',
                  textAlign: 'center',
                  borderRadius: '2px',
                  background: hasClass ? (selectedSubcategory?.color || '#8b5cf6') : 'rgba(148, 163, 184, 0.2)',
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

const CourseForm = ({ 
  newCourse, setNewCourse, selectedSubcategory, allCourses, editingCourse,
  onSave, onCancel, getCourseById, loading 
}) => {
  const [selectedPrerequisite, setSelectedPrerequisite] = useState('');
  const [selectedCorequisite, setSelectedCorequisite] = useState('');
  const [minGradeEntry, setMinGradeEntry] = useState({ courseId: '', minGrade: 13 });

  const addPrerequisite = () => {
    if (selectedPrerequisite && !newCourse.prerequisites.includes(selectedPrerequisite)) {
      setNewCourse({
        ...newCourse,
        prerequisites: [...newCourse.prerequisites, selectedPrerequisite]
      });
      setSelectedPrerequisite('');
    }
  };

  const removePrerequisite = (prereqId) => {
    setNewCourse({
      ...newCourse,
      prerequisites: newCourse.prerequisites.filter(id => id !== prereqId)
    });
  };

  const addCorequisite = () => {
    if (selectedCorequisite && !newCourse.corequisites.includes(selectedCorequisite)) {
      setNewCourse({
        ...newCourse,
        corequisites: [...newCourse.corequisites, selectedCorequisite]
      });
      setSelectedCorequisite('');
    }
  };

  const removeCorequisite = (coreqId) => {
    setNewCourse({
      ...newCourse,
      corequisites: newCourse.corequisites.filter(id => id !== coreqId)
    });
  };

  const addMinGradePrereq = () => {
    if (minGradeEntry.courseId && minGradeEntry.minGrade) {
      const exists = newCourse.minGradePrereqs.find(p => p.courseId === minGradeEntry.courseId);
      if (!exists) {
        setNewCourse({
          ...newCourse,
          minGradePrereqs: [...newCourse.minGradePrereqs, { ...minGradeEntry }]
        });
        setMinGradeEntry({ courseId: '', minGrade: 13 });
      }
    }
  };

  const removeMinGradePrereq = (courseId) => {
    setNewCourse({
      ...newCourse,
      minGradePrereqs: newCourse.minGradePrereqs.filter(p => p.courseId !== courseId)
    });
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${selectedSubcategory?.color || '#8b5cf6'}15 0%, rgba(30, 41, 59, 0.8) 100%)`,
      borderRadius: '16px',
      border: `1px solid ${selectedSubcategory?.color || '#8b5cf6'}30`,
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{
        color: selectedSubcategory?.color || '#8b5cf6',
        marginBottom: '20px',
        fontSize: '20px',
        fontWeight: '700'
      }}>
        {editingCourse ? '✏️ Editar Curso' : '➕ Nuevo Curso'}
      </h3>

      {/* Información básica */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Código del curso *
          </label>
          <input
            type="text"
            placeholder="Ej: MAT101, FIS102..."
            value={newCourse.code}
            disabled={loading}
            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>

        <div>
          <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Créditos
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={newCourse.credits}
            disabled={loading}
            onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 1 })}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>

        <div>
          <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Ciclo recomendado
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={newCourse.cycle}
            disabled={loading}
            onChange={(e) => setNewCourse({ ...newCourse, cycle: parseInt(e.target.value) || 1 })}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>
      </div>

      {/* Nombre del curso */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Nombre del curso *
        </label>
        <input
          type="text"
          placeholder="Ej: Cálculo Diferencial, Física Mecánica..."
          value={newCourse.name}
          disabled={loading}
          onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      {/* Descripción */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Descripción
        </label>
        <textarea
          placeholder="Descripción del contenido y objetivos del curso..."
          value={newCourse.description}
          disabled={loading}
          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          rows={3}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      {/* Distribución de horas */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '12px', display: 'block' }}>
          Distribución de horas semanales
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
              Teoría
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={newCourse.hours.theory}
              disabled={loading}
              onChange={(e) => setNewCourse({
                ...newCourse,
                hours: { ...newCourse.hours, theory: parseInt(e.target.value) || 0 }
              })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
              Práctica
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={newCourse.hours.practice}
              disabled={loading}
              onChange={(e) => setNewCourse({
                ...newCourse,
                hours: { ...newCourse.hours, practice: parseInt(e.target.value) || 0 }
              })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
              Laboratorio
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={newCourse.hours.lab}
              disabled={loading}
              onChange={(e) => setNewCourse({
                ...newCourse,
                hours: { ...newCourse.hours, lab: parseInt(e.target.value) || 0 }
              })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>
        </div>
      </div>

      {/* Prerrequisitos */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Prerrequisitos
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedPrerequisite}
            disabled={loading}
            onChange={(e) => setSelectedPrerequisite(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '12px',
              outline: 'none',
              opacity: loading ? 0.6 : 1
            }}
          >
            <option value="">Seleccionar curso...</option>
            {allCourses
              .filter(course => !newCourse.prerequisites.includes(course.id))
              .map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
          </select>
          <button
            onClick={addPrerequisite}
            disabled={loading || !selectedPrerequisite}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              fontSize: '12px',
              cursor: (!selectedPrerequisite || loading) ? 'not-allowed' : 'pointer',
              opacity: (!selectedPrerequisite || loading) ? 0.5 : 1
            }}
          >
            + Agregar
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {newCourse.prerequisites.map(prereqId => {
            const course = getCourseById(prereqId);
            return (
              <span
                key={prereqId}
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
                {course.code}
                <button
                  onClick={() => removePrerequisite(prereqId)}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                    padding: '0 2px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Prerrequisitos con nota mínima */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Prerrequisitos con nota mínima
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <select
            value={minGradeEntry.courseId}
            disabled={loading}
            onChange={(e) => setMinGradeEntry({ ...minGradeEntry, courseId: e.target.value })}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '12px',
              outline: 'none',
              opacity: loading ? 0.6 : 1
            }}
          >
            <option value="">Seleccionar curso...</option>
            {allCourses
              .filter(course => !newCourse.minGradePrereqs.find(p => p.courseId === course.id))
              .map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
          </select>
          <input
            type="number"
            min="10"
            max="20"
            value={minGradeEntry.minGrade}
            disabled={loading}
            onChange={(e) => setMinGradeEntry({ ...minGradeEntry, minGrade: parseInt(e.target.value) || 13 })}
            placeholder="Nota mín."
            style={{
              width: '80px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '12px',
              outline: 'none',
              opacity: loading ? 0.6 : 1
            }}
          />
          <button
            onClick={addMinGradePrereq}
            disabled={loading || !minGradeEntry.courseId}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#f59e0b',
              color: 'white',
              fontSize: '12px',
              cursor: (!minGradeEntry.courseId || loading) ? 'not-allowed' : 'pointer',
              opacity: (!minGradeEntry.courseId || loading) ? 0.5 : 1
            }}
          >
            + Agregar
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {newCourse.minGradePrereqs.map(prereq => {
            const course = getCourseById(prereq.courseId);
            return (
              <span
                key={prereq.courseId}
                style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: '#f59e0b20',
                  color: '#f59e0b',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {course.code} (≥{prereq.minGrade})
                <button
                  onClick={() => removeMinGradePrereq(prereq.courseId)}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f59e0b',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                    padding: '0 2px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Correquisitos */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Correquisitos
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedCorequisite}
            disabled={loading}
            onChange={(e) => setSelectedCorequisite(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '12px',
              outline: 'none',
              opacity: loading ? 0.6 : 1
            }}
          >
            <option value="">Seleccionar curso...</option>
            {allCourses
              .filter(course => !newCourse.corequisites.includes(course.id))
              .map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
          </select>
          <button
            onClick={addCorequisite}
            disabled={loading || !selectedCorequisite}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#06b6d4',
              color: 'white',
              fontSize: '12px',
              cursor: (!selectedCorequisite || loading) ? 'not-allowed' : 'pointer',
              opacity: (!selectedCorequisite || loading) ? 0.5 : 1
            }}
          >
            + Agregar
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {newCourse.corequisites.map(coreqId => {
            const course = getCourseById(coreqId);
            return (
              <span
                key={coreqId}
                style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: '#06b6d420',
                  color: '#06b6d4',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {course.code}
                <button
                  onClick={() => removeCorequisite(coreqId)}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#06b6d4',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                    padding: '0 2px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Botones de acción */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '24px'
      }}>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'transparent',
            color: '#94a3b8',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: loading ? 0.6 : 1
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={loading || !newCourse.name.trim() || !newCourse.code.trim()}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            background: (!newCourse.name.trim() || !newCourse.code.trim() || loading)
              ? 'rgba(148, 163, 184, 0.3)'
              : `linear-gradient(135deg, ${selectedSubcategory?.color || '#8b5cf6'}, ${selectedSubcategory?.color || '#8b5cf6'}80)`,
            color: 'white',
            cursor: (!newCourse.name.trim() || !newCourse.code.trim() || loading) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            opacity: (!newCourse.name.trim() || !newCourse.code.trim() || loading) ? 0.5 : 1
          }}
        >
          {editingCourse ? 'Actualizar' : 'Crear'} Curso
        </button>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ type, item, itemType, timer, canConfirm, onConfirm, onCancel }) => {
  const getModalConfig = () => {
    const configs = {
      delete: {
        title: 'Eliminar',
        icon: '🗑️',
        color: '#ef4444',
        action: 'eliminar'
      },
      freeze: {
        title: 'Congelar',
        icon: '❄️',
        color: '#64748b',
        action: 'congelar'
      },
      unfreeze: {
        title: 'Descongelar',
        icon: '🔥',
        color: '#06b6d4',
        action: 'descongelar'
      }
    };

    const config = configs[type] || configs.delete;
    
    return {
      ...config,
      message: `¿Estás seguro de que deseas ${config.action} ${itemType === 'curso' ? 'el curso' : 'la subcategoría'} "${item.name || item.code}"?`,
      warning: type === 'delete' 
        ? `Esta acción es irreversible. ${itemType === 'curso' ? 'El curso' : 'La subcategoría'} será eliminado permanentemente.`
        : type === 'freeze'
        ? `${itemType === 'curso' ? 'El curso' : 'La subcategoría'} será congelado y no se podrán realizar modificaciones.`
        : `${itemType === 'curso' ? 'El curso' : 'La subcategoría'} será descongelado y se podrán realizar modificaciones.`,
      confirmText: `${config.action.charAt(0).toUpperCase() + config.action.slice(1)} ${itemType}`
    };
  };

  const config = getModalConfig();

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        borderRadius: '20px',
        border: `2px solid ${config.color}60`,
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {config.icon}
          </div>
          <h3 style={{
            color: config.color,
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            marginBottom: '8px'
          }}>
            {config.title}
          </h3>
          <p style={{
            color: '#cbd5e1',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: 0
          }}>
            {config.message}
          </p>
        </div>

        {/* Warning */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`,
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <p style={{
              color: '#fbbf24',
              fontSize: '14px',
              lineHeight: '1.4',
              margin: 0
            }}>
              {config.warning}
            </p>
          </div>
        </div>

        {/* Timer Circle */}
        {timer > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `4px solid ${config.color}30`,
              borderTop: `4px solid ${config.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'spin 1s linear infinite'
            }}>
              <span style={{
                color: config.color,
                fontSize: '24px',
                fontWeight: '700'
              }}>
                {timer}
              </span>
            </div>
          </div>
        )}

        {/* Confirmation Ready */}
        {canConfirm && (
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#10b981',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ✅ Ya puedes confirmar la acción
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: canConfirm 
                ? `linear-gradient(135deg, ${config.color}, ${config.color}80)` 
                : 'rgba(148, 163, 184, 0.3)',
              color: 'white',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              opacity: canConfirm ? 1 : 0.5
            }}
          >
            {config.confirmText}
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CoursesTab;