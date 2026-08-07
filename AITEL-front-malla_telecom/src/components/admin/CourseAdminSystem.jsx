import React, { useState } from 'react';
import CategoriesTab from './categories/CategoriesTab';
import SubcategoriesTab from './subcategories/SubcategoriesTab';
import CoursesTab from './courses/CoursesTab';
import CourseScheduleManager from './courses/CourseScheduleManager';
import SearchTab from './search/SearchTab';
import { SubcategoriesApi } from '../../services/admin/subcategories/subcategoriesApi';
import { CoursesApi } from '../../services/admin/courses/coursesApi';
import { SchedulesApi } from '../../services/admin/courses/schedulesApi';

const CourseAdminSystem = () => {
  const [currentView, setCurrentView] = useState('categories');
  const [navigationState, setNavigationState] = useState({
    selectedCategory: null,
    selectedSubcategory: null,
    selectedCourse: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const views = {
    categories: { name: 'Categorías', icon: '📂', level: 0 },
    subcategories: { name: 'Subcategorías', icon: '📁', level: 1, requires: 'selectedCategory' },
    courses: { name: 'Cursos', icon: '📚', level: 2, requires: 'selectedSubcategory' },
    schedules: { name: 'Horarios', icon: '📅', level: 3, requires: 'selectedCourse' },
    search: { name: 'Buscador', icon: '🔍', level: 4 }
  };

  const isViewAvailable = (viewId) => {
    const view = views[viewId];
    if (!view.requires) return true;
    return navigationState[view.requires] !== null;
  };

  const navigateTo = (viewId) => {
    if (!loading && (isViewAvailable(viewId) || viewId === 'search')) {
      setCurrentView(viewId);
      setError(null);
    }
  };

  const handleCategorySelect = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const subcategories = await SubcategoriesApi.getSubcategoriesByCategory(category.id);
      setNavigationState({
        selectedCategory: { ...category, subcategories },
        selectedSubcategory: null,
        selectedCourse: null
      });
      setCurrentView('subcategories');
    } catch (err) {
      setError(`Error al cargar subcategorías: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategorySelect = async (subcategory) => {
    setLoading(true);
    setError(null);
    try {
      const courses = await CoursesApi.getCoursesBySubcategory(subcategory.id);
      setNavigationState({
        ...navigationState,
        selectedSubcategory: { ...subcategory, courses },
        selectedCourse: null
      });
      setCurrentView('courses');
    } catch (err) {
      setError(`Error al cargar cursos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (course) => {
    setLoading(true);
    setError(null);
    try {
      const schedules = await SchedulesApi.getCourseSchedules(course.id);
      setNavigationState({ ...navigationState, selectedCourse: { ...course, schedules } });
      setCurrentView('schedules');
    } catch (err) {
      setError(`Error al cargar horarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (loading) return;
    setError(null);

    switch (currentView) {
      case 'subcategories':
        setNavigationState({ selectedCategory: null, selectedSubcategory: null, selectedCourse: null });
        setCurrentView('categories');
        break;
      case 'courses':
        setNavigationState({ ...navigationState, selectedSubcategory: null, selectedCourse: null });
        setCurrentView('subcategories');
        break;
      case 'schedules':
        setNavigationState({ ...navigationState, selectedCourse: null });
        setCurrentView('courses');
        break;
      default:
        break;
    }
  };

  const resetFlow = () => {
    if (loading) return;
    setNavigationState({ selectedCategory: null, selectedSubcategory: null, selectedCourse: null });
    setCurrentView('categories');
    setError(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'categories':
        return <CategoriesTab onCategorySelect={handleCategorySelect} disabled={loading} />;
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
        return <CategoriesTab onCategorySelect={handleCategorySelect} disabled={loading} />;
    }
  };

  return (
    <div className="min-h-screen p-6 text-ink">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="m-0 mb-2 font-display text-4xl font-bold tracking-tight">🎓 Sistema de Administración de Cursos</h1>
          <p className="text-base text-muted">Gestiona categorías, subcategorías y cursos de la malla curricular</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-bad/40 bg-bad/10 p-4 text-bad">
            <span className="text-xl">⚠️</span>
            <div className="flex-1"><strong>Error:</strong> {error}</div>
            <button onClick={() => setError(null)} className="rounded-md bg-bad/20 px-3 py-1 text-sm font-medium hover:bg-bad/30">✕</button>
          </div>
        )}

        {loading && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-accent">
            <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-accent/30 border-t-accent" />
            <span>Cargando datos...</span>
          </div>
        )}

        {/* Navigation Flow */}
        <div className={`mb-8 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-line bg-surface p-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <button
            onClick={resetFlow}
            disabled={loading}
            className="mr-4 rounded-lg bg-bad/15 px-3 py-2 text-xs font-medium text-bad transition-colors hover:bg-bad/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🏠 Inicio
          </button>

          {Object.entries(views).map(([viewId, view], index) => {
            const isActive = currentView === viewId;
            const isAvailable = isViewAvailable(viewId) || viewId === 'search';
            const isCompleted = view.level < views[currentView]?.level;

            const stepClass = isActive
              ? 'scale-105 bg-accent text-ink-on-accent shadow-lg'
              : isCompleted
                ? 'bg-good text-ink-on-accent'
                : isAvailable
                  ? 'bg-surface-2 text-ink'
                  : 'bg-line/40 text-muted';

            return (
              <React.Fragment key={viewId}>
                <button
                  onClick={() => navigateTo(viewId)}
                  disabled={!isAvailable || loading}
                  className={`relative flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${stepClass} ${
                    isAvailable && !loading ? 'cursor-pointer' : 'cursor-not-allowed'
                  } ${loading ? 'opacity-70' : ''}`}
                >
                  <span className="text-base">{isCompleted ? '✅' : view.icon}</span>
                  <span>{view.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent" />
                  )}
                </button>

                {index < Object.keys(views).length - 1 && viewId !== 'schedules' && (
                  <div className={`mx-1 text-base font-bold ${isCompleted ? 'text-good' : 'text-muted'}`}>→</div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Breadcrumb */}
        {(navigationState.selectedCategory || navigationState.selectedSubcategory || navigationState.selectedCourse) && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-5 py-3 text-sm text-accent">
            <span className="font-semibold">📍 Navegación actual:</span>

            {navigationState.selectedCategory && (
              <>
                <span className="rounded-md bg-accent/20 px-2 py-1 text-xs">📂 {navigationState.selectedCategory.name}</span>
                {navigationState.selectedSubcategory && <span>→</span>}
              </>
            )}

            {navigationState.selectedSubcategory && (
              <>
                <span className="rounded-md bg-accent-deep/20 px-2 py-1 text-xs text-accent-deep">📁 {navigationState.selectedSubcategory.name}</span>
                {navigationState.selectedCourse && <span>→</span>}
              </>
            )}

            {navigationState.selectedCourse && (
              <span className="rounded-md bg-good/20 px-2 py-1 text-xs text-good">📚 {navigationState.selectedCourse.name}</span>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className={`relative min-h-[600px] overflow-hidden rounded-2xl border border-line bg-surface transition-opacity ${loading ? 'opacity-80' : ''}`}>
          {currentView !== 'categories' && currentView !== 'search' && (
            <button
              onClick={goBack}
              disabled={loading}
              className="absolute left-5 top-5 z-10 flex items-center gap-1.5 rounded-lg bg-surface-2 px-4 py-2 text-sm font-medium text-ink transition-all hover:-translate-x-0.5 hover:bg-line disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Volver
            </button>
          )}

          <div className={currentView !== 'categories' && currentView !== 'search' ? 'pt-16' : ''}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAdminSystem;
