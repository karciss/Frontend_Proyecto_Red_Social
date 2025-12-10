# Documento de Ingeniería de Requerimientos (IEEE 830)
## Red Social Universitaria

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica los requerimientos de una red social universitaria diseñada para facilitar la interacción, comunicación y gestión académica entre estudiantes y docentes. El documento está dirigido a desarrolladores, testers, stakeholders y cualquier persona involucrada en el desarrollo y mantenimiento del sistema.

### 1.2 Alcance
Red Social Univalle es una plataforma web integrada que proporciona:
- Gestión de perfiles de usuarios (estudiantes y docentes)
- Red social con publicaciones, comentarios y reacciones
- Sistema de mensajería instantánea
- Gestión académica (materias, horarios, notas)
- Sistema de carpooling para compartir viajes
- Gestión de grupos y comunidades
- Sistema de notificaciones en tiempo real
- Administración de usuarios y contenido

El sistema busca centralizar las actividades académicas y sociales de una comunidad universitaria, mejorando la comunicación y colaboración.

### 1.3 Definiciones, Acrónimos y Abreviaturas
- **API**: Application Programming Interface (Interfaz de Programación de Aplicaciones)
- **Backend**: Parte del servidor que procesa la lógica de negocio
- **Frontend**: Interfaz de usuario con la que interactúa el usuario
- **JWT**: JSON Web Token, método de autenticación
- **Supabase**: Plataforma de base de datos y almacenamiento utilizada
- **CRUD**: Create, Read, Update, Delete (Crear, Leer, Actualizar, Eliminar)
- **CI**: Cédula de Identidad
- **Carpooling**: Sistema de viajes compartidos
- **REST**: Representational State Transfer, estilo de arquitectura de software

### 1.4 Referencias
- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- Documentación de FastAPI: https://fastapi.tiangolo.com/
- Documentación de React: https://react.dev/
- Documentación de Supabase: https://supabase.com/docs
- FUNCIONALIDADES_COMPLETAS.md (documento interno del proyecto)
- GUIA_USO_API.md (documentación técnica de la API)

### 1.5 Visión General
Este documento está organizado en 4 secciones principales:
1. **Introducción**: Contexto y propósito del documento
2. **Descripción General**: Visión global del sistema y su contexto
3. **Requisitos Específicos**: Detalle técnico de funcionalidades y restricciones
4. **Validación**: Criterios de aceptación y métodos de verificación

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
Red Social Univalle es un sistema web independiente que integra funcionalidades de red social y gestión académica. El sistema consta de:
- **Backend**: API RESTful desarrollada en Python con FastAPI
- **Frontend**: Aplicación web desarrollada en React
- **Base de Datos**: PostgreSQL gestionada mediante Supabase
- **Almacenamiento**: Sistema de archivos en Supabase Storage

El sistema se integra con servicios externos para:
- Almacenamiento de imágenes y archivos multimedia
- Autenticación y autorización de usuarios
- Notificaciones en tiempo real

### 2.2 Funciones del Producto
Las funciones principales del sistema incluyen:

#### 2.2.1 Gestión de Usuarios
- Registro y autenticación de usuarios
- Perfiles diferenciados (estudiantes y docentes)
- Gestión de información personal y académica
- Control de roles y permisos

#### 2.2.2 Red Social
- Creación y publicación de contenido
- Sistema de comentarios en publicaciones
- Reacciones (like, love, laugh, etc.)
- Sistema de amistad entre usuarios
- Colecciones personalizadas de publicaciones

#### 2.2.3 Mensajería
- Mensajes directos entre usuarios
- Conversaciones en tiempo real
- Historial de mensajes
- Notificaciones de mensajes nuevos

#### 2.2.4 Gestión Académica
- Gestión de materias y horarios
- Registro de notas
- Información de docentes por materia
- Consulta de información académica

#### 2.2.5 Carpooling
- Creación de rutas de viaje
- Sistema de pasajeros
- Gestión de puntos de recogida
- Información de vehículos y conductores

#### 2.2.6 Grupos
- Creación y gestión de grupos temáticos
- Membresía en grupos
- Administración de contenido grupal

#### 2.2.7 Notificaciones
- Notificaciones en tiempo real
- Múltiples tipos de notificaciones (amistad, reacciones, mensajes, etc.)
- Gestión de estado de notificaciones (leídas/no leídas)

