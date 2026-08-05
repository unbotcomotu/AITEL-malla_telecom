export const initialNodesData = [
  // Ciclo 1
  { id: 'c1', name: 'Cálculo 1', credits: 5, cycle: 1 },
  { id: 'm1', name: 'Matemática Básica', credits: 5, cycle: 1 },
  { id: 'i1', name: 'Introducción a la Programación', credits: 4, cycle: 1 },
  // Ciclo 2
  { id: 'c2', name: 'Cálculo 2', credits: 5, cycle: 2 },
  { id: 'al', name: 'Álgebra Lineal', credits: 4, cycle: 2 },
  { id: 'f1', name: 'Física 1', credits: 4, cycle: 2 },
  // Ciclo 3
  { id: 'c3', name: 'Cálculo 3', credits: 5, cycle: 3 },
  { id: 'f2', name: 'Física 2', credits: 4, cycle: 3 },
  { id: 'p1', name: 'Programación de Objetos', credits: 4, cycle: 3 },
  // Ciclo 4
  { id: 'ed', name: 'Ecuaciones Diferenciales', credits: 4, cycle: 4 },
  { id: 'ce', name: 'Circuitos Eléctricos', credits: 5, cycle: 4 },
  { id: 'sd', name: 'Sistemas Digitales', credits: 4, cycle: 4 },
];

// Tipos de prerrequisitos
export const PREREQUISITE_TYPES = {
  APPROVED: 'approved', // Curso debe estar aprobado (≥11)
  MIN_GRADE: 'min_grade', // Curso con nota mínima específica (ej: ≥08)
  COREQUISITE: 'corequisite' // Curso que se puede llevar simultáneamente
};

export const initialEdgesData = [
  { id: 'e-c1-c2', source: 'c1', target: 'c2', type: PREREQUISITE_TYPES.APPROVED },
  { id: 'e-m1-al', source: 'm1', target: 'al', type: PREREQUISITE_TYPES.APPROVED },
  { id: 'e-c1-f1', source: 'c1', target: 'f1', type: PREREQUISITE_TYPES.MIN_GRADE, minGrade: 8 },
  { id: 'e-c2-c3', source: 'c2', target: 'c3', type: PREREQUISITE_TYPES.APPROVED },
  { id: 'e-f1-f2', source: 'f1', target: 'f2', type: PREREQUISITE_TYPES.APPROVED },
  { id: 'e-i1-p1', source: 'i1', target: 'p1', type: PREREQUISITE_TYPES.MIN_GRADE, minGrade: 10 },
  { id: 'e-c3-ed', source: 'c3', target: 'ed', type: PREREQUISITE_TYPES.APPROVED },
  { id: 'e-f2-ce', source: 'f2', target: 'ce', type: PREREQUISITE_TYPES.APPROVED },
  { id: 'e-p1-sd', source: 'p1', target: 'sd', type: PREREQUISITE_TYPES.APPROVED },
  { id: 'e-al-sd', source: 'al', target: 'sd', type: PREREQUISITE_TYPES.COREQUISITE }, // Las líneas punteadas representan correquisitos
];

// Simulamos las notas de los cursos aprobados
const courseGrades = {
  'c1': 15, // Aprobado con buena nota
  'm1': 12, // Aprobado
  'i1': 9,  // Aprobado pero con nota baja
  'f1': 7   // Desaprobado
};

// Datos por ciclo académico (expandido con sistema de comentarios mejorado)
const cycleData = {
  'Todos': {
    professors: 'Varios profesores',
    difficulty: 4,
    ratings: 127,
    comments: [
      { 
        id: 1, 
        author: 'Juan Pérez', 
        content: '¿Recomiendan llevar este curso en verano?', 
        timestamp: '2 días ago',
        likes: 5,
        dislikes: 1,
        replies: [
          {
            id: 11,
            author: 'Ana García',
            content: 'Es mejor con más tiempo. Las prácticas son semanales.',
            timestamp: '1 día ago',
            likes: 8,
            dislikes: 0,
            replies: [
              {
                id: 111,
                author: 'Carlos Ruiz',
                content: 'Totalmente de acuerdo, yo lo llevé en verano y fue agotador.',
                timestamp: '12 horas ago',
                likes: 3,
                dislikes: 0,
                replies: []
              }
            ]
          }
        ]
      },
      { 
        id: 2, 
        author: 'María López', 
        content: 'El laboratorio es fundamental para entender la teoría.', 
        timestamp: '3 días ago',
        likes: 12,
        dislikes: 0,
        replies: []
      }
    ]
  },
  '2025-1': {
    professors: 'Dr. Carlos Mendoza',
    difficulty: 4.2,
    ratings: 45,
    comments: [
      { 
        id: 1, 
        author: 'María López', 
        content: 'El Dr. Mendoza explica muy bien, pero es exigente.', 
        timestamp: '1 semana ago',
        likes: 15,
        dislikes: 2,
        replies: []
      },
      { 
        id: 2, 
        author: 'Pedro Vega', 
        content: 'Los exámenes son difíciles pero justos.', 
        timestamp: '3 días ago',
        likes: 8,
        dislikes: 1,
        replies: []
      }
    ]
  },
  '2024-2': {
    professors: 'Dra. Laura Jiménez',
    difficulty: 3.8,
    ratings: 52,
    comments: [
      { 
        id: 1, 
        author: 'Sofia Chen', 
        content: 'Excelente profesora, muy didáctica.', 
        timestamp: '2 meses ago',
        likes: 20,
        dislikes: 0,
        replies: []
      },
      { 
        id: 2, 
        author: 'Diego Ruiz', 
        content: 'Las clases son dinámicas y entretenidas.', 
        timestamp: '1 mes ago',
        likes: 12,
        dislikes: 1,
        replies: []
      }
    ]
  },
  '2024-1': {
    professors: 'Dr. Roberto Silva',
    difficulty: 4.5,
    ratings: 38,
    comments: [
      { 
        id: 1, 
        author: 'Andrea Morales', 
        content: 'Muy teórico, necesitas estudiar bastante.', 
        timestamp: '6 meses ago',
        likes: 9,
        dislikes: 3,
        replies: []
      },
      { 
        id: 2, 
        author: 'Luis Herrera', 
        content: 'Si le dedicas tiempo, aprendes mucho.', 
        timestamp: '5 meses ago',
        likes: 14,
        dislikes: 0,
        replies: []
      }
    ]
  }
};