import React, { useState } from 'react';

const StudentOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 3;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        await fetch('/api/student/complete-onboarding', { method: 'POST' });
        window.location.href = '/curriculum';
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
    <div className="flex min-h-screen items-center justify-center p-6 text-ink">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8 rounded-xl border border-line bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="m-0 font-display text-2xl font-bold text-ink">Configuración Inicial</h2>
            <span className="text-sm text-muted">Paso {currentStep} de {totalSteps}</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px] rounded-2xl border border-line bg-surface p-8">
          {currentStep === 1 && (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-accent">¡Bienvenido a la Malla Curricular! 🎓</h3>
              <p className="mb-6 leading-relaxed text-ink">
                Para comenzar, necesitamos configurar tu perfil académico. Este proceso te ayudará a:
              </p>
              <ul className="mb-6 list-disc pl-5 leading-relaxed text-muted">
                <li>Registrar los cursos que ya has completado</li>
                <li>Identificar prerrequisitos cumplidos</li>
                <li>Planificar tu ruta académica</li>
                <li>Visualizar tu progreso en tiempo real</li>
              </ul>
              <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-accent">
                💡 <strong>Tip:</strong> Puedes modificar esta información más tarde desde tu perfil.
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-accent">¿En qué ciclo te encuentras actualmente? 📚</h3>
              <p className="mb-6 text-ink">Selecciona el ciclo académico en el que te encuentras:</p>
              <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cycle) => (
                  <button
                    key={cycle}
                    className="rounded-lg border-2 border-line bg-bg px-4 py-4 text-base font-semibold text-ink transition-colors hover:border-accent hover:bg-accent/10"
                  >
                    Ciclo {cycle}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-accent">¡Configuración Completada! ✅</h3>
              <p className="mb-6 leading-relaxed text-ink">Excelente, ya tienes todo configurado. Ahora podrás:</p>
              <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="rounded-lg border border-good/30 bg-good/10 p-4">
                  <div className="mb-2 text-lg">🗺️</div>
                  <h4 className="mb-2 text-base font-semibold text-good">Visualizar tu Malla</h4>
                  <p className="text-sm text-ink">Ve todos los cursos organizados por ciclos</p>
                </div>

                <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
                  <div className="mb-2 text-lg">📊</div>
                  <h4 className="mb-2 text-base font-semibold text-accent">Seguir tu Progreso</h4>
                  <p className="text-sm text-ink">Monitorea cursos aprobados y pendientes</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="rounded-lg border border-line px-6 py-3 text-base font-medium text-ink disabled:cursor-not-allowed disabled:bg-line/30 disabled:text-muted"
            >
              ← Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-ink-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Guardando...' : currentStep === totalSteps ? 'Finalizar ✅' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOnboarding;
