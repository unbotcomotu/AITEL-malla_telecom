import React, { useState } from 'react';

const StudentOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const totalSteps = 3;

  // Al finalizar, en lugar de alert:
  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        // Guardar que completó el onboarding
        await fetch('/api/student/complete-onboarding', { method: 'POST' });
        
        // Redirigir a la malla o al registro de cursos
        window.location.href = '/curriculum'; // o usar React Router
      } catch (err) {
        alert('Error al completar onboarding');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{
      padding: '24px',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%'
      }}>
        {/* Progress Bar */}
        <div style={{
          marginBottom: '32px',
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(148, 163, 184, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Configuración Inicial
            </h2>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>
              Paso {currentStep} de {totalSteps}
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(100, 116, 139, 0.3)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          padding: '32px',
          minHeight: '400px'
        }}>
          {currentStep === 1 && (
            <div>
              <h3 style={{ color: '#67e8f9', fontSize: '20px', marginBottom: '16px' }}>
                ¡Bienvenido a la Malla Curricular! 🎓
              </h3>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
                Para comenzar, necesitamos configurar tu perfil académico. Este proceso te ayudará a:
              </p>
              <ul style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
                <li>Registrar los cursos que ya has completado</li>
                <li>Identificar prerrequisitos cumplidos</li>
                <li>Planificar tu ruta académica</li>
                <li>Visualizar tu progreso en tiempo real</li>
              </ul>
              <div style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                color: '#67e8f9'
              }}>
                💡 <strong>Tip:</strong> Puedes modificar esta información más tarde desde tu perfil.
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 style={{ color: '#67e8f9', fontSize: '20px', marginBottom: '16px' }}>
                ¿En qué ciclo te encuentras actualmente? 📚
              </h3>
              <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
                Selecciona el ciclo académico en el que te encuentras:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cycle) => (
                  <button
                    key={cycle}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '2px solid rgba(148, 163, 184, 0.3)',
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#06b6d4';
                      e.target.style.background = 'rgba(6, 182, 212, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                      e.target.style.background = 'rgba(30, 41, 59, 0.6)';
                    }}
                  >
                    Ciclo {cycle}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 style={{ color: '#67e8f9', fontSize: '20px', marginBottom: '16px' }}>
                ¡Configuración Completada! ✅
              </h3>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
                Excelente, ya tienes todo configurado. Ahora podrás:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ color: '#34d399', fontSize: '18px', marginBottom: '8px' }}>🗺️</div>
                  <h4 style={{ color: '#10b981', fontSize: '16px', marginBottom: '8px' }}>
                    Visualizar tu Malla
                  </h4>
                  <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                    Ve todos los cursos organizados por ciclos
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ color: '#22d3ee', fontSize: '18px', marginBottom: '8px' }}>📊</div>
                  <h4 style={{ color: '#06b6d4', fontSize: '16px', marginBottom: '8px' }}>
                    Seguir tu Progreso
                  </h4>
                  <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                    Monitorea cursos aprobados y pendientes
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '32px'
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: currentStep === 1 ? 'rgba(100, 116, 139, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                color: currentStep === 1 ? '#64748b' : 'white',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              ← Anterior
            </button>
            
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {currentStep === totalSteps ? 'Finalizar ✅' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOnboarding;