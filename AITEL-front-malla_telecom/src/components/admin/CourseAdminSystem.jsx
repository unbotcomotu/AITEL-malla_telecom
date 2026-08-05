import React, { useState } from 'react';
import CategoriesTab from './categories/CategoriesTab';
import SubcategoriesTab from './subcategories/SubcategoriesTab';
import CoursesTab from './courses/CoursesTab';
import CourseScheduleManager from './courses/CourseScheduleManager';
import SearchTab from './search/SearchTab';
import { SubcategoriesApi } from '../../services/admin/subcategories/subcategoriesApi';
import { CoursesApi } from '../../services/admin/courses/coursesApi';
import { SchedulesApi } from '../../services/admin/courses/SchedulesApi';

const CourseAdminSystem = () => {
  const [currentView, setCurrentView] = useState('categories');
  const [navigationState, setNavigationState] = useState({
    selectedCategory: null,
    selectedSubcategory: null,
    selectedCourse: null
  });

  // Estados para loading y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Definir las vistas disponibles y sus dependencias
  const views = {
    categories: { name: 'Categorías', icon: '📂', level: 0 },
    subcategories: { name: 'Subcategorías', icon: '📁', level: 1, requires: 'selectedCategory' },
    courses: { name: 'Cursos', icon: '📚', level: 2, requires: 'selectedSubcategory' },
    schedules: { name: 'Horarios', icon: '📅', level: 3, requires: 'selectedCourse' },
    search: { name: 'Buscador', icon: '🔍', level: 4 }
  };

  // Verificar qué vistas están disponibles según el estado actual
  const isViewAvailable = (viewId) => {
    const view = views[viewId];
    if (!view.requires) return true;
    return navigationState[view.requires] !== null;
  };

  // Navegar a una vista específica
  const navigateTo = (viewId) => {
    if (!loading && (isViewAvailable(viewId) || viewId === 'search')) {
      setCurrentView(viewId);
      setError(null); // Limpiar errores al navegar
    }
  };

  // Handler para seleccionar categoría (CON API)
  const handleCategorySelect = async (category) => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar subcategorías de esta categoría desde la API
      const subcategories = await SubcategoriesApi.getSubcategoriesByCategory(category.id);
      
      setNavigationState({
        selectedCategory: { ...category, subcategories },
        selectedSubcategory: null,
        selectedCourse: null
      });
      setCurrentView('subcategories');
    } catch (err) {
      setError(`Error al cargar subcategorías: ${err.message}`);
      console.error('Error al seleccionar categoría:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler para seleccionar subcategoría (CON API)
  const handleSubcategorySelect = async (subcategory) => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar cursos de esta subcategoría desde la API
      const courses = await CoursesApi.getCoursesBySubcategory(subcategory.id);
      
      setNavigationState({
        ...navigationState,
        selectedSubcategory: { ...subcategory, courses },
        selectedCourse: null
      });
      setCurrentView('courses');
    } catch (err) {
      setError(`Error al cargar cursos: ${err.message}`);
      console.error('Error al seleccionar subcategoría:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler para seleccionar curso (CON API)
  const handleCourseSelect = async (course) => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar horarios del curso desde la API
      const schedules = await SchedulesApi.getCourseSchedules(course.id);
      
      setNavigationState({
        ...navigationState,
        selectedCourse: { ...course, schedules }
      });
      setCurrentView('schedules');
    } catch (err) {
      setError(`Error al cargar horarios: ${err.message}`);
      console.error('Error al seleccionar curso:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para retroceder en el flujo
  const goBack = () => {
    if (loading) return; // No permitir retroceder mientras carga
    
    setError(null); // Limpiar errores al retroceder
    
    switch (currentView) {
      case 'subcategories':
        setNavigationState({
          selectedCategory: null,
          selectedSubcategory: null,
          selectedCourse: null
        });
        setCurrentView('categories');
        break;
      case 'courses':
        setNavigationState({
          ...navigationState,
          selectedSubcategory: null,
          selectedCourse: null
        });
        setCurrentView('subcategories');
        break;
      case 'schedules':
        setNavigationState({
          ...navigationState,
          selectedCourse: null
        });
        setCurrentView('courses');
        break;
      default:
        break;
    }
  };

  // Función para resetear todo el flujo
  const resetFlow = () => {
    if (loading) return; // No permitir resetear mientras carga
    
    setNavigationState({
      selectedCategory: null,
      selectedSubcategory: null,
      selectedCourse: null
    });
    setCurrentView('categories');
    setError(null);
  };

  // Handler para guardar horarios (CON API)
  const handleSaveSchedules = async (scheduleData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Guardar todos los horarios de una vez con el método bulk
      await SchedulesApi.bulkSaveSchedules(
        navigationState.selectedCourse.id,
        scheduleData.cycle,
        scheduleData.schedules
      );
      
      // Recargar los horarios actualizados
      const updatedSchedules = await SchedulesApi.getCourseSchedules(
        navigationState.selectedCourse.id
      );
      
      setNavigationState({
        ...navigationState,
        selectedCourse: { 
          ...navigationState.selectedCourse, 
          schedules: updatedSchedules 
        }
      });
      
      console.log('Horarios guardados exitosamente');
    } catch (err) {
      setError(`Error al guardar horarios: ${err.message}`);
      console.error('Error al guardar horarios:', err);
      throw err; // Re-lanzar para que el componente hijo también lo maneje
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'categories':
        return (
          <CategoriesTab 
            onCategorySelect={handleCategorySelect}
            disabled={loading}
          />
        );
      case 'subcategories':
        return (
          <SubcategoriesTab 
            selectedCategory={navigationState.selectedCategory}
            onSubcategorySelect={handleSubcategorySelect}
            onBack={goBack}
            disabled={loading}
          />
        );
      case 'courses':
        return (
          <CoursesTab 
            selectedSubcategory={navigationState.selectedSubcategory}
            onCourseSelect={handleCourseSelect}
            onBack={goBack}
            disabled={loading}
          />
        );
      case 'schedules':
        return (
          <CourseScheduleManager 
            course={navigationState.selectedCourse}
            onClose={goBack}
            onSave={handleSaveSchedules}
            disabled={loading}
          />
        );
      case 'search':
        return (
          <SearchTab 
            onNavigate={async (type, item) => {
              setError(null);
              
              if (type === 'category') {
                await handleCategorySelect(item);
              } else if (type === 'subcategory') {
                setLoading(true);
                try {
                  // Cargar cursos de la subcategoría
                  const courses = await CoursesApi.getCoursesBySubcategory(item.id);
                  
                  setNavigationState({
                    selectedCategory: item.category,
                    selectedSubcategory: { ...item, courses },
                    selectedCourse: null
                  });
                  setCurrentView('courses');
                } catch (err) {
                  setError(`Error al navegar a subcategoría: ${err.message}`);
                } finally {
                  setLoading(false);
                }
              } else if (type === 'course') {
                setLoading(true);
                try {
                  // Cargar horarios del curso
                  const schedules = await SchedulesApi.getCourseSchedules(item.id);
                  
                  setNavigationState({
                    selectedCategory: item.category,
                    selectedSubcategory: item.subcategory,
                    selectedCourse: { ...item, schedules }
                  });
                  setCurrentView('schedules');
                } catch (err) {
                  setError(`Error al navegar a curso: ${err.message}`);
                } finally {
                  setLoading(false);
                }
              }
            }}
            disabled={loading}
          />
        );
      default:
        return (
          <CategoriesTab 
            onCategorySelect={handleCategorySelect}
            disabled={loading}
          />
        );
    }
  };

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            🎓 Sistema de Administración de Cursos
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            Gestiona categorías, subcategorías y cursos de la malla curricular
          </p>
        </div>

        {/* Error Message */}
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
            gap: '12px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                padding: '4px 12px',
                background: 'rgba(239, 68, 68, 0.3)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Indicator */}
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
            <span>Cargando datos...</span>
          </div>
        )}

        {/* Navigation Flow */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '32px',
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          gap: '8px',
          flexWrap: 'wrap',
          opacity: loading ? '0.6' : '1',
          transition: 'opacity 0.3s ease'
        }}>
          {/* Reset Button */}
          <button
            onClick={resetFlow}
            disabled={loading}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              marginRight: '16px',
              opacity: loading ? '0.5' : '1'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
          >
            🏠 Inicio
          </button>

          {/* Navigation Steps */}
          {Object.entries(views).map(([viewId, view], index) => {
            const isActive = currentView === viewId;
            const isAvailable = isViewAvailable(viewId) || viewId === 'search';
            const isCompleted = view.level < views[currentView]?.level;
            
            return (
              <React.Fragment key={viewId}>
                {/* Step Button */}
                <button
                  onClick={() => navigateTo(viewId)}
                  disabled={!isAvailable || loading}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive 
                      ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                      : isCompleted
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : isAvailable 
                      ? 'rgba(148, 163, 184, 0.2)'
                      : 'rgba(71, 85, 105, 0.3)',
                    color: isActive || isCompleted 
                      ? 'white' 
                      : isAvailable 
                      ? '#cbd5e1' 
                      : '#64748b',
                    cursor: (isAvailable && !loading) ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isActive ? '0 4px 15px rgba(6, 182, 212, 0.4)' : 'none',
                    opacity: loading ? '0.7' : '1'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>
                    {isCompleted ? '✅' : view.icon}
                  </span>
                  <span>{view.name}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#06b6d4',
                      boxShadow: '0 0 10px #06b6d4'
                    }} />
                  )}
                </button>

                {/* Arrow between steps */}
                {index < Object.keys(views).length - 1 && viewId !== 'schedules' && (
                  <div style={{
                    color: isCompleted ? '#10b981' : '#64748b',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    margin: '0 4px',
                    transition: 'color 0.3s ease'
                  }}>
                    →
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Breadcrumb Current Selection */}
        {(navigationState.selectedCategory || navigationState.selectedSubcategory || navigationState.selectedCourse) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            padding: '12px 20px',
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            fontSize: '14px',
            color: '#67e8f9',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: '600' }}>📍 Navegación actual:</span>
            
            {navigationState.selectedCategory && (
              <>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: '#06b6d4',
                  fontSize: '12px'
                }}>
                  📂 {navigationState.selectedCategory.name}
                </span>
                {navigationState.selectedSubcategory && <span>→</span>}
              </>
            )}
            
            {navigationState.selectedSubcategory && (
              <>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#8b5cf6',
                  fontSize: '12px'
                }}>
                  📁 {navigationState.selectedSubcategory.name}
                </span>
                {navigationState.selectedCourse && <span>→</span>}
              </>
            )}
            
            {navigationState.selectedCourse && (
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                fontSize: '12px'
              }}>
                📚 {navigationState.selectedCourse.name}
              </span>
            )}
          </div>
        )}

        {/* Content Area */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          backdropFilter: 'blur(20px)',
          minHeight: '600px',
          position: 'relative',
          overflow: 'hidden',
          opacity: loading ? '0.8' : '1',
          transition: 'opacity 0.3s ease'
        }}>
          {/* Back Button (only show when not in categories or search) */}
          {currentView !== 'categories' && currentView !== 'search' && (
            <button
              onClick={goBack}
              disabled={loading}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(148, 163, 184, 0.2)',
                color: '#cbd5e1',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: loading ? '0.5' : '1'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              ← Volver
            </button>
          )}

          {/* Render Current View */}
          <div style={{ padding: currentView !== 'categories' && currentView !== 'search' ? '60px 0 0 0' : '0' }}>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CourseAdminSystem;