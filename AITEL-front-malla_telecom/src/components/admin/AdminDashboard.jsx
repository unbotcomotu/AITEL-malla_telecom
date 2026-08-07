import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardApi } from '../../services/admin/dashboardApi';

const ACTION_BUTTONS = [
  { label: 'Agregar Nuevo Curso', icon: '+', className: 'bg-accent', path: '/admin/system' },
  { label: 'Registrar Profesor', icon: '+', className: 'bg-good', path: '/admin/professors' },
  { label: 'Gestionar Semestres', icon: '📅', className: 'bg-accent-deep', path: '/admin/semesters' },
  { label: 'Generar Reporte (próximamente)', icon: '📊', className: 'bg-warn' },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalProfessors: 0,
    activeStudents: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    scheduledClasses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, activityData] = await Promise.all([
        DashboardApi.getDashboardStats(),
        DashboardApi.getRecentActivity(5)
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      setError('Error al cargar datos del dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadDashboardData();
  };

  const statRows = [
    { label: '📚 Total de Cursos:', value: stats.totalCourses, className: 'text-accent' },
    { label: '👨‍🏫 Total de Profesores:', value: stats.totalProfessors, className: 'text-good' },
    { label: '👥 Estudiantes Activos:', value: stats.activeStudents, className: 'text-warn' },
    { label: '📂 Categorías:', value: stats.totalCategories, className: 'text-accent-deep' },
  ];

  return (
    <div className="min-h-screen p-6 text-ink">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="m-0 mb-2 font-display text-3xl font-bold tracking-tight text-ink">Panel de Administración</h1>
            <p className="m-0 text-base text-muted">Bienvenido, {user?.fullName || 'Administrador'}</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-bad/30 bg-bad/10 p-4 text-bad">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Estadísticas */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <h3 className="mb-5 text-lg font-semibold text-ink">📊 Estadísticas Generales</h3>
            <div className="flex flex-col gap-4">
              {statRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1">
                  <span className="text-sm text-ink">{row.label}</span>
                  <span className={`text-lg font-bold ${row.className} ${loading ? 'opacity-50' : ''}`}>
                    {loading ? '...' : row.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-good" />
            <h3 className="mb-5 text-lg font-semibold text-ink">⚡ Acciones Rápidas</h3>
            <div className="flex flex-col gap-3">
              {ACTION_BUTTONS.map((action) => (
                <button
                  key={action.label}
                  disabled={loading || !action.path}
                  onClick={action.path ? () => navigate(action.path) : undefined}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-ink-on-accent transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${action.className}`}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-accent-deep" />
          <h3 className="mb-5 text-lg font-semibold text-ink">🕒 Actividad Reciente</h3>

          {loading ? (
            <div className="flex items-center justify-center gap-3 p-10 text-muted">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
              Cargando actividad reciente...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted">No hay actividad reciente registrada</div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="rounded-xl border-l-4 border-accent bg-bg p-4 transition-colors hover:bg-surface-2"
                >
                  <div className="mb-1.5 text-sm leading-relaxed text-ink">
                    {activity.description || activity.action}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>🕐 {activity.timestamp || activity.time}</span>
                    <span>•</span>
                    <span>👤 {activity.user}</span>
                    {activity.type && (
                      <>
                        <span>•</span>
                        <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          {activity.type}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/30 bg-surface p-6 text-ink">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
            <span className="text-base font-semibold">Cargando dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
