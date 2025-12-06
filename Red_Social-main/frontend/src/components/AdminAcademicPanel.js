import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import academicService from '../services/academicService';
import { apiService } from '../services/api';
import AdminUsersPanel from './AdminUsersPanel';

/**
 * Panel de Administración Académica
 * Solo accesible para usuarios con rol "administrador"
 */
export default function AdminAcademicPanel() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('materias');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados para materias
  const [materias, setMaterias] = useState([]);
  const [showMateriaModal, setShowMateriaModal] = useState(false);
  const [editingMateria, setEditingMateria] = useState(null);
  const [materiaForm, setMateriaForm] = useState({
    nombre_materia: '',
    codigo_materia: '',
    id_doc: '',
    origen: 'MANUAL'
  });
  
  // Estados para horarios
  const [horarios, setHorarios] = useState([]);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [horarioForm, setHorarioForm] = useState({
    id_materia: '',
    carrera: '',
    id_grupo: '',
    dia_semana: 'Lunes',
    hora_inicio: '08:00',
    hora_fin: '10:00',
    aula: ''
  });
  const [carreras, setCarreras] = useState([]);
  const [gruposFiltrados, setGruposFiltrados] = useState([]);
  const [searchEstudianteCI, setSearchEstudianteCI] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [horariosEstudiante, setHorariosEstudiante] = useState([]);
  
  // Estados para asignación de materias a estudiantes
  const [estudiantes, setEstudiantes] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [showAsignacionModal, setShowAsignacionModal] = useState(false);
  const [showAsignarGrupoModal, setShowAsignarGrupoModal] = useState(false);
  const [estudianteSinGrupo, setEstudianteSinGrupo] = useState(null);
  const [asignacionForm, setAsignacionForm] = useState({
    ci_estudiante: '',
    id_materia: '',
    id_grupo: ''
  });
  const [grupoEstudianteForm, setGrupoEstudianteForm] = useState({
    ci_estudiante: '',
    id_grupo: ''
  });
  const [modoCrearGrupo, setModoCrearGrupo] = useState(false);
  const [nuevoGrupoForm, setNuevoGrupoForm] = useState({
    id_grupo: '',
    carrera: ''
  });

  // Estados para notas
  const [notas, setNotas] = useState([]);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const [notaForm, setNotaForm] = useState({
    id_user: '',
    id_materia: '',
    nota: '',
    tipo_nota: 'Parcial'
  });
  const [filtroEstudiante, setFiltroEstudiante] = useState('');
  const [filtroMateria, setFiltroMateria] = useState('');

  // Verificar que el usuario sea administrador
  useEffect(() => {
    if (user?.rol !== 'administrador') {
      setError('No tienes permisos para acceder a esta sección');
    }
  }, [user]);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (user?.rol === 'administrador') {
      if (activeTab === 'materias') {
        loadMaterias();
      } else if (activeTab === 'horarios') {
        loadMaterias();
        loadGrupos();
        loadEstudiantes();
        loadCarreras();
      } else if (activeTab === 'asignaciones') {
        loadEstudiantes();
        loadMaterias();
      } else if (activeTab === 'notas') {
        loadEstudiantes();
        loadMaterias();
      }
    }
  }, [activeTab, user]);

  // ============= FUNCIONES DE CARGA =============
  
  const loadMaterias = async () => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await academicService.getMaterias();
    console.log('📚 Materias cargadas:', data);
    console.log('❌ Error al cargar materias:', apiError);
    if (apiError) {
      console.error('Error cargando materias:', apiError);
      setError('No se pudieron cargar las materias desde el backend.');
      setMaterias([]);
    } else {
      console.log('✅ Materias establecidas:', data);
      setMaterias(data || []);
    }
    setLoading(false);
  };

  const loadHorarios = async () => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await academicService.getHorarios();
    if (apiError) {
      console.error('Error cargando horarios:', apiError);
      setError('No se pudieron cargar los horarios desde el backend.');
      setHorarios([]);
    } else {
      setHorarios(data || []);
    }
    setLoading(false);
  };

  const loadEstudiantes = async () => {
    setLoading(true);
    const { data, error: apiError } = await academicService.getEstudiantes();
    if (apiError) {
      console.error('Error cargando estudiantes:', apiError);
      // No mostrar error crítico, solo log en consola
      // El endpoint puede fallar si no hay datos o hay problema con el join Usuario
      setEstudiantes([]);
    } else {
      console.log('👥 Estructura de estudiantes:', data);
      if (data && data.length > 0) {
        console.log('👤 Primer estudiante completo:', JSON.stringify(data[0], null, 2));
      }
      setEstudiantes(data || []);
      if (error && activeTab === 'asignaciones') {
        setError(null); // Limpiar errores previos si la carga fue exitosa
      }
    }
    setLoading(false);
  };

  const loadDocentes = async () => {
    const { data, error: apiError } = await academicService.getDocentes();
    if (apiError) {
      console.error('Error cargando docentes:', apiError);
      setDocentes([]);
    } else {
      setDocentes(data || []);
    }
  };

  const loadGrupos = async () => {
    const { data, error: apiError } = await academicService.getGrupos();
    if (apiError) {
      console.error('Error cargando grupos:', apiError);
      setGrupos([]);
    } else {
      setGrupos(data || []);
    }
  };

  const loadCarreras = async () => {
    // Cargar carreras únicas desde los estudiantes
    const { data, error: apiError } = await academicService.getEstudiantes();
    if (!apiError && data) {
      const carrerasUnicas = [...new Set(data.map(est => est.carrera))].filter(Boolean);
      setCarreras(carrerasUnicas);
    }
  };

  const loadNotas = async (ciEstudiante) => {
    if (!ciEstudiante) {
      setNotas([]);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: apiError } = await academicService.getNotasEstudiante(ciEstudiante);
    if (apiError) {
      console.error('Error cargando notas:', apiError);
      setError('No se pudieron cargar las notas desde el backend.');
      setNotas([]);
    } else {
      setNotas(data || []);
    }
    setLoading(false);
  };

  // Filtrar grupos por carrera seleccionada
  useEffect(() => {
    if (horarioForm.carrera && grupos.length > 0) {
      // Obtener IDs de grupos que pertenecen a estudiantes de la carrera seleccionada
      const idsGruposCarrera = [...new Set(
        estudiantes
          .filter(est => est.carrera === horarioForm.carrera)
          .map(est => est.id_grupo)
          .filter(Boolean)
      )];
      
      // Filtrar objetos de grupos completos que coincidan con esos IDs
      const gruposCarrera = grupos.filter(g => idsGruposCarrera.includes(g.id_grupo));
      setGruposFiltrados(gruposCarrera);
    } else {
      setGruposFiltrados([]);
    }
  }, [horarioForm.carrera, grupos, estudiantes]);

  const buscarEstudiante = async () => {
    if (!searchEstudianteCI.trim()) {
      setError('Ingresa el CI del estudiante');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar estudiante por CI
      const { data: estudiante, error: errorEst } = await academicService.getEstudianteByCi(searchEstudianteCI.trim());
      
      if (errorEst || !estudiante) {
        setError('No se encontró ningún estudiante con ese CI');
        setEstudianteSeleccionado(null);
        setHorariosEstudiante([]);
        setLoading(false);
        return;
      }

      setEstudianteSeleccionado(estudiante);

      // Si el estudiante tiene grupo, obtener sus horarios
      if (estudiante.id_grupo) {
        const { data: horariosData, error: errorHor } = await academicService.getHorariosByGrupo(estudiante.id_grupo);
        
        if (errorHor) {
          console.error('Error cargando horarios:', errorHor);
          setHorariosEstudiante([]);
        } else {
          setHorariosEstudiante(horariosData || []);
        }
      } else {
        setHorariosEstudiante([]);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al buscar estudiante');
    }

    setLoading(false);
  };

  // ============= FUNCIONES CRUD MATERIAS =============
  
  const handleCreateMateria = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (editingMateria) {
      // Actualizar materia existente
      const { data, error: apiError } = await academicService.updateMateria(editingMateria.id_materia, materiaForm);
      
      if (apiError) {
        setError(apiError);
      } else {
        setSuccessMessage('Materia actualizada exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowMateriaModal(false);
        setEditingMateria(null);
        setMateriaForm({ nombre_materia: '', codigo_materia: '', id_doc: '', origen: 'MANUAL' });
        loadMaterias();
      }
    } else {
      // Crear nueva materia
      const { data, error: apiError } = await academicService.createMateria(materiaForm);
      
      if (apiError) {
        setError(apiError);
      } else {
        setSuccessMessage('Materia creada exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowMateriaModal(false);
        setMateriaForm({ nombre_materia: '', codigo_materia: '', id_doc: '', origen: 'MANUAL' });
        loadMaterias();
      }
    }
    setLoading(false);
  };

  const handleEditMateria = (materia) => {
    setEditingMateria(materia);
    setMateriaForm({
      nombre_materia: materia.nombre_materia,
      codigo_materia: materia.codigo_materia,
      id_doc: materia.id_doc || '',
      origen: materia.origen
    });
    setShowMateriaModal(true);
    loadDocentes(); // Cargar docentes al abrir el modal de edición
  };

  const handleDeleteMateria = async (idMateria) => {
    if (!window.confirm('¿Estás seguro de eliminar esta materia?')) return;
    
    setLoading(true);
    const { error: apiError } = await academicService.deleteMateria(idMateria);
    
    if (apiError) {
      setError(apiError);
    } else {
      setSuccessMessage('Materia eliminada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadMaterias();
    }
    setLoading(false);
  };

  // ============= FUNCIONES CRUD HORARIOS =============
  
  const handleCreateHorario = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Convertir horas de HH:MM a HH:MM:SS
    const horarioData = {
      ...horarioForm,
      hora_inicio: horarioForm.hora_inicio.length === 5 ? `${horarioForm.hora_inicio}:00` : horarioForm.hora_inicio,
      hora_fin: horarioForm.hora_fin.length === 5 ? `${horarioForm.hora_fin}:00` : horarioForm.hora_fin
    };
    
    const { data, error: apiError } = await academicService.createHorario(horarioData);
    
    if (apiError) {
      setError(apiError);
    } else {
      setSuccessMessage('Horario creado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowHorarioModal(false);
      setHorarioForm({ id_materia: '', carrera: '', id_grupo: '', dia_semana: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00', aula: '' });
    }
    setLoading(false);
  };

  const handleDeleteHorario = async (idHorario) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario?')) return;
    
    setLoading(true);
    const { error: apiError } = await academicService.deleteHorario(idHorario);
    
    if (apiError) {
      setError(apiError);
    } else {
      setSuccessMessage('Horario eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadHorarios();
    }
    setLoading(false);
  };

  // ============= FUNCIONES ASIGNACIÓN ESTUDIANTES =============
  
  const handleAsignarMateria = async (e) => {
    e.preventDefault();
    
    // Verificar si el estudiante tiene grupo
    const estudiante = estudiantes.find(est => est.ci_est === asignacionForm.ci_estudiante);
    
    if (!estudiante) {
      setError('Estudiante no encontrado');
      return;
    }
    
    if (!estudiante.id_grupo) {
      // El estudiante no tiene grupo, mostrar modal para asignarle uno
      setEstudianteSinGrupo(estudiante);
      setGrupoEstudianteForm({
        ci_estudiante: estudiante.ci_est,
        id_grupo: ''
      });
      // Cargar carreras y grupos disponibles
      loadCarreras();
      loadGrupos();
      setShowAsignarGrupoModal(true);
      return;
    }
    
    // El estudiante ya tiene grupo, proceder con la asignación de materia
    setLoading(true);
    
    const { data, error: apiError } = await academicService.asignarMateriaEstudiante(asignacionForm);
    
    if (apiError) {
      setError(apiError);
    } else {
      setSuccessMessage('Materia asignada exitosamente al grupo del estudiante');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowAsignacionModal(false);
      setAsignacionForm({ ci_estudiante: '', id_materia: '', id_grupo: '' });
      loadEstudiantes(); // Recargar estudiantes
    }
    setLoading(false);
  };
  
  const handleCrearNuevoGrupo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Crear nuevo grupo con el formato correcto del backend
      const grupoData = {
        nombre_grupo: nuevoGrupoForm.id_grupo, // El nombre del grupo (ej: "A", "B", "1A")
        gestion_grupo: null // Sin gestión por ahora
      };

      const response = await apiService.grupos.create(grupoData);
      const grupoCreado = response.data;
      
      setSuccessMessage(`✅ Grupo ${grupoCreado.id_grupo} creado exitosamente`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Actualizar el formulario con el grupo recién creado
      setGrupoEstudianteForm({
        ...grupoEstudianteForm,
        id_grupo: grupoCreado.id_grupo
      });
      
      // Recargar grupos
      await loadGrupos();
      
      // Cambiar a modo selección
      setModoCrearGrupo(false);
      setNuevoGrupoForm({ id_grupo: '', carrera: '' });
      
    } catch (err) {
      setError(err.message || 'Error al crear grupo');
    }
    
    setLoading(false);
  };
  
  const handleAsignarGrupoEstudiante = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Asignar grupo al estudiante
      await apiService.estudiantes.update(
        grupoEstudianteForm.ci_estudiante,
        { id_grupo: grupoEstudianteForm.id_grupo }
      );
      
      setSuccessMessage('Grupo asignado exitosamente. Ahora puedes asignar la materia.');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Cerrar modal de grupo y recargar estudiantes
      setShowAsignarGrupoModal(false);
      await loadEstudiantes();
      
      // Ahora proceder con la asignación de materia
      const { data, error: apiError } = await academicService.asignarMateriaEstudiante(asignacionForm);
      
      if (apiError) {
        setError(apiError);
      } else {
        setSuccessMessage('Materia asignada exitosamente al estudiante');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowAsignacionModal(false);
        setAsignacionForm({ ci_estudiante: '', id_materia: '', id_grupo: '' });
      }
    } catch (err) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  // ============= FUNCIONES CRUD NOTAS =============

  const handleCreateNota = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (editingNota) {
      // Actualizar nota existente
      const updateData = {
        nota: parseFloat(notaForm.nota),
        tipo_nota: notaForm.tipo_nota
      };

      const { data, error: apiError } = await academicService.updateNota(editingNota.id_nota, updateData);

      if (apiError) {
        setError(apiError);
      } else {
        setSuccessMessage('Nota actualizada exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowNotaModal(false);
        setEditingNota(null);
        setNotaForm({ id_user: '', id_materia: '', nota: '', tipo_nota: 'Parcial' });
        loadNotas(filtroEstudiante);
      }
    } else {
      // Crear nueva nota
      const notaData = {
        id_user: notaForm.id_user,
        id_materia: notaForm.id_materia,
        nota: parseFloat(notaForm.nota),
        tipo_nota: notaForm.tipo_nota,
        origen: 'MANUAL'
      };

      const { data, error: apiError } = await academicService.createNota(notaData);

      if (apiError) {
        setError(apiError);
      } else {
        setSuccessMessage('Nota creada exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowNotaModal(false);
        // Si se creó para un estudiante diferente, cambiar el filtro
        setFiltroEstudiante(notaForm.id_user);
        setNotaForm({ id_user: '', id_materia: '', nota: '', tipo_nota: 'Parcial' });
        loadNotas(notaForm.id_user);
      }
    }
    setLoading(false);
  };

  const handleEditNota = (nota) => {
    setEditingNota(nota);
    setNotaForm({
      id_user: nota.id_user || '',
      id_materia: nota.id_materia || '',
      nota: nota.nota?.toString() || '',
      tipo_nota: nota.tipo_nota || 'Parcial'
    });
    setShowNotaModal(true);
  };

  const handleDeleteNota = async (idNota) => {
    if (!window.confirm('¿Estás seguro de eliminar esta nota?')) return;

    setLoading(true);
    const { error: apiError } = await academicService.deleteNota(idNota);

    if (apiError) {
      setError(apiError);
    } else {
      setSuccessMessage('Nota eliminada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadNotas(filtroEstudiante);
    }
    setLoading(false);
  };

  // ============= RENDERIZADO =============
  
  if (user?.rol !== 'administrador') {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: theme.colors.error 
      }}>
        <h2>⛔ Acceso Denegado</h2>
        <p>Solo los administradores pueden acceder a esta sección</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      paddingBottom: '60px',
      width: '100%',
      maxWidth: '100%',
      height: '100vh',
      overflowY: 'auto',
      color: theme.colors.text
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
        borderRadius: '12px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
          🎓 Panel de Administración Académica
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
          Gestión de materias, horarios y asignaciones
        </p>
      </div>

      {/* Mensajes */}
      {error && !loading && (
        <div style={{
          padding: '16px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#c33'
        }}>
          ❌ {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}
      
      {successMessage && (
        <div style={{
          padding: '16px',
          background: '#efe',
          border: '1px solid #cfc',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#3c3'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: `2px solid ${theme.colors.primaryLight}20`
      }}>
        {['materias', 'horarios', 'notas', 'asignaciones', 'usuarios'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab ? theme.colors.primary : 'transparent',
              color: activeTab === tab ? 'white' : theme.colors.text,
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? '600' : '400',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'materias' && '📚'}
            {tab === 'horarios' && '🕐'}
            {tab === 'notas' && '📊'}
            {tab === 'asignaciones' && '👥'}
            {tab === 'usuarios' && '👤'}
            {' '}{tab}
          </button>
        ))}
      </div>

      {/* Contenido según tab activa */}
      {activeTab === 'materias' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Gestión de Materias</h2>
            <button
              onClick={() => {
                setShowMateriaModal(true);
                loadDocentes(); // Cargar docentes al abrir el modal
              }}
              style={{
                padding: '12px 28px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              <span>✨</span> Nueva Materia
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
              <p>Cargando materias...</p>
            </div>
          ) : materias.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: theme.colors.cardBackground,
              borderRadius: '12px',
              border: `2px dashed ${theme.colors.primaryLight}40`
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>📚</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>No hay materias creadas</h3>
              <p style={{ margin: '0 0 20px 0', opacity: 0.7 }}>
                Comienza creando tu primera materia haciendo clic en "Nueva Materia"
              </p>
              <button
                onClick={() => setShowMateriaModal(true)}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                ➕ Crear Primera Materia
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {materias.map(materia => (
                <div
                  key={materia.id_materia}
                  style={{
                    padding: '24px',
                    background: '#2c2c3e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  }}
                >
                  <h3 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>{materia.nombre_materia}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>🔖</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Código:</strong> {materia.codigo_materia}
                    </p>
                    {materia.docente ? (
                      <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: theme.colors.primaryLight }}>👨‍🏫</span>
                        <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Docente:</strong> {materia.docente.usuario?.nombre} {materia.docente.usuario?.apellido}
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>(CI: {materia.docente.ci_doc})</span>
                      </p>
                    ) : materia.id_doc ? (
                      <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: theme.colors.primaryLight }}>👨‍🏫</span>
                        <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Docente (CI):</strong> {materia.id_doc}
                      </p>
                    ) : (
                      <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>👨‍🏫</span> Sin docente asignado
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Origen:</strong> {materia.origen}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleEditMateria(materia)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = `${theme.colors.primary}30`;
                        e.target.style.borderColor = theme.colors.primaryLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                        e.target.style.borderColor = `${theme.colors.primaryLight}50`;
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteMateria(materia.id_materia)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(231, 76, 60, 0.15)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.25)';
                        e.target.style.borderColor = '#e74c3c';
                        e.target.style.color = '#ff5252';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.15)';
                        e.target.style.borderColor = 'rgba(231, 76, 60, 0.3)';
                        e.target.style.color = '#ff6b6b';
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'horarios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Gestión de Horarios</h2>
            <button
              onClick={() => {
                setShowHorarioModal(true);
                loadMaterias();
                loadGrupos();
                loadCarreras();
                loadEstudiantes();
              }}
              style={{
                padding: '12px 28px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              <span>✨</span> Nuevo Horario
            </button>
          </div>

          {/* Buscador de Estudiante */}
          <div style={{
            padding: '20px',
            background: theme.colors.cardBackground,
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#ffffff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🔍</span> Buscar Horarios de Estudiante
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  CI del Estudiante
                </label>
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  value={searchEstudianteCI}
                  onChange={(e) => setSearchEstudianteCI(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && buscarEstudiante()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <button
                onClick={buscarEstudiante}
                disabled={loading}
                style={{
                  padding: '12px 28px',
                  background: loading ? `${theme.colors.primary}60` : theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 12px ${theme.colors.primary}40`
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = theme.colors.primaryDark || theme.colors.primary;
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = theme.colors.primary;
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Información del Estudiante */}
          {estudianteSeleccionado && (
            <div style={{
              padding: '24px',
              background: '#2c2c3e',
              borderRadius: '16px',
              marginBottom: '20px',
              border: `1px solid ${theme.colors.primary}60`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#ffffff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>👤</span> Información del Estudiante
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <strong style={{ color: '#ffffff' }}>Nombre:</strong> {estudianteSeleccionado.usuario?.nombre} {estudianteSeleccionado.usuario?.apellido}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <strong style={{ color: '#ffffff' }}>CI:</strong> {estudianteSeleccionado.ci_est}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <strong style={{ color: '#ffffff' }}>Carrera:</strong> {estudianteSeleccionado.carrera}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <strong style={{ color: '#ffffff' }}>Semestre:</strong> {estudianteSeleccionado.semestre}
                </div>
              </div>
            </div>
          )}

          {/* Horarios del Estudiante */}
          {estudianteSeleccionado && (
            <div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>📅 Horarios</h3>
              
              {horariosEstudiante.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  background: theme.colors.cardBackground,
                  borderRadius: '12px',
                  border: `2px dashed ${theme.colors.primaryLight}40`
                }}>
                  <div style={{ fontSize: '50px', marginBottom: '10px' }}>📅</div>
                  <p style={{ opacity: 0.7 }}>
                    {estudianteSeleccionado.id_grupo 
                      ? 'Este estudiante no tiene horarios asignados aún' 
                      : 'Este estudiante no está asignado a ningún grupo'}
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '15px'
                }}>
                  {horariosEstudiante.map(horario => (
                    <div
                      key={horario.id_horario}
                      style={{
                        padding: '15px',
                        background: theme.colors.cardBackground,
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}30`
                      }}
                    >
                      <div style={{ marginBottom: '10px', fontWeight: '600', fontSize: '16px' }}>
                        {horario.dia_semana}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>
                        ⏰ {horario.hora_inicio} - {horario.hora_fin}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.8 }}>
                        🏫 Aula: {horario.aula}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensaje inicial */}
          {!estudianteSeleccionado && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: theme.colors.cardBackground,
              borderRadius: '12px',
              border: `2px dashed ${theme.colors.primaryLight}40`
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🕐</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Busca un Estudiante</h3>
              <p style={{ margin: '0', opacity: 0.7, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                Ingresa el CI de un estudiante para ver sus horarios de clases
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notas' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Gestión de Notas</h2>
            <button
              onClick={() => {
                setShowNotaModal(true);
                setEditingNota(null);
                setNotaForm({ id_user: '', id_materia: '', nota: '', tipo_nota: 'Parcial' });
              }}
              style={{
                padding: '12px 28px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              <span>✨</span> Nueva Nota
            </button>
          </div>

          {/* Filtros */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '25px',
            padding: '20px',
            background: theme.colors.cardBackground,
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                Filtrar por Estudiante
              </label>
              <select
                value={filtroEstudiante}
                onChange={(e) => {
                  setFiltroEstudiante(e.target.value);
                  loadNotas(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.primaryLight}50`,
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Seleccionar estudiante</option>
                {estudiantes
                  .filter(est => est.usuario || est.id_user) // Solo estudiantes con usuario
                  .map(est => {
                    const userCi = est.usuario?.ci || est.id_user?.ci || est.ci_est;
                    return (
                      <option key={est.ci_est} value={userCi}>
                        {est.usuario?.nombre || est.id_user?.nombre} {est.usuario?.apellido || est.id_user?.apellido} - CI: {userCi}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                Filtrar por Materia
              </label>
              <select
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.primaryLight}50`,
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todas las materias</option>
                {materias.map(m => (
                  <option key={m.id_materia} value={m.id_materia}>
                    {m.nombre_materia} ({m.codigo_materia})
                  </option>
                ))}
              </select>
            </div>

            {(filtroEstudiante || filtroMateria) && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => {
                    setFiltroEstudiante('');
                    setFiltroMateria('');
                  }}
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                  🔄 Limpiar Filtros
                </button>
              </div>
            )}
          </div>

          {/* Lista de notas */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
              <p>Cargando notas...</p>
            </div>
          ) : (() => {
            const notasFiltradas = notas.filter(nota => {
              const matchEstudiante = !filtroEstudiante || nota.id_user === filtroEstudiante;
              const matchMateria = !filtroMateria || nota.id_materia === filtroMateria;
              return matchEstudiante && matchMateria;
            });

            if (notasFiltradas.length === 0) {
              return (
                <div style={{
                  textAlign: 'center',
                  padding: '60px',
                  background: theme.colors.cardBackground,
                  borderRadius: '12px',
                  border: `2px dashed ${theme.colors.primaryLight}40`
                }}>
                  <div style={{ fontSize: '60px', marginBottom: '20px' }}>📊</div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>
                    {!filtroEstudiante
                      ? 'Selecciona un estudiante para ver sus notas'
                      : filtroMateria
                        ? 'No hay notas con estos filtros'
                        : 'Este estudiante no tiene notas registradas'}
                  </h3>
                  <p style={{ margin: '0 0 20px 0', opacity: 0.7 }}>
                    {!filtroEstudiante
                      ? 'Selecciona un estudiante del filtro de arriba para cargar y visualizar sus notas'
                      : filtroMateria
                        ? 'Intenta cambiar los filtros para ver otras notas'
                        : 'Puedes crear la primera nota para este estudiante haciendo clic en "Nueva Nota"'}
                  </p>
                  {filtroEstudiante && !filtroMateria && (
                    <button
                      onClick={() => setShowNotaModal(true)}
                      style={{
                        padding: '12px 24px',
                        background: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}
                    >
                      ➕ Crear Nota para este Estudiante
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {notasFiltradas.map(nota => {
                  const estudiante = estudiantes.find(e => e.ci_est === nota.id_user);
                  const materia = materias.find(m => m.id_materia === nota.id_materia);

                  const getNotaColor = (valor) => {
                    if (valor >= 70) return '#4CAF50';
                    if (valor >= 51) return '#FFC107';
                    return '#f44336';
                  };

                  return (
                    <div
                      key={nota.id_nota}
                      style={{
                        padding: '24px',
                        background: '#2c2c3e',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 8px 0', color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                            {materia?.nombre_materia || nota.materia?.nombre_materia || 'Materia'}
                          </h3>
                          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                            {materia?.codigo_materia || nota.materia?.codigo_materia || 'N/A'}
                          </p>
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          background: `${getNotaColor(nota.nota)}30`,
                          borderRadius: '8px',
                          border: `2px solid ${getNotaColor(nota.nota)}`,
                          fontSize: '24px',
                          fontWeight: '700',
                          color: getNotaColor(nota.nota),
                          minWidth: '70px',
                          textAlign: 'center'
                        }}>
                          {nota.nota}
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginBottom: '16px',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px'
                      }}>
                        <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: theme.colors.primaryLight }}>👤</span>
                          <strong style={{ color: 'rgba(255,255,255,0.95)' }}>Estudiante:</strong>
                          {estudiante?.usuario?.nombre || estudiante?.id_user?.nombre || 'N/A'}{' '}
                          {estudiante?.usuario?.apellido || estudiante?.id_user?.apellido || ''}
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>(CI: {nota.id_user})</span>
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: theme.colors.primaryLight }}>📝</span>
                          <strong style={{ color: 'rgba(255,255,255,0.95)' }}>Tipo:</strong> {nota.tipo_nota}
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: theme.colors.primaryLight }}>📅</span>
                          <strong style={{ color: 'rgba(255,255,255,0.95)' }}>Fecha:</strong>
                          {nota.fecha_registro_nota ? new Date(nota.fecha_registro_nota).toLocaleDateString('es-ES') : 'N/A'}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Origen:</strong> {nota.origen || 'MANUAL'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button
                          onClick={() => handleEditNota(nota)}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            border: `1px solid ${theme.colors.primaryLight}50`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = `${theme.colors.primary}30`;
                            e.target.style.borderColor = theme.colors.primaryLight;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.1)';
                            e.target.style.borderColor = `${theme.colors.primaryLight}50`;
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteNota(nota.id_nota)}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'rgba(231, 76, 60, 0.15)',
                            color: '#ff6b6b',
                            border: '1px solid rgba(231, 76, 60, 0.3)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(231, 76, 60, 0.25)';
                            e.target.style.borderColor = '#e74c3c';
                            e.target.style.color = '#ff5252';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(231, 76, 60, 0.15)';
                            e.target.style.borderColor = 'rgba(231, 76, 60, 0.3)';
                            e.target.style.color = '#ff6b6b';
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'asignaciones' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Asignación de Materias a Estudiantes</h2>
            <button
              onClick={() => {
                setShowAsignacionModal(true);
                loadGrupos(); // Cargar grupos disponibles
              }}
              style={{
                padding: '12px 28px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              <span>✨</span> Asignar Materia
            </button>
          </div>

          <p style={{ opacity: 0.7, marginBottom: '20px' }}>
            Asigna materias a estudiantes específicos para que aparezcan en su módulo académico personal.
          </p>
        </div>
      )}

      {/* Modal Nueva Materia */}
      {showMateriaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#2c2c3e',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#ffffff', marginBottom: '25px', fontSize: '24px' }}>
              {editingMateria ? '✏️ Editar Materia' : '📚 Nueva Materia'}
            </h2>
            <form onSubmit={handleCreateMateria}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Nombre de la Materia *
                </label>
                <input
                  type="text"
                  required
                  value={materiaForm.nombre_materia}
                  onChange={(e) => setMateriaForm({...materiaForm, nombre_materia: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Código de Materia *
                </label>
                <input
                  type="text"
                  required
                  value={materiaForm.codigo_materia}
                  onChange={(e) => setMateriaForm({...materiaForm, codigo_materia: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Docente (Opcional)
                </label>
                <select
                  value={materiaForm.id_doc}
                  onChange={(e) => setMateriaForm({...materiaForm, id_doc: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#ffffff', color: '#666666' }}>
                    -- Sin docente asignado --
                  </option>
                  {docentes.map(docente => (
                    <option 
                      key={docente.ci_doc} 
                      value={docente.ci_doc}
                      style={{ background: '#ffffff', color: '#000000' }}
                    >
                      {docente.usuario?.nombre} {docente.usuario?.apellido} (CI: {docente.ci_doc})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowMateriaModal(false);
                    setEditingMateria(null);
                    setMateriaForm({ nombre_materia: '', codigo_materia: '', id_doc: '', origen: 'MANUAL' });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? `${theme.colors.primary}60` : theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: `0 4px 12px ${theme.colors.primary}40`
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primaryDark || theme.colors.primary;
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primary;
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? (editingMateria ? 'Actualizando...' : 'Creando...') : (editingMateria ? 'Actualizar Materia' : 'Crear Materia')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Horario */}
      {showHorarioModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#2c2c3e',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#ffffff', marginBottom: '25px', fontSize: '24px' }}>🕐 Nuevo Horario</h2>
            <form onSubmit={handleCreateHorario}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Materia *
                </label>
                <select
                  required
                  value={horarioForm.id_materia}
                  onChange={(e) => setHorarioForm({...horarioForm, id_materia: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#ffffff', color: '#666666' }}>Seleccionar materia</option>
                  {materias.map(m => {
                    console.log('🔍 Materia individual:', m);
                    return (
                      <option key={m.id_materia} value={m.id_materia} style={{ background: '#ffffff', color: '#000000' }}>
                        {m.nombre_materia || m.nombre} ({m.codigo_materia || m.codigo})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Carrera *
                </label>
                <select
                  required
                  value={horarioForm.carrera}
                  onChange={(e) => setHorarioForm({...horarioForm, carrera: e.target.value, id_grupo: ''})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#ffffff', color: '#666666' }}>Seleccionar carrera</option>
                  {carreras.map(carrera => (
                    <option key={carrera} value={carrera} style={{ background: '#ffffff', color: '#000000' }}>
                      {carrera}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Grupo *
                </label>
                <select
                  required
                  value={horarioForm.id_grupo}
                  onChange={(e) => setHorarioForm({...horarioForm, id_grupo: e.target.value})}
                  disabled={!horarioForm.carrera}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: horarioForm.carrera ? '#ffffff' : '#f0f0f0',
                    color: horarioForm.carrera ? '#000000' : '#999999',
                    fontSize: '14px',
                    cursor: horarioForm.carrera ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option value="" style={{ background: '#ffffff', color: '#666666' }}>
                    {horarioForm.carrera ? 'Seleccionar grupo' : 'Primero selecciona una carrera'}
                  </option>
                  {gruposFiltrados.map(grupo => (
                    <option key={grupo.id_grupo} value={grupo.id_grupo} style={{ background: '#ffffff', color: '#000000' }}>
                      {grupo.nombre_grupo}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Día de la Semana *
                </label>
                <select
                  required
                  value={horarioForm.dia_semana}
                  onChange={(e) => setHorarioForm({...horarioForm, dia_semana: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Lunes" style={{ background: '#ffffff', color: '#000000' }}>Lunes</option>
                  <option value="Martes" style={{ background: '#ffffff', color: '#000000' }}>Martes</option>
                  <option value="Miércoles" style={{ background: '#ffffff', color: '#000000' }}>Miércoles</option>
                  <option value="Jueves" style={{ background: '#ffffff', color: '#000000' }}>Jueves</option>
                  <option value="Viernes" style={{ background: '#ffffff', color: '#000000' }}>Viernes</option>
                  <option value="Sábado" style={{ background: '#ffffff', color: '#000000' }}>Sábado</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    required
                    value={horarioForm.hora_inicio}
                    onChange={(e) => setHorarioForm({...horarioForm, hora_inicio: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.primaryLight}50`,
                      background: 'rgba(255,255,255,0.08)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    required
                    value={horarioForm.hora_fin}
                    onChange={(e) => setHorarioForm({...horarioForm, hora_fin: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.primaryLight}50`,
                      background: 'rgba(255,255,255,0.08)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Aula *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: A101, LAB C, Aula 302"
                  value={horarioForm.aula}
                  onChange={(e) => setHorarioForm({...horarioForm, aula: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => setShowHorarioModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? `${theme.colors.primary}60` : theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: `0 4px 12px ${theme.colors.primary}40`
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primaryDark || theme.colors.primary;
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primary;
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? 'Creando...' : 'Crear Horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Grupo a Estudiante */}
      {showAsignarGrupoModal && estudianteSinGrupo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
            padding: '35px',
            borderRadius: '20px',
            maxWidth: '550px',
            width: '90%',
            boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
            border: '2px solid rgba(255,100,100,0.3)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '25px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>
                Estudiante sin Grupo
              </h2>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '25px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#ffffff', fontSize: '16px' }}>
                <strong>{estudianteSinGrupo.id_user?.nombre || estudianteSinGrupo.usuario?.nombre} {estudianteSinGrupo.id_user?.apellido || estudianteSinGrupo.usuario?.apellido}</strong>
              </p>
              <p style={{ margin: '0 0 10px 0', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                CI: {estudianteSinGrupo.ci_est}
              </p>
              <p style={{ margin: '0 0 10px 0', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                Carrera: {estudianteSinGrupo.carrera || 'No especificada'}
              </p>
              <div style={{
                marginTop: '15px',
                padding: '15px',
                background: 'rgba(255,107,107,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255,107,107,0.3)'
              }}>
                <p style={{ margin: 0, color: '#ffb3b3', fontSize: '14px', lineHeight: '1.5' }}>
                  Este estudiante no tiene un grupo asignado. Primero asígnale un grupo para poder asignarle materias.
                </p>
              </div>
            </div>

            {/* Tabs para seleccionar o crear grupo */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              padding: '5px'
            }}>
              <button
                type="button"
                onClick={() => setModoCrearGrupo(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !modoCrearGrupo ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                📋 Seleccionar Existente
              </button>
              <button
                type="button"
                onClick={() => setModoCrearGrupo(true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: modoCrearGrupo ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                ➕ Crear Nuevo
              </button>
            </div>

            {/* Formulario seleccionar grupo existente */}
            {!modoCrearGrupo ? (
              <form onSubmit={handleAsignarGrupoEstudiante}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#ffffff', fontSize: '15px' }}>
                    Seleccionar Grupo *
                  </label>
                  <select
                    required
                    value={grupoEstudianteForm.id_grupo}
                    onChange={(e) => setGrupoEstudianteForm({...grupoEstudianteForm, id_grupo: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      background: '#ffffff',
                      color: '#000000',
                      fontSize: '15px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  >
                    <option value="" style={{ background: '#ffffff', color: '#666666' }}>-- Seleccionar grupo --</option>
                    {grupos.map(g => (
                      <option key={g.id_grupo} value={g.id_grupo} style={{ background: '#ffffff', color: '#000000' }}>
                        Grupo {g.id_grupo} ({g.carrera || 'Sin carrera'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAsignarGrupoModal(false);
                      setShowAsignacionModal(false);
                      setAsignacionForm({ ci_estudiante: '', id_materia: '', id_grupo: '' });
                      setModoCrearGrupo(false);
                    }}
                    style={{
                      padding: '14px 28px',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      border: '2px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '14px 28px',
                      background: loading ? 'rgba(76, 175, 80, 0.5)' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      boxShadow: loading ? 'none' : '0 6px 20px rgba(76, 175, 80, 0.4)'
                    }}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.5)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                      }
                    }}
                  >
                    {loading ? '⏳ Asignando...' : '✅ Asignar Grupo y Continuar'}
                  </button>
                </div>
              </form>
            ) : (
              /* Formulario crear nuevo grupo */
              <form onSubmit={handleCrearNuevoGrupo}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#ffffff', fontSize: '15px' }}>
                    ID del Grupo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: A, B, C, 1A, 2B..."
                    value={nuevoGrupoForm.id_grupo}
                    onChange={(e) => setNuevoGrupoForm({...nuevoGrupoForm, id_grupo: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      background: '#ffffff',
                      color: '#000000',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#ffffff', fontSize: '15px' }}>
                    Carrera *
                  </label>
                  <input
                    type="text"
                    required
                    list="carreras-list"
                    placeholder="Selecciona o escribe una carrera..."
                    value={nuevoGrupoForm.carrera}
                    onChange={(e) => setNuevoGrupoForm({...nuevoGrupoForm, carrera: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      background: '#ffffff',
                      color: '#000000',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  />
                  <datalist id="carreras-list">
                    {carreras.map((carrera, index) => (
                      <option key={index} value={carrera} />
                    ))}
                  </datalist>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAsignarGrupoModal(false);
                      setShowAsignacionModal(false);
                      setAsignacionForm({ ci_estudiante: '', id_materia: '', id_grupo: '' });
                      setModoCrearGrupo(false);
                      setNuevoGrupoForm({ id_grupo: '', carrera: '' });
                    }}
                    style={{
                      padding: '14px 28px',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      border: '2px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '14px 28px',
                      background: loading ? 'rgba(33, 150, 243, 0.5)' : 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      boxShadow: loading ? 'none' : '0 6px 20px rgba(33, 150, 243, 0.4)'
                    }}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.5)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                      }
                    }}
                  >
                    {loading ? '⏳ Creando Grupo...' : '✨ Crear Grupo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Asignar Materia */}
      {showAsignacionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#2c2c3e',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#ffffff', marginBottom: '25px', fontSize: '24px' }}>👥 Asignar Materia a Estudiante</h2>
            <form onSubmit={handleAsignarMateria}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Estudiante *
                </label>
                <select
                  required
                  value={asignacionForm.ci_estudiante}
                  onChange={(e) => setAsignacionForm({...asignacionForm, ci_estudiante: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#ffffff', color: '#666666' }}>Seleccionar estudiante</option>
                  {estudiantes.map(est => (
                    <option key={est.ci_est} value={est.ci_est} style={{ background: '#ffffff', color: '#000000' }}>
                      {est.id_user?.nombre || est.usuario?.nombre} {est.id_user?.apellido || est.usuario?.apellido} - CI: {est.ci_est}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Materia *
                </label>
                <select
                  required
                  value={asignacionForm.id_materia}
                  onChange={(e) => setAsignacionForm({...asignacionForm, id_materia: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#ffffff', color: '#666666' }}>Seleccionar materia</option>
                  {materias.map(m => (
                    <option key={m.id_materia} value={m.id_materia} style={{ background: '#ffffff', color: '#000000' }}>
                      {m.nombre_materia || m.nombre} ({m.codigo_materia || m.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Grupo (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: A, B, C"
                  value={asignacionForm.id_grupo}
                  onChange={(e) => setAsignacionForm({...asignacionForm, id_grupo: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => setShowAsignacionModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? `${theme.colors.primary}60` : theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: `0 4px 12px ${theme.colors.primary}40`
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primaryDark || theme.colors.primary;
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primary;
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? 'Asignando...' : 'Asignar Materia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva/Editar Nota */}
      {showNotaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#2c2c3e',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#ffffff', marginBottom: '25px', fontSize: '24px' }}>
              {editingNota ? '✏️ Editar Nota' : '📊 Nueva Nota'}
            </h2>
            <form onSubmit={handleCreateNota}>
              {!editingNota && (
                <>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Estudiante *
                    </label>
                    <select
                      required
                      value={notaForm.id_user}
                      onChange={(e) => setNotaForm({...notaForm, id_user: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        background: '#ffffff',
                        color: '#000000',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" style={{ background: '#ffffff', color: '#666666' }}>Seleccionar estudiante</option>
                      {estudiantes
                        .filter(est => est.usuario || est.id_user) // Solo estudiantes con usuario
                        .map(est => {
                          const userCi = est.usuario?.ci || est.id_user?.ci || est.ci_est;
                          return (
                            <option key={est.ci_est} value={userCi} style={{ background: '#ffffff', color: '#000000' }}>
                              {est.usuario?.nombre || est.id_user?.nombre} {est.usuario?.apellido || est.id_user?.apellido} - CI: {userCi}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Materia *
                    </label>
                    <select
                      required
                      value={notaForm.id_materia}
                      onChange={(e) => setNotaForm({...notaForm, id_materia: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        background: '#ffffff',
                        color: '#000000',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" style={{ background: '#ffffff', color: '#666666' }}>Seleccionar materia</option>
                      {materias.map(m => (
                        <option key={m.id_materia} value={m.id_materia} style={{ background: '#ffffff', color: '#000000' }}>
                          {m.nombre_materia || m.nombre} ({m.codigo_materia || m.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Tipo de Nota *
                </label>
                <select
                  required
                  value={notaForm.tipo_nota}
                  onChange={(e) => setNotaForm({...notaForm, tipo_nota: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Parcial" style={{ background: '#ffffff', color: '#000000' }}>Parcial</option>
                  <option value="Final" style={{ background: '#ffffff', color: '#000000' }}>Final</option>
                  <option value="Recuperatorio" style={{ background: '#ffffff', color: '#000000' }}>Recuperatorio</option>
                  <option value="Trabajo" style={{ background: '#ffffff', color: '#000000' }}>Trabajo</option>
                  <option value="Proyecto" style={{ background: '#ffffff', color: '#000000' }}>Proyecto</option>
                  <option value="Otros" style={{ background: '#ffffff', color: '#000000' }}>Otros</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Nota (0-100) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  value={notaForm.nota}
                  onChange={(e) => setNotaForm({...notaForm, nota: e.target.value})}
                  placeholder="Ej: 75.5"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotaModal(false);
                    setEditingNota(null);
                    setNotaForm({ id_user: '', id_materia: '', nota: '', tipo_nota: 'Parcial' });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? `${theme.colors.primary}60` : theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: `0 4px 12px ${theme.colors.primary}40`
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primaryDark || theme.colors.primary;
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primary;
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? (editingNota ? 'Actualizando...' : 'Creando...') : (editingNota ? 'Actualizar Nota' : 'Crear Nota')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Usuarios */}
      {activeTab === 'usuarios' && (
        <AdminUsersPanel />
      )}
    </div>
  );
}
