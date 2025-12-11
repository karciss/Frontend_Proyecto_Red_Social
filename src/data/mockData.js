// Datos simulados para la Red Social Universitaria

// Datos de usuarios
export const users = [
  {
    id: 'user-1',
    nombre: 'María López',
    email: 'maria.lopez@univalle.edu',
    rol: 'estudiante',
    carrera: 'Ingeniería Informática',
    semestre: 7,
    avatar: 'ML'
  },
  {
    id: 'user-2',
    nombre: 'Juan Pérez',
    email: 'juan.perez@univalle.edu',
    rol: 'estudiante',
    carrera: 'Ingeniería Informática',
    semestre: 5,
    avatar: 'JP'
  },
  {
    id: 'user-3',
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@univalle.edu',
    rol: 'estudiante',
    carrera: 'Ingeniería de Sistemas',
    semestre: 8,
    avatar: 'CR'
  },
  {
    id: 'user-4',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@univalle.edu',
    rol: 'estudiante',
    carrera: 'Ciencias de la Computación',
    semestre: 6,
    avatar: 'AM'
  },
  {
    id: 'prof-1',
    nombre: 'Dr. Carlos Mendoza',
    email: 'carlos.mendoza@univalle.edu',
    rol: 'docente',
    departamento: 'Informática',
    avatar: 'CM'
  },
  {
    id: 'prof-2',
    nombre: 'Dra. Laura Espinoza',
    email: 'laura.espinoza@univalle.edu',
    rol: 'docente',
    departamento: 'Informática',
    avatar: 'LE'
  }
];

// Datos de cursos/materias
export const courses = [
  {
    id: 1,
    codigo: 'INF-310',
    nombre: 'Desarrollo Web Avanzado',
    docente: 'Dr. Carlos Mendoza',
    grupo: 'A',
    creditos: 4,
    horarios: [
      { dia: 'Lunes', inicio: '08:00', fin: '10:00', aula: 'Lab 3' },
      { dia: 'Miércoles', inicio: '08:00', fin: '10:00', aula: 'Lab 3' }
    ]
  },
  {
    id: 2,
    codigo: 'INF-315',
    nombre: 'Inteligencia Artificial',
    docente: 'Dra. Laura Espinoza',
    grupo: 'B',
    creditos: 4,
    horarios: [
      { dia: 'Martes', inicio: '14:00', fin: '16:00', aula: '304' },
      { dia: 'Jueves', inicio: '14:00', fin: '16:00', aula: '304' }
    ]
  },
  {
    id: 3,
    codigo: 'INF-320',
    nombre: 'Desarrollo Móvil',
    docente: 'Ing. Roberto Salinas',
    grupo: 'A',
    creditos: 3,
    horarios: [
      { dia: 'Lunes', inicio: '10:00', fin: '12:00', aula: 'Lab 5' },
      { dia: 'Viernes', inicio: '14:00', fin: '16:00', aula: 'Lab 5' }
    ]
  },
  {
    id: 4,
    codigo: 'MAT-250',
    nombre: 'Estadística para Informática',
    docente: 'Lic. Patricia Rojas',
    grupo: 'C',
    creditos: 4,
    horarios: [
      { dia: 'Martes', inicio: '10:00', fin: '12:00', aula: '201' },
      { dia: 'Jueves', inicio: '10:00', fin: '12:00', aula: '201' }
    ]
  }
];

// Datos de calificaciones
export const grades = [
  {
    userId: 'user-1',
    courseId: 1,
    parcial1: 85,
    parcial2: 90,
    final: 88,
    promedio: 87.7,
    estado: 'APROBADO'
  },
  {
    userId: 'user-1',
    courseId: 2,
    parcial1: 78,
    parcial2: 85,
    final: 92,
    promedio: 85.0,
    estado: 'APROBADO'
  },
  {
    userId: 'user-1',
    courseId: 3,
    parcial1: 90,
    parcial2: 88,
    final: 95,
    promedio: 91.0,
    estado: 'APROBADO'
  },
  {
    userId: 'user-1',
    courseId: 4,
    parcial1: 75,
    parcial2: 80,
    final: 82,
    promedio: 79.0,
    estado: 'APROBADO'
  }
];

