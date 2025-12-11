/**
 * Modelo de usuario basado en el esquema de la base de datos
 * Este archivo define las estructuras de datos de usuarios según sus roles
 */

// Modelo base para todos los usuarios
export class Usuario {
  constructor({
    id_usuario,
    ci_usuario,
    nombre,
    apellido,
    correo,
    contraseña,
    telefono,
    direccion,
    fecha_nacimiento,
    foto_perfil,
    estado = 'activo',
    fecha_registro,
    ultimo_acceso,
    rol
  } = {}) {
    this.id_usuario = id_usuario;
    this.ci_usuario = ci_usuario;
    this.nombre = nombre;
    this.apellido = apellido;
    this.correo = correo;
    this.contraseña = contraseña;
    this.telefono = telefono;
    this.direccion = direccion;
    this.fecha_nacimiento = fecha_nacimiento;
    this.foto_perfil = foto_perfil;
    this.estado = estado;
    this.fecha_registro = fecha_registro;
    this.ultimo_acceso = ultimo_acceso;
    this.rol = rol;
  }
}

// Modelo específico para estudiantes
export class Estudiante extends Usuario {
  constructor(props) {
    super(props);
    this.id_estudiante = props.id_estudiante;
    this.ci_est = props.ci_est;
    this.carrera = props.carrera;
    this.semestre = props.semestre;
    this.facultad = props.facultad;
    this.fecha_ingreso = props.fecha_ingreso;
    this.promedio_general = props.promedio_general;
    this.creditos_aprobados = props.creditos_aprobados;
  }
}

// Modelo específico para docentes
export class Docente extends Usuario {
  constructor(props) {
    super(props);
    this.id_docente = props.id_docente;
    this.ci_doc = props.ci_doc;
    this.especialidad_doc = props.especialidad_doc;
    this.departamento = props.departamento;
    this.grado_academico = props.grado_academico;
    this.fecha_contratacion = props.fecha_contratacion;
  }
}

// Modelo específico para administradores
export class Administrador extends Usuario {
  constructor(props) {
    super(props);
    this.id_administrador = props.id_administrador;
    this.cargo = props.cargo;
    this.departamento = props.departamento;
    this.nivel_acceso = props.nivel_acceso;
    this.fecha_contratacion = props.fecha_contratacion;
  }
}

// Modelo para materias/asignaturas
export class Materia {
  constructor({
    id_materia,
    codigo,
    nombre,
    id_docente,
    departamento,
    creditos,
    cupo_max,
    descripcion,
    semestre_recomendado
  } = {}) {
    this.id_materia = id_materia;
    this.codigo = codigo;
    this.nombre = nombre;
    this.id_docente = id_docente;
    this.departamento = departamento;
    this.creditos = creditos;
    this.cupo_max = cupo_max;
    this.descripcion = descripcion;
    this.semestre_recomendado = semestre_recomendado;
  }
}

// Modelo para inscripción de materias
export class Inscripcion {
  constructor({
    id_inscripcion,
    id_estudiante,
    id_materia,
    fecha_inscripcion,
    estado,
    nota_final
  } = {}) {
    this.id_inscripcion = id_inscripcion;
    this.id_estudiante = id_estudiante;
    this.id_materia = id_materia;
    this.fecha_inscripcion = fecha_inscripcion;
    this.estado = estado;
    this.nota_final = nota_final;
  }
}

// Modelo para calificaciones
export class Calificacion {
  constructor({
    id_calificacion,
    id_inscripcion,
    tipo_evaluacion,
    calificacion,
    fecha_evaluacion,
    comentario
  } = {}) {
    this.id_calificacion = id_calificacion;
    this.id_inscripcion = id_inscripcion;
    this.tipo_evaluacion = tipo_evaluacion;
    this.calificacion = calificacion;
    this.fecha_evaluacion = fecha_evaluacion;
    this.comentario = comentario;
  }
}

// Modelo para departamentos académicos
export class Departamento {
  constructor({
    id_departamento,
    nombre,
    facultad,
    director,
    ubicacion,
    telefono,
    correo
  } = {}) {
    this.id_departamento = id_departamento;
    this.nombre = nombre;
    this.facultad = facultad;
    this.director = director;
    this.ubicacion = ubicacion;
    this.telefono = telefono;
    this.correo = correo;
  }
}

// Modelo para publicaciones sociales
export class Publicacion {
  constructor({
    id_publicacion,
    id_usuario,
    contenido,
    fecha_publicacion,
    tipo,
    visibilidad,
    adjunto_url,
    likes = 0,
    comentarios = 0
  } = {}) {
    this.id_publicacion = id_publicacion;
    this.id_usuario = id_usuario;
    this.contenido = contenido;
    this.fecha_publicacion = fecha_publicacion;
    this.tipo = tipo;
    this.visibilidad = visibilidad;
    this.adjunto_url = adjunto_url;
    this.likes = likes;
    this.comentarios = comentarios;
  }
}

// Modelo para rutas de carpooling
export class Ruta {
  constructor({
    id_ruta,
    id_conductor,
    origen,
    destino,
    hora_salida,
    dias_semana,
    capacidad,
    estado,
    costo,
    notas
  } = {}) {
    this.id_ruta = id_ruta;
    this.id_conductor = id_conductor;
    this.origen = origen;
    this.destino = destino;
    this.hora_salida = hora_salida;
    this.dias_semana = dias_semana;
    this.capacidad = capacidad;
    this.estado = estado;
    this.costo = costo;
    this.notas = notas;
  }
}

// Modelo para participantes en rutas de carpooling
export class Pasajero {
  constructor({
    id_pasajero,
    id_ruta,
    id_usuario,
    punto_recogida,
    hora_recogida,
    estado,
    fecha_registro
  } = {}) {
    this.id_pasajero = id_pasajero;
    this.id_ruta = id_ruta;
    this.id_usuario = id_usuario;
    this.punto_recogida = punto_recogida;
    this.hora_recogida = hora_recogida;
    this.estado = estado;
    this.fecha_registro = fecha_registro;
  }
}

// Modelo para eventos académicos
export class Evento {
  constructor({
    id_evento,
    titulo,
    descripcion,
    fecha_inicio,
    fecha_fin,
    ubicacion,
    organizador,
    tipo,
    capacidad,
    estado
  } = {}) {
    this.id_evento = id_evento;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.ubicacion = ubicacion;
    this.organizador = organizador;
    this.tipo = tipo;
    this.capacidad = capacidad;
    this.estado = estado;
  }
}

// Ejemplo de uso:
/*
const estudiante: Estudiante = {
  ci_usuario: '12345678',
  ci_est: '12345678',
  nombre: 'María',
  apellido: 'Rodríguez',
  correo: 'maria@univalle.edu',
  carrera: 'Ingeniería de Sistemas',
  semestre: 6,
  facultad: 'Ingeniería',
  estado: 'activo',
  rol: 'estudiante'
};

const docente: Docente = {
  ci_usuario: '87654321',
  ci_doc: '87654321',
  nombre: 'Carlos',
  apellido: 'Mendoza',
  correo: 'carlos@univalle.edu',
  especialidad_doc: 'Desarrollo Web',
  departamento: 'Informática',
  estado: 'activo',
  rol: 'docente'
};
*/