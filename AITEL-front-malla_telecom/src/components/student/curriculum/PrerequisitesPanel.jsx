import React from 'react';
import { checkPrerequisites } from '../../../utils/prerequisiteUtils.js';
import { PREREQUISITE_TYPES } from '../../../data/courseData.js';

const KIND_CLASSES = {
  met: { text: 'text-good', badge: 'bg-good text-ink-on-accent', card: 'bg-good/5 border-good/20' },
  corequisite: { text: 'text-accent', badge: 'bg-accent text-ink-on-accent', card: 'bg-accent/5 border-accent/20' },
  unmet: { text: 'text-bad', badge: 'bg-bad text-white', card: 'bg-bad/5 border-bad/20' },
};

const PrerequisitesPanel = ({
  course,
  courseGrades = {},
  edges = [],
  nodes = [],
  prerequisiteTypes = {}
}) => {
  const prerequisites = course
    ? checkPrerequisites(course.id, courseGrades, edges, nodes, prerequisiteTypes)
    : [];

  const getPrerequisiteIcon = (type) => {
    switch (type) {
      case prerequisiteTypes.APPROVED:
        return '📚';
      case prerequisiteTypes.MIN_GRADE:
        return '📊';
      case prerequisiteTypes.COREQUISITE:
        return '🔗';
      default:
        return '❓';
    }
  };

  const getTypeDescription = (type, minGrade) => {
    switch (type) {
      case prerequisiteTypes.APPROVED:
        return 'Debe estar aprobado (≥11)';
      case prerequisiteTypes.MIN_GRADE:
        return `Requiere nota mínima de ${minGrade}`;
      case prerequisiteTypes.COREQUISITE:
        return 'Se puede llevar simultáneamente';
      default:
        return 'Tipo de prerrequisito desconocido';
    }
  };

  if (prerequisites.length === 0) {
    return (
      <div className="mb-6 rounded-xl bg-surface-2 p-4">
        <h3 className="m-0 mb-3 text-base font-semibold text-ink">🎯 Prerrequisitos</h3>
        <div className="flex items-center gap-2 rounded-lg border border-good/30 bg-good/10 p-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="m-0 text-sm font-medium text-good">¡Sin prerrequisitos!</p>
            <p className="m-0.5 text-xs text-good/80">Puedes llevar este curso desde el primer ciclo</p>
          </div>
        </div>
      </div>
    );
  }

  const allMet = prerequisites.every(p => p.isMet);
  const metCount = prerequisites.filter(p => p.isMet).length;

  return (
    <div className="mb-6 rounded-xl bg-surface-2 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="m-0 text-base font-semibold text-ink">🎯 Prerrequisitos</h3>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${allMet ? 'bg-good text-ink-on-accent' : 'bg-warn text-ink-on-accent'}`}>
          {metCount}/{prerequisites.length} cumplidos
        </div>
      </div>

      {/* Resumen general */}
      <div className={`mb-4 rounded-lg border p-3 ${allMet ? 'border-good/30 bg-good/10' : 'border-bad/30 bg-bad/10'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{allMet ? '✅' : '⚠️'}</span>
          <div>
            <p className={`m-0 text-sm font-semibold ${allMet ? 'text-good' : 'text-warn'}`}>
              {allMet ? '¡Listo para llevar!' : 'Prerrequisitos pendientes'}
            </p>
            <p className={`m-0.5 text-xs ${allMet ? 'text-good/80' : 'text-warn/80'}`}>
              {allMet
                ? 'Todos los prerrequisitos han sido cumplidos'
                : `Te faltan ${prerequisites.length - metCount} prerrequisitos por cumplir`}
            </p>
          </div>
        </div>
      </div>

      {/* Lista detallada */}
      <div className="text-sm text-ink">
        <h4 className="m-0 mb-3 text-sm font-semibold text-muted">📋 Detalle de prerrequisitos:</h4>

        {prerequisites.map((prereq) => {
          const kind = KIND_CLASSES[prereq.statusKind] || KIND_CLASSES.unmet;
          return (
            <div key={prereq.id} className={`mb-3 rounded-lg border p-4 transition-colors ${kind.card}`}>
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{getPrerequisiteIcon(prereq.type)}</span>
                  <div>
                    <h5 className="m-0 text-sm font-semibold text-ink">{prereq.name}</h5>
                    <p className="m-0.5 text-[11px] italic text-muted">
                      {getTypeDescription(prereq.type, prereq.minGrade)}
                    </p>
                  </div>
                </div>

                <div className={`whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold ${kind.badge}`}>
                  {prereq.isMet ? '✓' : '✗'}
                </div>
              </div>

              <p className={`m-0 mb-2 text-[13px] font-medium ${kind.text}`}>{prereq.statusText}</p>

              {prereq.recommendation && (
                <div className="mb-2 rounded-md bg-bg p-2">
                  <p className="m-0 text-xs leading-snug text-muted">
                    💡 <strong>Recomendación:</strong> {prereq.recommendation}
                  </p>
                </div>
              )}

              {prereq.currentGrade > 0 && (
                <div className="flex items-center justify-between rounded-md bg-bg px-2 py-1.5 text-[11px]">
                  <span className="text-muted">Tu nota actual:</span>
                  <span className={`font-semibold ${prereq.currentGrade >= (prereq.minGrade || 11) ? 'text-good' : 'text-warn'}`}>
                    {prereq.currentGrade}/20
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Consejos adicionales */}
      {!allMet && (
        <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-3">
          <div className="flex items-start gap-2">
            <span className="text-base">💡</span>
            <div>
              <p className="m-0 text-[13px] font-medium text-accent">Consejos para cumplir prerrequisitos:</p>
              <ul className="m-0 mt-1 list-disc pl-4 text-xs leading-snug text-ink/80">
                <li>Planifica tus cursos con anticipación</li>
                <li>Consulta con tu coordinador académico</li>
                <li>Considera llevar cursos de verano si es necesario</li>
                {prerequisites.some(p => p.type === PREREQUISITE_TYPES.COREQUISITE) && (
                  <li>Los correquisitos se pueden llevar en el mismo ciclo</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrerequisitesPanel;