#### 2.2.8 Administración
- Panel administrativo para gestión de usuarios
- Gestión de contenido académico
- Moderación de contenido social

### 2.3 Características de los Usuarios

#### 2.3.1 Estudiantes
- **Edad**: 18-30 años típicamente
- **Nivel técnico**: Medio-alto en uso de tecnología
- **Necesidades**: Comunicación social, acceso a información académica, organización de transporte
- **Frecuencia de uso**: Diaria, múltiples sesiones

#### 2.3.2 Docentes
- **Edad**: 25-65 años
- **Nivel técnico**: Medio en uso de tecnología
- **Necesidades**: Comunicación con estudiantes, gestión de información académica
- **Frecuencia de uso**: Semanal, sesiones moderadas

#### 2.3.3 Administradores
- **Rol**: Personal administrativo o técnico
- **Nivel técnico**: Alto
- **Necesidades**: Gestión completa del sistema, moderación, mantenimiento
- **Frecuencia de uso**: Diaria, según necesidades operativas

### 2.4 Restricciones

#### 2.4.1 Restricciones Técnicas
- El sistema debe ser compatible con navegadores web modernos (Chrome, Firefox, Safari, Edge)
- Backend desarrollado en Python 3.8+
- Frontend desarrollado en React 18+
- Base de datos PostgreSQL
- Debe funcionar en servidores Linux/Windows

#### 2.4.2 Restricciones de Negocio
- Los usuarios deben tener credenciales válidas de la institución
- La información académica debe ser precisa y actualizada
- El sistema debe cumplir con normativas de protección de datos

#### 2.4.3 Restricciones de Seguridad
- Autenticación obligatoria para acceso al sistema
- Encriptación de contraseñas
- Protección de datos personales
- Control de acceso basado en roles

### 2.5 Suposiciones y Dependencias

#### 2.5.1 Suposiciones
- Los usuarios tienen acceso a internet estable
- Los usuarios cuentan con dispositivos compatibles (PC, laptop, tablet)
- La institución proporciona la información académica necesaria
- Los usuarios tienen conocimientos básicos de navegación web

#### 2.5.2 Dependencias
- Disponibilidad de servicios de Supabase
- Acceso a servidores de hosting
- Mantenimiento de certificados SSL
- Disponibilidad de servicios de correo electrónico (para notificaciones)

---

## 3. Requisitos Específicos

### 3.1 Interfaces Externas

#### 3.1.1 Interfaces de Usuario
- **Interfaz Web Responsiva**: Adaptable a diferentes tamaños de pantalla
- **Navegación Intuitiva**: Menús y barras de navegación claras
- **Formularios de Entrada**: Validación en tiempo real
- **Notificaciones Visuales**: Alertas y confirmaciones de acciones

#### 3.1.2 Interfaces de Hardware
- **Dispositivos de Entrada**: Teclado, mouse, pantalla táctil
- **Requisitos Mínimos**: 
  - Resolución: 1024x768 píxeles
  - Conexión a internet: 2 Mbps mínimo

#### 3.1.3 Interfaces de Software
- **API REST**: Comunicación backend-frontend mediante JSON
- **Supabase Storage API**: Gestión de archivos multimedia
- **PostgreSQL**: Base de datos relacional

#### 3.1.4 Interfaces de Comunicación
- **Protocolo HTTP/HTTPS**: Comunicación segura
- **WebSockets**: Para notificaciones en tiempo real (si aplica)
- **JWT**: Tokens de autenticación en headers

### 3.2 Requisitos Funcionales

#### RF-001: Autenticación de Usuarios
**Prioridad**: Alta  
**Descripción**: El sistema debe permitir a los usuarios registrarse e iniciar sesión.
- El usuario debe proporcionar email y contraseña
- El sistema debe validar las credenciales
- El sistema debe generar un token JWT válido por 7 días
- El sistema debe diferenciar entre roles (estudiante, docente, admin)

#### RF-002: Gestión de Perfil de Usuario
**Prioridad**: Alta  
**Descripción**: Los usuarios deben poder gestionar su información personal.
- Actualizar nombre, apellido, biografía
- Cambiar foto de perfil
- Actualizar información de contacto
- Modificar configuración de privacidad

