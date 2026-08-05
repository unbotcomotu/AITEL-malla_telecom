import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importar componentes de autenticación
import AuthView from './components/auth/AuthView';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Importar componentes comunes
import Layout from './components/common/Layout';

// Importar componentes de estudiante
import CurriculumView from './components/student/curriculum/CurriculumView';
import StudentCourseRegistration from './components/student/StudentCourseRegistration';
import SemesterHistoryView from './components/student/history/SemesterHistoryView'; // ← NUEVO
import CourseCatalogView from './components/student/catalog/CourseCatalogView';
// Importar componentes de administrador
import AdminDashboard from './components/admin/AdminDashboard';
import ProfessorManagement from './components/admin/ProfessorManagement';
import CourseAdminSystem from './components/admin/CourseAdminSystem';

// Importar los nuevos componentes del sistema de administración
import CategoriesTab from './components/admin/categories/CategoriesTab';
import SubcategoriesTab from './components/admin/subcategories/SubcategoriesTab';
import CoursesTab from './components/admin/courses/CoursesTab';
import SearchTab from './components/admin/search/SearchTab';
import CourseScheduleManager from './components/admin/courses/CourseScheduleManager';


// Componente principal
function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minHeight: '100vh'
        }}>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/auth" element={<AuthView />} />
            
            {/* Rutas protegidas con Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Ruta por defecto - redirige según el tipo de usuario */}
              <Route index element={<DashboardRedirect />} />
              
              {/* Rutas de estudiante */}
              <Route path="curriculum" element={<CurriculumView />} />
              <Route path="catalog" element={<CourseCatalogView />} />
              <Route path="history" element={<SemesterHistoryView />} /> {/* ← NUEVO */}
              <Route path="onboarding" element={<StudentCourseRegistration />} />
              
              {/* Rutas de administrador principales */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/professors" element={<ProfessorManagement />} />
              
              {/* Sistema de administración de cursos completo */}
              <Route path="admin/system" element={<CourseAdminSystem />} />
              
              {/* Rutas específicas para cada tab del sistema (opcional - para navegación directa) */}
              <Route path="admin/system/categories" element={<CategoriesTab />} />
              <Route path="admin/system/subcategories" element={<SubcategoriesTab />} />
              <Route path="admin/system/courses" element={<CoursesTab />} />
              <Route path="admin/system/search" element={<SearchTab />} />
              
              {/* Ruta para el gestor de horarios (se abre como modal, pero puede ser útil para URLs directas) */}
              <Route path="admin/system/courses/:courseId/schedules" element={<CourseScheduleManager />} />
            </Route>
            
            {/* Ruta catch-all */}
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Componente para redirigir según el tipo de usuario
function DashboardRedirect() {
  const { user, loading } = useAuth();
  
  console.log('🔍 DashboardRedirect - Estado actual:', { user, loading });
  
  // Mostrar loading mientras se carga
  if (loading) {
    console.log('⏳ Todavía cargando...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid transparent',
            borderTop: '4px solid #06b6d4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Cargando usuario...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a auth
  if (!user) {
    console.log('❌ No hay usuario, redirigiendo a /auth');
    return <Navigate to="/auth" replace />;
  }

  // Decidir redirección según el usuario
  console.log('👤 Usuario encontrado:', user);
  console.log('🔀 Evaluando redirección...');
  
  if (user.role === 'admin') {
    console.log('🔀 Redirigiendo a /admin (usuario es admin)');
    return <Navigate to="/admin" replace />;
  } else if (user.isFirstLogin) {
    console.log('🔀 Redirigiendo a /onboarding (primer login)');
    return <Navigate to="/onboarding" replace />;
  } else {
    console.log('🔀 Redirigiendo a /curriculum (usuario regular)');
    return <Navigate to="/curriculum" replace />;
  }
}

export default App;