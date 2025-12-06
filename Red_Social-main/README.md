# Red Social Universitaria - Universidad del Valle Bolivia

Una aplicación web y móvil para estudiantes de la Universidad del Valle Bolivia que integra módulos académicos, sociales y de carpooling.

![Logo Universidad del Valle Bolivia](https://storage.googleapis.com/copilot-img-chat/6fc0e9ae-dbf9-432d-9b5f-b5e9fc07c605.png)

## Descripción del Proyecto

Esta aplicación tiene como objetivo mejorar la experiencia universitaria mediante tres módulos principales:

1. **Módulo Académico**: Consulta de horarios, calificaciones, materias y docentes.
2. **Módulo Social**: Publicaciones, comentarios, reacciones y mensajería.
3. **Módulo Carpooling**: Compartir rutas, buscar viajes y conectar con compañeros para transporte.

## Estructura del Proyecto

```
proyecto/
├── frontend/                  # Aplicación React Native Web
│   ├── src/                   # Código fuente
│   ├── public/                # Archivos estáticos
│   └── ...                    # Configuración
│
└── backend/                   # Servidor FastAPI
    ├── app/                   # Código fuente
    └── ...                    # Configuración
```

## Tecnologías Utilizadas

### Frontend:
- React Native Web
- React Router
- Supabase Client
- Axios
- Formik + Yup
- React Native Maps (para web)
- Context API para gestión de estado y temas

### Backend:
- FastAPI (Python)
- PostgreSQL (Supabase)
- JWT para autenticación

## Modos de Interfaz

La aplicación cuenta con un modo claro y un modo oscuro, que respeta la paleta de colores oficial de la Universidad del Valle Bolivia:

- **Color Principal**: #8B1E41 (Borgoña)
- **Color Secundario**: #C0C0C0 (Gris/Plateado)

## Instalación y Configuración

### Prerequisitos
- Node.js >= 14.x
- Python >= 3.9
- Una cuenta en Supabase

### Frontend

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con las claves correspondientes
```

3. Iniciar el servidor de desarrollo:
```bash
npm start
```

### Backend

1. Crear un entorno virtual:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con las claves correspondientes
```

4. Iniciar el servidor:
```bash
uvicorn app.main:app --reload
```

## Características Principales

### Módulo Académico
- Visualización de horarios en formato tabla semanal
- Historial de calificaciones con gráficos
- Exportación de datos a PDF/Excel

### Módulo Social
- Creación de publicaciones (texto, imágenes)
- Comentarios y reacciones
- Mensajería privada y grupal

### Módulo Carpooling
- Registro de rutas con puntos de origen y destino
- Búsqueda de rutas disponibles
- Integración de mapas para visualizar recorridos
- Gestión de rutas personales disponible solo en la app móvil

## Cambios Recientes y Nuevos Componentes

Se han creado nuevos componentes organizados por módulos para mejorar la estructura y mantenibilidad del código:

### Nuevos Archivos:
- **AppNew.js**: Versión mejorada de App.js con mejor organización y todos los módulos integrados
- **styles.css.new**: Estilos actualizados con la paleta de colores de la Universidad
- **mockData.js**: Datos simulados para demostración de los componentes
- **AcademicComponents.js**: Componentes del módulo académico
- **SocialComponents.js**: Componentes del módulo social
- **CarpoolingComponents.js**: Componentes del módulo de carpooling

### Cambiar entre versiones de la aplicación

Para utilizar la versión mejorada de la interfaz:

1. Renombre `AppNew.js` a `App.js`:
```bash
mv src/AppNew.js src/App.js
```

2. Renombre `styles.css.new` a `styles.css`:
```bash
mv src/styles.css.new src/styles.css
```

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para más información sobre el proyecto:
- **Email**: desarrollo@univalle.edu.bo
- **Web**: https://www.univalle.edu.bo

---

© 2024 Universidad del Valle Bolivia - Todos los derechos reservados