#### RF-003: Creación de Publicaciones
**Prioridad**: Alta  
**Descripción**: Los usuarios deben poder crear y compartir publicaciones.
- Crear publicaciones con texto e imágenes
- Editar publicaciones propias
- Eliminar publicaciones propias
- Establecer visibilidad (pública/amigos)

#### RF-004: Sistema de Comentarios
**Prioridad**: Media  
**Descripción**: Los usuarios deben poder comentar en publicaciones.
- Agregar comentarios a publicaciones
- Editar comentarios propios
- Eliminar comentarios propios
- Ver todos los comentarios de una publicación

#### RF-005: Sistema de Reacciones
**Prioridad**: Media  
**Descripción**: Los usuarios deben poder reaccionar a publicaciones.
- Reaccionar con diferentes tipos (like, love, laugh, wow, sad, angry)
- Cambiar reacción existente
- Eliminar reacción
- Ver conteo de reacciones por tipo

#### RF-006: Sistema de Amistad
**Prioridad**: Alta  
**Descripción**: Los usuarios deben poder conectar con otros usuarios.
- Enviar solicitudes de amistad
- Aceptar/rechazar solicitudes
- Ver lista de amigos
- Eliminar amigos

#### RF-007: Mensajería Directa
**Prioridad**: Alta  
**Descripción**: Los usuarios deben poder enviarse mensajes privados.
- Enviar mensajes de texto
- Ver historial de conversaciones
- Marcar mensajes como leídos
- Buscar conversaciones

#### RF-008: Gestión de Materias
**Prioridad**: Alta  
**Descripción**: El sistema debe gestionar información de materias académicas.
- Crear materias con código y nombre
- Asignar docentes a materias
- Consultar información de materias
- Actualizar información de materias (solo admin)

#### RF-009: Gestión de Horarios
**Prioridad**: Media  
**Descripción**: Los estudiantes deben poder consultar sus horarios.
- Ver horarios por día de la semana
- Ver materia, hora y aula
- Filtrar por materia o día

#### RF-010: Gestión de Notas
**Prioridad**: Alta  
**Descripción**: Los estudiantes deben poder consultar sus calificaciones.
- Ver notas por materia
- Ver diferentes tipos de evaluación
- Calcular promedio por materia

#### RF-011: Sistema de Carpooling
**Prioridad**: Media  
**Descripción**: Los usuarios deben poder compartir viajes.
- Crear rutas de viaje con origen, destino y horario
- Registrarse como pasajero en rutas
- Establecer puntos de recogida
- Ver información del conductor y vehículo
- Cancelar participación en rutas

#### RF-012: Gestión de Grupos
**Prioridad**: Media  
**Descripción**: Los usuarios deben poder crear y unirse a grupos.
- Crear grupos temáticos
- Unirse a grupos existentes
- Salir de grupos
- Ver miembros de grupos
- Publicar en grupos (si aplica)

#### RF-013: Sistema de Notificaciones
**Prioridad**: Alta  
**Descripción**: Los usuarios deben recibir notificaciones de eventos relevantes.
- Notificaciones de solicitudes de amistad
- Notificaciones de reacciones a publicaciones
- Notificaciones de comentarios
- Notificaciones de mensajes nuevos
- Marcar notificaciones como leídas
- Eliminar notificaciones antiguas automáticamente

#### RF-014: Colecciones de Publicaciones
**Prioridad**: Baja  
**Descripción**: Los usuarios deben poder organizar publicaciones en colecciones.
- Crear colecciones personalizadas
- Agregar publicaciones a colecciones
- Eliminar publicaciones de colecciones
- Ver publicaciones por colección

#### RF-015: Búsqueda de Usuarios
**Prioridad**: Media  
**Descripción**: Los usuarios deben poder buscar otros usuarios.
- Buscar por nombre o apellido
- Filtrar por rol (estudiante/docente)
- Ver perfil de usuarios encontrados

#### RF-016: Administración de Usuarios
**Prioridad**: Alta  
**Descripción**: Los administradores deben poder gestionar usuarios.
- Ver lista de todos los usuarios
- Activar/desactivar cuentas
- Modificar roles de usuarios
- Ver estadísticas de uso

