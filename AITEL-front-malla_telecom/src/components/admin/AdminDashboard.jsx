import React,{useEffect,useState} from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardApi } from '../../services/admin/DashboardApi';
const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Estados para datos dinámicos
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

  // Carga inicial de datos
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

  // Función para refrescar datos
  const handleRefresh = async () => {
    await loadDashboardData();
  };

  return (
    <div style={{
      padding: '24px',
      color: 'white',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header con botón refresh */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              marginBottom: '8px'
            }}>
              Panel de Administración
            </h1>
            <p style={{ 
              color: '#94a3b8', 
              margin: 0, 
              fontSize: '16px' 
            }}>
              Bienvenido, {user?.name || 'Administrador'}
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              background: loading 
                ? 'rgba(148, 163, 184, 0.3)' 
                : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ 
              animation: loading ? 'spin 1s linear infinite' : 'none' 
            }}>
              🔄
            </span>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Tarjeta de Estadísticas Principales */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6)'
            }} />
            
            <h3 style={{ 
              color: '#67e8f9', 
              marginBottom: '20px', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              📊 Estadísticas Generales
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{ color: '#cbd5e1', fontSize: '14px' }}>📚 Total de Cursos:</span>
                <span style={{ 
                  color: '#06b6d4', 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  opacity: loading ? 0.5 : 1 
                }}>
                  {loading ? '...' : stats.totalCourses.toLocaleString()}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{ color: '#cbd5e1', fontSize: '14px' }}>👨‍🏫 Total de Profesores:</span>
                <span style={{ 
                  color: '#10b981', 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  opacity: loading ? 0.5 : 1 
                }}>
                  {loading ? '...' : stats.totalProfessors.toLocaleString()}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{ color: '#cbd5e1', fontSize: '14px' }}>👥 Estudiantes Activos:</span>
                <span style={{ 
                  color: '#f59e0b', 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  opacity: loading ? 0.5 : 1 
                }}>
                  {loading ? '...' : stats.activeStudents.toLocaleString()}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{ color: '#cbd5e1', fontSize: '14px' }}>📂 Categorías:</span>
                <span style={{ 
                  color: '#8b5cf6', 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  opacity: loading ? 0.5 : 1 
                }}>
                  {loading ? '...' : stats.totalCategories.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Acciones Rápidas */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981, #059669)'
            }} />
            
            <h3 style={{ 
              color: '#67e8f9', 
              marginBottom: '20px', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              ⚡ Acciones Rápidas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                disabled={loading}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>+</span>
                Agregar Nuevo Curso
              </button>
              <button 
                disabled={loading}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>+</span>
                Registrar Profesor
              </button>
              <button 
                disabled={loading}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>📊</span>
                Generar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #8b5cf6, #a855f7)'
          }} />
          
          <h3 style={{ 
            color: '#67e8f9', 
            marginBottom: '20px', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            🕒 Actividad Reciente
          </h3>
          
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              color: '#94a3b8'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(148, 163, 184, 0.3)',
                  borderTop: '2px solid #06b6d4',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Cargando actividad reciente...
              </div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#94a3b8',
              fontSize: '14px'
            }}>
              No hay actividad reciente registrada
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((activity, index) => (
                <div key={activity.id || index} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderLeft: '4px solid #06b6d4',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'}
                >
                  <div style={{ 
                    color: '#cbd5e1', 
                    fontSize: '14px',
                    marginBottom: '6px',
                    lineHeight: '1.4'
                  }}>
                    {activity.description || activity.action}
                  </div>
                  <div style={{ 
                    color: '#94a3b8', 
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>🕐 {activity.timestamp || activity.time}</span>
                    <span>•</span>
                    <span>👤 {activity.user}</span>
                    {activity.type && (
                      <>
                        <span>•</span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(6, 182, 212, 0.2)',
                          color: '#06b6d4',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
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
            border: '1px solid #06b6d460',
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
              border: '4px solid #06b6d430',
              borderTop: '4px solid #06b6d4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>
              Cargando dashboard...
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

export default AdminDashboard;