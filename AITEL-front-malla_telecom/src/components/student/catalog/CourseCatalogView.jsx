import React, { useState, useEffect, useMemo } from 'react';
import { CourseCatalogApi } from '../../../services/student/courseCatalogApi';
import CourseDetailPanel from '../curriculum/CourseDetailPanel';

const SELECT_CLASS = 'w-full rounded-lg border border-line bg-bg px-3 py-3 text-sm text-ink outline-none focus:border-accent';
const LABEL_CLASS = 'mb-2 block text-sm text-muted';

const CourseCatalogView = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCycle, setSelectedCycle] = useState('all');

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [courseGrades, setCourseGrades] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, categoriesData, gradesData] = await Promise.all([
        CourseCatalogApi.getAllCourses(),
        CourseCatalogApi.getCategories(),
        CourseCatalogApi.getStudentGrades()
      ]);

      setCourses(coursesData);
      setCategories(categoriesData);
      setCourseGrades(gradesData);
    } catch (err) {
      setError(`Error al cargar el catálogo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const category = categories.find(c => c.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  const availableCycles = useMemo(() => {
    return [...new Set(courses.map(c => c.cycle))].sort((a, b) => a - b);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let filtered = courses;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(term) ||
        course.code.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.categoryId === selectedCategory);
    }
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(course => course.subcategoryId === selectedSubcategory);
    }
    if (selectedCycle !== 'all') {
      filtered = filtered.filter(course => course.cycle === parseInt(selectedCycle));
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'code': return a.code.localeCompare(b.code);
        case 'credits': return b.credits - a.credits;
        case 'cycle': return a.cycle - b.cycle;
        default: return 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, selectedCategory, selectedSubcategory, selectedCycle, sortBy]);

  const handleCourseClick = (course) => {
    const grade = courseGrades[course.id];
    // El catálogo no tiene el grafo de prerrequisitos cargado, así que solo
    // distingue aprobado/no-aprobado (igual que ya hacía la insignia de estado).
    setSelectedCourse({
      id: course.id,
      label: course.name,
      credits: course.credits,
      cycle: course.cycle,
      status: grade >= 11 ? 'approved' : 'locked',
    });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCourse(null);
  };

  const getCourseStatusBadge = (course) => {
    const grade = courseGrades[course.id];
    if (grade >= 11) return { label: 'Aprobado', kind: 'good', icon: '✅' };
    if (grade !== undefined) return { label: 'Desaprobado', kind: 'bad', icon: '❌' };
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-ink">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" />
          <p>Cargando catálogo de cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6 text-ink">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="m-0 mb-2 font-display text-4xl font-bold tracking-tight">Catálogo de Cursos</h1>
          <p className="text-base text-muted">Explora todos los cursos disponibles en la carrera</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-bad/40 bg-bad/10 p-4 text-bad">{error}</div>
        )}

        {/* Filters Bar */}
        <div className="mb-8 rounded-2xl border border-line bg-surface p-6">
          <div className="mb-5">
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-line bg-bg px-5 py-4 text-base text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label className={LABEL_CLASS}>Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('all'); }}
                className={SELECT_CLASS}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>Subcategoría</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={selectedCategory === 'all' || availableSubcategories.length === 0}
                className={`${SELECT_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <option value="all">Todas las subcategorías</option>
                {availableSubcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>Ciclo</label>
              <select value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)} className={SELECT_CLASS}>
                <option value="all">Todos los ciclos</option>
                {availableCycles.map(cycle => (
                  <option key={cycle} value={cycle}>Ciclo {cycle}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>Ordenar por</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={SELECT_CLASS}>
                <option value="name">Nombre</option>
                <option value="code">Código</option>
                <option value="credits">Créditos</option>
                <option value="cycle">Ciclo</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-muted">
            Mostrando {filteredCourses.length} de {courses.length} cursos
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {filteredCourses.map(course => {
              const statusBadge = getCourseStatusBadge(course);

              return (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  className="relative cursor-pointer rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
                >
                  {statusBadge && (
                    <div className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      statusBadge.kind === 'good' ? 'bg-good/15 text-good' : 'bg-bad/15 text-bad'
                    }`}>
                      <span>{statusBadge.icon}</span>
                      {statusBadge.label}
                    </div>
                  )}

                  <div className="mb-2 text-sm font-semibold text-accent">{course.code}</div>

                  <h3 className="mb-3 min-h-[48px] text-lg font-bold leading-tight text-ink">{course.name}</h3>

                  <div className="mb-3 flex flex-wrap gap-3">
                    <span className="rounded-md bg-accent-deep/15 px-2.5 py-1 text-xs font-semibold text-accent-deep">
                      Ciclo {course.cycle}
                    </span>
                    <span className="rounded-md bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                      {course.credits} créditos
                    </span>
                  </div>

                  <div className="mb-3 text-xs text-muted">
                    {course.categoryName}
                    {course.subcategoryName && ` • ${course.subcategoryName}`}
                  </div>

                  <div className="text-right text-xs font-medium text-accent">Ver detalles →</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-muted">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-2xl text-ink">No se encontraron cursos</h3>
            <p className="text-base">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      <CourseDetailPanel
        course={selectedCourse}
        onClose={handleClosePanel}
        isOpen={isPanelOpen}
        courseGrades={courseGrades}
      />
    </div>
  );
};

export default CourseCatalogView;