#### RF-017: Carga de Archivos Multimedia
**Prioridad**: Media  
**Descripción**: El sistema debe permitir subir imágenes y archivos.
- Validar tipo y tamaño de archivos
- Almacenar archivos en Supabase Storage
- Generar URLs públicas para acceso
- Soportar formatos: JPG, PNG, GIF (hasta 5MB)

### 3.3 Requisitos No Funcionales

#### RNF-001: Rendimiento
- El sistema debe cargar la página principal en menos de 3 segundos
- Las consultas a la API deben responder en menos de 500ms en promedio
- El sistema debe soportar al menos 1000 usuarios concurrentes
- Las imágenes deben optimizarse para carga rápida

#### RNF-002: Seguridad
- Las contraseñas deben almacenarse encriptadas (bcrypt)
- Las comunicaciones deben usar HTTPS
- Los tokens JWT deben expirar después de 7 días
- Validación de entrada en todos los formularios para prevenir inyección SQL
- Implementar rate limiting para prevenir ataques de fuerza bruta

#### RNF-003: Usabilidad
- La interfaz debe ser intuitiva y fácil de usar
- Los mensajes de error deben ser claros y orientar al usuario
- El sistema debe ser accesible (WCAG 2.1 nivel AA)
- Diseño responsive para dispositivos móviles

#### RNF-004: Confiabilidad
- Disponibilidad del sistema: 99% uptime
- Respaldo automático de base de datos diario
- Recuperación ante fallos en menos de 1 hora
- Logs de errores para diagnóstico

#### RNF-005: Mantenibilidad
- Código documentado y siguiendo estándares
- Arquitectura modular y escalable
- Versionamiento con Git
- Separación clara entre frontend y backend

#### RNF-006: Escalabilidad
- Arquitectura que permita crecimiento horizontal
- Base de datos optimizada con índices
- Caché de consultas frecuentes
- Preparado para microservicios futuros

#### RNF-007: Compatibilidad
- Compatible con Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Responsive design para resoluciones desde 320px
- Soporte para dispositivos táctiles

#### RNF-008: Portabilidad
- Backend desplegable en Linux/Windows
- Frontend desplegable en cualquier servidor web
- Base de datos PostgreSQL portable

### 3.4 Restricciones de Diseño

#### 3.4.1 Arquitectura
- **Patrón MVC**: Separación de modelos, vistas y controladores
- **API RESTful**: Arquitectura REST para comunicación
- **ORM**: SQLAlchemy para abstracción de base de datos
- **Autenticación Stateless**: JWT sin sesiones en servidor

#### 3.4.2 Tecnologías Obligatorias
- **Backend**: Python 3.8+, FastAPI
- **Frontend**: React 18+, JavaScript/JSX
- **Base de Datos**: PostgreSQL
- **Hosting**: Supabase para BD y storage

#### 3.4.3 Estándares de Código
- **Python**: PEP 8 para estilo de código
- **JavaScript**: ESLint para validación
- **Nombres**: CamelCase para clases, snake_case para funciones (Python)
- **Documentación**: Docstrings en todas las funciones

### 3.5 Atributos del Sistema

#### 3.5.1 Confiabilidad
- **MTBF** (Mean Time Between Failures): 720 horas
- **MTTR** (Mean Time To Repair): 1 hora
- **Tasa de errores**: Menos de 0.1% de transacciones fallidas

#### 3.5.2 Disponibilidad
- **Uptime**: 99% de disponibilidad mensual
- **Ventanas de mantenimiento**: Programadas fuera de horario pico
- **Backup**: Respaldos diarios automáticos con retención de 30 días

#### 3.5.3 Seguridad
- **Autenticación**: Multi-factor opcional
- **Autorización**: Control de acceso basado en roles (RBAC)
- **Auditoría**: Logs de acciones críticas
- **Encriptación**: Datos sensibles encriptados en reposo y en tránsito

#### 3.5.4 Mantenibilidad
- **Modularidad**: Código organizado en módulos independientes
- **Documentación**: Documentación técnica completa
- **Testing**: Cobertura de pruebas >70%
- **Versionamiento**: Control de versiones con Git

#### 3.5.5 Portabilidad
- **Independencia de plataforma**: Funciona en Windows, Linux, macOS
- **Contenedores**: Dockerizable para despliegue
- **Configuración**: Variables de entorno para diferentes ambientes

---

## 4. Validación

