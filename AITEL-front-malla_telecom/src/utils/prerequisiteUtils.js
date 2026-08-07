// utils/prerequisiteUtils.js (VERSIÓN DINÁMICA)

// YA NO importar datos estáticos:
// import { initialEdgesData, initialNodesData, PREREQUISITE_TYPES } from '../data/courseData.js';

// En su lugar, recibir los datos como parámetros:
export const checkPrerequisites = (
  courseId, 
  courseGrades = {}, 
  edges = [],           // ← NUEVO: datos de prerrequisitos
  nodes = [],           // ← NUEVO: datos de cursos
  prerequisiteTypes = {} // ← NUEVO: tipos de prerrequisitos
) => {
  const prerequisites = edges.filter(e => e.target === courseId);
  
  return prerequisites.map(prereq => {
    const sourceNode = nodes.find(n => n.id === prereq.source);
    const grade = courseGrades[prereq.source] || 0;
    
    let isMet = false;
    let statusText = '';
    let statusKind = 'unmet'; // 'met' | 'corequisite' | 'unmet' — la UI decide el color
    let recommendation = '';

    switch (prereq.type) {
      case prerequisiteTypes.APPROVED:
        isMet = grade >= 11;
        statusText = isMet ? '✓ Aprobado' : grade > 0 ? `✗ Nota: ${grade}/20 (requiere ≥11)` : '✗ No cursado';
        statusKind = isMet ? 'met' : 'unmet';
        recommendation = isMet ? '' : grade > 0 ? 'Necesitas recuperar o volver a llevar este curso' : 'Debes cursar y aprobar este curso primero';
        break;

      case prerequisiteTypes.MIN_GRADE:
        isMet = grade >= prereq.minGrade;
        statusText = isMet ? `✓ Nota: ${grade}/20` : grade > 0 ? `✗ Nota: ${grade}/20 (requiere ≥${prereq.minGrade})` : `✗ No cursado (requiere ≥${prereq.minGrade})`;
        statusKind = isMet ? 'met' : 'unmet';
        recommendation = isMet ? '' : grade > 0 ? `Necesitas al menos ${prereq.minGrade} para poder llevar este curso` : `Debes cursar este curso y obtener al menos ${prereq.minGrade}`;
        break;

      case prerequisiteTypes.COREQUISITE:
        isMet = true;
        statusText = '○ Correquisito (se puede llevar junto)';
        statusKind = 'corequisite';
        recommendation = 'Puedes llevarlo en el mismo ciclo que este curso';
        break;

      default:
        statusText = '? Tipo desconocido';
        recommendation = 'Consulta con coordinación académica';
    }

    return {
      id: prereq.source,
      name: sourceNode?.name || 'Curso desconocido',
      type: prereq.type,
      minGrade: prereq.minGrade,
      currentGrade: grade,
      isMet,
      statusText,
      statusKind,
      recommendation
    };
  });
};

export const getCourseStatus = (
  courseId, 
  approvedCourses, 
  courseGrades,
  edges = [],
  nodes = [],
  prerequisiteTypes = {}
) => {
  const isApproved = approvedCourses.includes(courseId);
  const prerequisites = checkPrerequisites(courseId, courseGrades, edges, nodes, prerequisiteTypes);
  const arePrerequisitesMet = prerequisites.every(p => p.isMet);
  
  if (isApproved) return 'approved';
  if (arePrerequisitesMet) return 'available';
  return 'locked';
};