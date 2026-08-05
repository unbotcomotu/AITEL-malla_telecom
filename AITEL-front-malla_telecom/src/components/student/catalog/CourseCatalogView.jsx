import React, { useState, useEffect, useMemo } from 'react';
import { CourseCatalogApi } from '../../services/student/courseCatalogApi';
import CourseDetailPanel from './curriculum/CourseDetailPanel';

const CourseCatalogView = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // name, code, credits, cycle
  const [selectedCycle, setSelectedCycle] = useState('all');

  // Panel de detalles
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Datos adicionales para el panel
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

  // Subcategorías disponibles según categoría seleccionada
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    
    const category = categories.find(c => c.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory, categories]);
  
  const availableCycles = useMemo(() => {
    const cycles = [...new Set(courses.map(c => c.cycle))].sort((a, b) => a - b);
    return cycles;
  }, [courses]);
  // Filtrar y ordenar cursos
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(term) ||
        course.code.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term)
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.categoryId === selectedCategory);
    }

    // Filtro por subcategoría
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(course => course.subcategoryId === selectedSubcategory);
    }
    if (selectedCycle !== 'all') {
      filtered = filtered.filter(course => course.cycle === parseInt(selectedCycle));
    }

    // Ordenamiento
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'code':
          return a.code.localeCompare(b.code);
        case 'credits':
          return b.credits - a.credits;
        case 'cycle':
          return a.cycle - b.cycle;
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, selectedCategory, selectedSubcategory, selectedCycle,sortBy]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCourse(null);
  };

  const getCourseStatusBadge = (course) => {
    const grade = courseGrades[course.id];
    
    if (grade >= 11) {
      return { label: 'Aprobado', color: '#10b981', icon: '✅' };
    } else if (grade !== undefined) {
      return { label: 'Desaprobado', color: '#ef4444', icon: '❌' };
    }
    
    return null;
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
          <p>Cargando catálogo de cursos...</p>
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
            Catálogo de Cursos
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            Explora todos los cursos disponibles en la carrera
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            color: '#fca5a5'
          }}>
            {error}
          </div>
        )}

        {/* Filters Bar */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>

          {/* Filters Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Category Filter */}
            <div>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('all');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                Subcategoría
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={selectedCategory === 'all' || availableSubcategories.length === 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  opacity: selectedCategory === 'all' ? 0.5 : 1,
                  cursor: selectedCategory === 'all' ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="all">Todas las subcategorías</option>
                {availableSubcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div>
            <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '14px',
                marginBottom: '8px'
            }}>
                Ciclo
            </label>
            <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
                }}
            >
                <option value="all">Todos los ciclos</option>
                {availableCycles.map(cycle => (
                <option key={cycle} value={cycle}>Ciclo {cycle}</option>
                ))}
            </select>
            </div>
            {/* Sort By */}
            <div>
              <label style={{
                display: 'block',
                color: '#cbd5e1',
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="name">Nombre</option>
                <option value="code">Código</option>
                <option value="credits">Créditos</option>
                <option value="cycle">Ciclo</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div style={{
            marginTop: '16px',
            color: '#94a3b8',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Mostrando {filteredCourses.length} de {courses.length} cursos
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredCourses.map(course => {
              const statusBadge = getCourseStatusBadge(course);
              
              return (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#06b6d4';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(6, 182, 212, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Status Badge */}
                  {statusBadge && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: `${statusBadge.color}20`,
                      border: `1px solid ${statusBadge.color}40`,
                      color: statusBadge.color,
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{statusBadge.icon}</span>
                      {statusBadge.label}
                    </div>
                  )}

                  {/* Course Code */}
                  <div style={{
                    color: '#06b6d4',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    {course.code}
                  </div>

                  {/* Course Name */}
                  <h3 style={{
                    color: '#cbd5e1',
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '12px',
                    lineHeight: '1.3',
                    minHeight: '48px'
                  }}>
                    {course.name}
                  </h3>

                  {/* Course Info */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: '#a855f7',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Ciclo {course.cycle}
                    </span>
                    
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: '#06b6d4',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {course.credits} créditos
                    </span>
                  </div>

                  {/* Category/Subcategory */}
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '12px'
                  }}>
                    {course.categoryName}
                    {course.subcategoryName && ` • ${course.subcategoryName}`}
                  </div>

                  {/* Click indicator */}
                  <div style={{
                    fontSize: '12px',
                    color: '#06b6d4',
                    fontWeight: '500',
                    textAlign: 'right'
                  }}>
                    Ver detalles →
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>
              No se encontraron cursos
            </h3>
            <p style={{ fontSize: '16px' }}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Course Detail Panel */}
      <CourseDetailPanel
        course={selectedCourse}
        onClose={handleClosePanel}
        isOpen={isPanelOpen}
        courseGrades={courseGrades}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CourseCatalogView;