### 4.1 Criterios de Aceptación

#### CA-001: Autenticación
**Requisito**: RF-001  
**Criterio**: 
- Usuario puede registrarse con email válido y contraseña segura
- Usuario puede iniciar sesión con credenciales correctas
- Usuario recibe token JWT válido
- Sistema rechaza credenciales incorrectas
**Resultado esperado**: Login exitoso en <2 segundos

#### CA-002: Publicaciones
**Requisito**: RF-003  
**Criterio**:
- Usuario puede crear publicación con texto (mínimo 1 carácter)
- Usuario puede agregar hasta 4 imágenes
- Publicación se muestra en feed inmediatamente
- Usuario puede editar su publicación
- Usuario puede eliminar su publicación
**Resultado esperado**: Publicación visible en <1 segundo

#### CA-003: Mensajería
**Requisito**: RF-007  
**Criterio**:
- Usuario puede enviar mensaje a un amigo
- Destinatario recibe notificación de mensaje nuevo
- Mensajes se muestran en orden cronológico
- Estado de lectura se actualiza correctamente
**Resultado esperado**: Mensaje entregado en <500ms

#### CA-004: Sistema de Amistad
**Requisito**: RF-006  
**Criterio**:
- Usuario puede enviar solicitud de amistad
- Destinatario recibe notificación
- Destinatario puede aceptar o rechazar
- Amistad se refleja para ambos usuarios
**Resultado esperado**: Solicitud procesada correctamente

#### CA-005: Gestión Académica
**Requisito**: RF-008, RF-009, RF-010  
**Criterio**:
- Estudiante puede ver sus materias inscritas
- Estudiante puede ver horario semanal completo
- Estudiante puede ver sus notas por materia
- Información es precisa y actualizada
**Resultado esperado**: Datos académicos precisos al 100%

#### CA-006: Carpooling
**Requisito**: RF-011  
**Criterio**:
- Usuario puede crear ruta con origen, destino, fecha y hora
- Otros usuarios pueden unirse como pasajeros
- Conductor puede ver lista de pasajeros
- Usuarios pueden salir de rutas
**Resultado esperado**: Sistema funcional de viajes compartidos

#### CA-007: Notificaciones
**Requisito**: RF-013  
**Criterio**:
- Usuario recibe notificación al recibir solicitud de amistad
- Usuario recibe notificación al recibir reacción en publicación
- Usuario recibe notificación de mensajes nuevos
- Usuario puede marcar notificaciones como leídas
- Notificaciones antiguas (>30 días) se eliminan automáticamente
**Resultado esperado**: Notificaciones entregadas en <2 segundos

#### CA-008: Rendimiento
**Requisito**: RNF-001  
**Criterio**:
- Página principal carga en <3 segundos
- API responde en <500ms promedio
- Sistema soporta 1000 usuarios concurrentes sin degradación
**Resultado esperado**: Métricas de rendimiento cumplidas

#### CA-009: Seguridad
**Requisito**: RNF-002  
**Criterio**:
- Contraseñas almacenadas con hash bcrypt
- Comunicaciones exclusivamente HTTPS
- JWT expira según configuración
- Validación de entrada previene inyección SQL
**Resultado esperado**: Auditoría de seguridad sin vulnerabilidades críticas

#### CA-010: Usabilidad
**Requisito**: RNF-003  
**Criterio**:
- Interfaz responsive funciona en móvil y desktop
- Formularios tienen validación en tiempo real
- Mensajes de error son claros y útiles
- Navegación es intuitiva sin capacitación
**Resultado esperado**: 90% de usuarios completan tareas sin ayuda

### 4.2 Métodos de Validación

#### 4.2.1 Pruebas Unitarias
**Alcance**: Funciones y métodos individuales  
**Herramientas**: pytest (Python), Jest (JavaScript)  
**Cobertura mínima**: 70%  
**Frecuencia**: En cada commit

#### 4.2.2 Pruebas de Integración
**Alcance**: Interacción entre módulos  
**Herramientas**: pytest con fixtures, Postman para API  
**Casos de prueba**: 
- Flujo completo de autenticación
- Creación de publicación con comentarios y reacciones
- Envío y recepción de mensajes
- Proceso completo de carpooling  
**Frecuencia**: En cada merge a rama principal

