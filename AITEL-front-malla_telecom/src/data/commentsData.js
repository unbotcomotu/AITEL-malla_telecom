// src/data/commentsData.js
export const commentsData = {
  'Todos_general': [
    { 
      id: 1, 
      author: 'Juan Pérez', 
      authorId: 'user_001',
      content: '¿Recomiendan llevar este curso en verano? He escuchado que es bastante intensivo y quiero estar preparado.',
      timestamp: '2024-08-06T10:30:00Z',
      likes: 5,
      dislikes: 1,
      likedBy: ['user_003', 'user_004', 'user_005', 'user_006', 'user_007'], // IDs de usuarios que dieron like
      dislikedBy: ['user_008'], // IDs de usuarios que dieron dislike
      replies: [
        {
          id: 11,
          author: 'María García',
          authorId: 'user_002',
          content: 'Yo lo llevé en verano el año pasado. Es intenso pero factible si te organizas bien. Las prácticas son clave.',
          timestamp: '2024-08-06T14:15:00Z',
          likes: 8,
          dislikes: 0,
          likedBy: ['user_001', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_009', 'current_user'],
          dislikedBy: [],
          replyTo: {
            author: 'Juan Pérez',
            content: '¿Recomiendan llevar este curso en verano? He escuchado que es bastante intensivo y quiero estar preparado.',
            isReply: false
          }
        },
        {
          id: 12,
          author: 'Carlos Ruiz',
          authorId: 'user_003',
          content: 'Totalmente de acuerdo. También recomiendo formar grupos de estudio.',
          timestamp: '2024-08-06T16:45:00Z',
          likes: 3,
          dislikes: 0,
          likedBy: ['user_001', 'user_002', 'user_004'],
          dislikedBy: [],
          replyTo: {
            author: 'María García',
            content: 'Yo lo llevé en verano el año pasado. Es intenso pero factible si te organizas bien. Las prácticas son clave.',
            isReply: true
          }
        }
      ]
    },
    { 
      id: 2, 
      author: 'Ana Vásquez', 
      authorId: 'user_004',
      content: 'El laboratorio es fundamental para entender la teoría. No se salten las sesiones prácticas, son las que más ayudan.',
      timestamp: '2024-08-05T09:20:00Z',
      likes: 12,
      dislikes: 0,
      likedBy: ['user_001', 'user_002', 'user_003', 'user_005', 'user_006', 'user_007', 'user_008', 'user_009', 'user_010', 'user_011', 'user_012', 'current_user'],
      dislikedBy: [],
      replies: [
        {
          id: 21,
          author: 'Pedro Hernández',
          authorId: 'user_005',
          content: 'Confirmo. Los laboratorios son donde realmente conectas la teoría con la práctica.',
          timestamp: '2024-08-05T11:30:00Z',
          likes: 4,
          dislikes: 0,
          likedBy: ['user_001', 'user_002', 'user_003', 'user_004'],
          dislikedBy: [],
          replyTo: {
            author: 'Ana Vásquez',
            content: 'El laboratorio es fundamental para entender la teoría. No se salten las sesiones prácticas, son las que más ayudan.',
            isReply: false
          }
        }
      ]
    }
  ],

  '2025-1': {
    horario_1: [
      { 
        id: 3, 
        author: 'María López', 
        authorId: 'user_006',
        content: 'El Dr. Mendoza explica muy bien, pero es exigente con las entregas. La Dra. García complementa perfectamente.',
        timestamp: '2024-08-01T08:30:00Z',
        likes: 15,
        dislikes: 2,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_007', 'user_008', 'user_009', 'user_010', 'user_011', 'user_012', 'user_013', 'user_014', 'user_015', 'current_user'],
        dislikedBy: ['user_016', 'user_017'],
        replies: [
          {
            id: 31,
            author: 'Diego Salazar',
            authorId: 'user_007',
            content: 'Es cierto, pero si cumples con todo al día, es muy satisfactorio. Aprendes mucho.',
            timestamp: '2024-08-01T10:15:00Z',
            likes: 6,
            dislikes: 0,
            likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006'],
            dislikedBy: [],
            replyTo: {
              author: 'María López',
              content: 'El Dr. Mendoza explica muy bien, pero es exigente con las entregas. La Dra. García complementa perfectamente.',
              isReply: false
            }
          }
        ]
      },
      { 
        id: 4, 
        author: 'Pedro Vega', 
        authorId: 'user_008',
        content: 'Los exámenes son difíciles pero justos. La Dra. García da muy buenos tips para los proyectos.',
        timestamp: '2024-08-05T14:20:00Z',
        likes: 8,
        dislikes: 1,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_009'],
        dislikedBy: ['user_010'],
        replies: []
      },
      {
        id: 5,
        author: 'Sofia Chen',
        authorId: 'user_009',
        content: 'Recomiendo ir a las horas de consulta. Ambos profesores son muy accesibles y resuelven todas las dudas.',
        timestamp: '2024-08-03T16:45:00Z',
        likes: 11,
        dislikes: 0,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_008', 'user_010', 'user_011', 'user_012'],
        dislikedBy: [],
        replies: [
          {
            id: 51,
            author: 'Luis Morales',
            authorId: 'user_010',
            content: '¿Cuándo son las horas de consulta? No las encuentro en el syllabus.',
            timestamp: '2024-08-03T17:20:00Z',
            likes: 2,
            dislikes: 0,
            likedBy: ['user_001', 'user_009'],
            dislikedBy: [],
            replyTo: {
              author: 'Sofia Chen',
              content: 'Recomiendo ir a las horas de consulta. Ambos profesores son muy accesibles y resuelven todas las dudas.',
              isReply: false
            }
          },
          {
            id: 52,
            author: 'Sofia Chen',
            authorId: 'user_009',
            content: 'Los martes de 3-4pm en la oficina del Dr. Mendoza y jueves de 2-3pm con la Dra. García.',
            timestamp: '2024-08-03T18:00:00Z',
            likes: 5,
            dislikes: 0,
            likedBy: ['user_001', 'user_002', 'user_003', 'user_010', 'current_user'],
            dislikedBy: [],
            replyTo: {
              author: 'Luis Morales',
              content: '¿Cuándo son las horas de consulta? No las encuentro en el syllabus.',
              isReply: true
            }
          }
        ]
      }
    ],
    horario_2: [
      {
        id: 6,
        author: 'Roberto Silva',
        authorId: 'user_011',
        content: 'Dr. Silva es muy teórico pero se aprende mucho. El laboratorio está bien equipado y las prácticas son interesantes.',
        timestamp: '2024-08-02T11:30:00Z',
        likes: 12,
        dislikes: 1,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_008', 'user_009', 'user_010', 'user_012', 'user_013'],
        dislikedBy: ['user_014'],
        replies: [
          {
            id: 61,
            author: 'Carmen Flores',
            authorId: 'user_012',
            content: 'Sí, es más teórico que otros profesores pero la base que te da es sólida.',
            timestamp: '2024-08-02T13:15:00Z',
            likes: 7,
            dislikes: 0,
            likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_011', 'user_013'],
            dislikedBy: [],
            replyTo: {
              author: 'Roberto Silva',
              content: 'Dr. Silva es muy teórico pero se aprende mucho. El laboratorio está bien equipado y las prácticas son interesantes.',
              isReply: false
            }
          }
        ]
      },
      {
        id: 7,
        author: 'Andrea Vargas',
        authorId: 'user_013',
        content: 'Los horarios de tarde son perfectos si trabajas en las mañanas. Dr. Silva es comprensivo con eso.',
        timestamp: '2024-08-04T15:45:00Z',
        likes: 9,
        dislikes: 0,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_011', 'user_012'],
        dislikedBy: [],
        replies: []
      }
    ],
    horario_3: [
      {
        id: 8,
        author: 'Camila Torres',
        authorId: 'user_014',
        content: 'El horario de viernes intensivo es genial. Dra. Jiménez hace las 4 horas muy dinámicas.',
        timestamp: '2024-08-02T19:30:00Z',
        likes: 8,
        dislikes: 2,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_015'],
        dislikedBy: ['user_011', 'user_016'],
        replies: [
          {
            id: 81,
            author: 'Miguel Ángel',
            authorId: 'user_015',
            content: 'Al principio pensé que 4 horas seguidas serían pesadas, pero con los breaks y ejercicios se pasa volando.',
            timestamp: '2024-08-02T20:15:00Z',
            likes: 4,
            dislikes: 0,
            likedBy: ['user_001', 'user_002', 'user_003', 'user_014'],
            dislikedBy: [],
            replyTo: {
              author: 'Camila Torres',
              content: 'El horario de viernes intensivo es genial. Dra. Jiménez hace las 4 horas muy dinámicas.',
              isReply: false
            }
          }
        ]
      }
    ]
  },

  '2024-2': {
    horario_1: [
      { 
        id: 9, 
        author: 'Sofia Chen', 
        authorId: 'user_009',
        content: 'Excelente profesora, muy didáctica. Sus explicaciones son muy claras y siempre está dispuesta a ayudar.',
        timestamp: '2024-06-15T14:30:00Z',
        likes: 20,
        dislikes: 0,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_008', 'user_010', 'user_011', 'user_012', 'user_013', 'user_014', 'user_015', 'user_016', 'user_017', 'user_018', 'user_019', 'user_020', 'current_user'],
        dislikedBy: [],
        replies: [
          {
            id: 91,
            author: 'Fernando Ruiz',
            authorId: 'user_016',
            content: 'Confirmo, es de las mejores profesoras que he tenido en la carrera.',
            timestamp: '2024-06-15T16:20:00Z',
            likes: 12,
            dislikes: 0,
            likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_008', 'user_009', 'user_010', 'user_011', 'user_012'],
            dislikedBy: [],
            replyTo: {
              author: 'Sofia Chen',
              content: 'Excelente profesora, muy didáctica. Sus explicaciones son muy claras y siempre está dispuesta a ayudar.',
              isReply: false
            }
          }
        ]
      },
      { 
        id: 10, 
        author: 'Diego Ruiz', 
        authorId: 'user_017',
        content: 'Las clases son dinámicas y entretenidas. Recomiendo tomar apuntes detallados.',
        timestamp: '2024-07-02T10:45:00Z',
        likes: 12,
        dislikes: 1,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_008', 'user_009', 'user_010', 'user_011', 'user_016'],
        dislikedBy: ['current_user'],
        replies: []
      }
    ],
    horario_2: [
      {
        id: 11,
        author: 'Isabel Mendoza',
        authorId: 'user_018',
        content: 'Dr. Vega es nuevo pero muy preparado. El laboratorio tiene equipos más modernos.',
        timestamp: '2024-06-20T17:30:00Z',
        likes: 8,
        dislikes: 0,
        likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_019'],
        dislikedBy: [],
        replies: [
          {
            id: 111,
            author: 'Andrés Campos',
            authorId: 'user_019',
            content: 'Es cierto, se nota que está al día con la tecnología. Las prácticas son muy actuales.',
            timestamp: '2024-06-20T18:45:00Z',
            likes: 5,
            dislikes: 0,
            likedBy: ['user_001', 'user_002', 'user_003', 'user_004', 'user_018'],
            dislikedBy: [],
            replyTo: {
              author: 'Isabel Mendoza',
              content: 'Dr. Vega es nuevo pero muy preparado. El laboratorio tiene equipos más modernos.',
              isReply: false
            }
          }
        ]
      }
    ]
  }
}