// Datos de publicaciones sociales
export const posts = [
  {
    id: 1,
    userId: 'user-1',
    contenido: 'Acabo de terminar el proyecto final de Desarrollo Web Avanzado. ¡Qué alivio! Ahora a estudiar para el examen de Inteligencia Artificial 🤖.',
    fechaCreacion: '2025-09-10T08:30:00',
    likes: ['user-2', 'user-3', 'user-4'],
    comentarios: [
      {
        id: 101,
        userId: 'user-2',
        contenido: '¡Felicidades! Yo también estoy terminando mi proyecto.',
        fechaCreacion: '2025-09-10T08:35:00'
      },
      {
        id: 102,
        userId: 'user-4',
        contenido: '¿Podrías compartir tus apuntes de IA?',
        fechaCreacion: '2025-09-10T08:40:00'
      }
    ]
  },
  {
    id: 2,
    userId: 'user-2',
    contenido: '¿Alguien tiene los apuntes de la clase de Estadística? Me perdí la clase del martes 📊.',
    fechaCreacion: '2025-09-09T15:20:00',
    likes: ['user-3'],
    comentarios: []
  },
  {
    id: 3,
    userId: 'user-3',
    contenido: 'Recordatorio: La entrega del proyecto de Desarrollo Móvil es este viernes. No lo olviden! 📱',
    imagen: 'https://placehold.co/600x400/png?text=Recordatorio+Proyecto+Móvil',
    fechaCreacion: '2025-09-09T10:15:00',
    likes: ['user-1', 'user-2', 'user-4', 'prof-1'],
    comentarios: [
      {
        id: 103,
        userId: 'prof-1',
        contenido: 'Gracias por el recordatorio, Carlos. Recuerden que deben entregar también la documentación.',
        fechaCreacion: '2025-09-09T11:30:00'
      }
    ]
  }
];

// Datos de grupos de chat
export const chatGroups = [
  {
    id: 1,
    nombre: 'Grupo Desarrollo Web Avanzado',
    participantes: ['user-1', 'user-2', 'user-3', 'user-4', 'prof-1'],
    icono: '👨‍💻',
    mensajes: [
      {
        id: 1001,
        userId: 'user-1',
        texto: 'Hola a todos! Alguien ya empezó el proyecto final?',
        fechaCreacion: '2025-09-10T10:30:00'
      },
      {
        id: 1002,
        userId: 'user-2',
        texto: 'Yo estoy trabajando en la estructura de la base de datos',
        fechaCreacion: '2025-09-10T10:32:00'
      },
      {
        id: 1003,
        userId: 'user-4',
        texto: 'Yo apenas estoy revisando los requerimientos 😅',
        fechaCreacion: '2025-09-10T10:35:00'
      }
    ]
  },
  {
    id: 2,
    nombre: 'Inteligencia Artificial - Grupo B',
    participantes: ['user-1', 'user-2', 'user-3', 'prof-2'],
    icono: '🤖',
    mensajes: []
  }
];

// Datos de rutas de carpooling
export const carpoolingRoutes = [
  { 
    id: 1, 
    conductorId: 'user-1', 
    origen: 'Zona Sur', 
    destino: 'Campus Universidad', 
    horario: '07:30', 
    dias: ['Lunes', 'Miércoles', 'Viernes'],
    capacidad: 4,
    ocupados: 2,
    paradas: [
      { nombre: 'Plaza San Miguel', hora: '07:15' },
      { nombre: 'Avenida Las Américas', hora: '07:25' }
    ],
    pasajeros: [
      { userId: 'user-3', paradaId: 0 },
      { userId: 'user-4', paradaId: 1 }
    ]
  },
  { 
    id: 2, 
    conductorId: 'user-2', 
    origen: 'Zona Norte', 
    destino: 'Campus Universidad', 
    horario: '08:00', 
    dias: ['Lunes', 'Martes', 'Jueves'],
    capacidad: 3,
    ocupados: 3,
    paradas: [
      { nombre: 'Plaza Principal', hora: '07:40' },
      { nombre: 'Parque Central', hora: '07:50' }
    ],
    pasajeros: [
      { userId: 'user-1', paradaId: 0 },
      { userId: 'user-3', paradaId: 1 },
      { userId: 'user-4', paradaId: 1 }
    ]
  },
  { 
    id: 3, 
    conductorId: 'user-4', 
    origen: 'Zona Este', 
    destino: 'Campus Universidad', 
    horario: '07:45', 
    dias: ['Martes', 'Jueves', 'Viernes'],
    capacidad: 4,
    ocupados: 1,
    paradas: [
      { nombre: 'Centro Comercial Este', hora: '07:30' },
      { nombre: 'Terminal de Buses', hora: '07:40' }
    ],
    pasajeros: [
      { userId: 'user-3', paradaId: 0 }
    ]
  }
];