#### 4.2.3 Pruebas de Sistema
**Alcance**: Sistema completo end-to-end  
**Herramientas**: Selenium, Cypress  
**Escenarios**:
- Usuario registra cuenta y completa perfil
- Usuario publica, comenta y reacciona
- Usuario envía mensajes a amigos
- Estudiante consulta información académica  
**Frecuencia**: Antes de cada release

#### 4.2.4 Pruebas de Aceptación de Usuario (UAT)
**Alcance**: Validación con usuarios reales  
**Método**: Grupo piloto de 20-30 usuarios  
**Criterios**:
- Usuarios completan tareas sin asistencia
- Satisfacción de usuario >80%
- Bugs críticos = 0  
**Frecuencia**: Antes de lanzamiento en producción

#### 4.2.5 Pruebas de Rendimiento
**Alcance**: Capacidad y velocidad del sistema  
**Herramientas**: Apache JMeter, Locust  
**Métricas**:
- Tiempo de respuesta promedio
- Throughput (requests/segundo)
- Uso de recursos (CPU, memoria)
- Punto de quiebre de usuarios concurrentes  
**Frecuencia**: Antes de release y trimestralmente

#### 4.2.6 Pruebas de Seguridad
**Alcance**: Vulnerabilidades y protección de datos  
**Herramientas**: OWASP ZAP, Burp Suite  
**Verificaciones**:
- Inyección SQL
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Autenticación y autorización
- Exposición de datos sensibles  
**Frecuencia**: Antes de cada release mayor

#### 4.2.7 Pruebas de Usabilidad
**Alcance**: Experiencia de usuario  
**Método**: Observación de usuarios realizando tareas  
**Participantes**: 10-15 usuarios representativos  
**Métricas**:
- Tasa de éxito en tareas
- Tiempo para completar tareas
- Satisfacción subjetiva (escala 1-5)  
**Frecuencia**: En cambios mayores de UI

#### 4.2.8 Revisiones de Código
**Alcance**: Calidad y estándares de código  
**Método**: Pull requests revisadas por pares  
**Criterios**:
- Cumplimiento de estándares de código
- Documentación adecuada
- Ausencia de code smells
- Cobertura de pruebas  
**Frecuencia**: En cada pull request

#### 4.2.9 Pruebas de Regresión
**Alcance**: Verificar que nuevas funciones no rompen existentes  
**Método**: Suite automatizada de pruebas  
**Cobertura**: Todas las funcionalidades críticas  
**Frecuencia**: Antes de cada release

### 4.3 Matriz de Trazabilidad

| Requisito | Criterio de Aceptación | Método de Validación | Prioridad |
|-----------|------------------------|---------------------|-----------|
| RF-001 | CA-001 | Pruebas Unitarias, Integración, Seguridad | Alta |
| RF-003 | CA-002 | Pruebas Sistema, UAT | Alta |
| RF-007 | CA-003 | Pruebas Integración, Sistema | Alta |
| RF-006 | CA-004 | Pruebas Sistema, UAT | Alta |
| RF-008-010 | CA-005 | Pruebas Integración, UAT | Alta |
| RF-011 | CA-006 | Pruebas Sistema, UAT | Media |
| RF-013 | CA-007 | Pruebas Integración, Rendimiento | Alta |
| RNF-001 | CA-008 | Pruebas Rendimiento | Alta |
| RNF-002 | CA-009 | Pruebas Seguridad | Alta |
| RNF-003 | CA-010 | Pruebas Usabilidad | Alta |

---

## Anexos

### Anexo A: Glosario de Términos del Dominio
- **Feed**: Lista cronológica de publicaciones
- **Reacción**: Interacción emocional con una publicación
- **Carpooling**: Sistema de viajes compartidos
- **Ruta**: Viaje programado con origen y destino
- **Pasajero**: Usuario que se une a una ruta existente
- **Conductor**: Usuario que crea y gestiona una ruta
- **Colección**: Agrupación personalizada de publicaciones

### Anexo B: Información de Contacto
- **Equipo de Desarrollo**: [A completar]
- **Product Owner**: [A completar]
- **Stakeholders**: [A completar]

### Anexo C: Historial de Revisiones

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0 | 07/12/2025 | GitHub Copilot | Versión inicial del documento |

---

**Fin del Documento**
