import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import academicService from '../services/academicService';
import AdminAcademicPanel from './AdminAcademicPanel';

// Componente principal del módulo académico
export const AcademicModule = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('materias');
  const [materias, setMaterias] = useState([]);
  const [notas, setNotas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Log para debugging - ver qué usuario está logueado
  useEffect(() => {
    console.log('👤 Usuario logueado:', user?.nombre, user?.apellido, '- Rol:', user?.rol);
  }, [user]);

  const loadMateriasUsuario = useCallback(async () => {
    console.log('📚 Iniciando carga de materias del usuario autenticado');
    setLoading(true);
    setError(null);
    
    // El backend usa el token JWT para identificar al usuario
    // No necesitamos pasar CI o correo
    const { data, error: apiError } = await academicService.getMateriasEstudiante();
    
    console.log('📦 Respuesta de materias:', { data, error: apiError });
    
    if (apiError) {
      console.error('❌ Error al cargar materias:', apiError);
      setError(apiError);
    } else {
      console.log('✅ Materias cargadas:', data);
      setMaterias(data || []);
    }
    setLoading(false);
  }, []);

  const loadNotas = useCallback(async () => {
    console.log('📊 Iniciando carga de notas del usuario autenticado');
    setLoading(true);
    setError(null);
    
    // El backend usa el token JWT para identificar al usuario
    const { data, error: apiError } = await academicService.getNotasEstudiante();
    
    if (apiError) {
      setError(apiError);
    } else {
      setNotas(data || []);
    }
    setLoading(false);
  }, []);

  const loadHorarios = useCallback(async () => {
    console.log('📅 Iniciando carga de horarios del usuario autenticado');
    setLoading(true);
    setError(null);
    
    // El backend usa el token JWT para identificar al usuario
    const { data, error: apiError } = await academicService.getHorariosEstudiante();
    
    if (apiError) {
      setError(apiError);
    } else {
      setHorarios(data || []);
    }
    setLoading(false);
  }, []);
  
  // Cargar datos según la pestaña activa y rol del usuario
  useEffect(() => {
    // Solo cargar datos si el usuario es estudiante o docente (NO admin)
    if (!user || user?.rol === 'administrador') {
      return; // Salir temprano si no hay usuario o es admin
    }
    
    // Cargar según pestaña activa
    if (activeTab === 'materias') {
      loadMateriasUsuario();
    } else if (activeTab === 'notas') {
      // Solo cargar notas si es estudiante
      if (user?.rol === 'estudiante') {
        loadNotas();
      }
    } else if (activeTab === 'horario') {
      loadHorarios();
    }
  }, [activeTab, user, loadMateriasUsuario, loadNotas, loadHorarios]);
  
  // Si es administrador, mostrar panel de administración (después de todos los hooks)
  if (user?.rol === 'administrador') {
    return <AdminAcademicPanel />;
  }
  
  // Estado para el curso seleccionado
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Función para renderizar las pestañas
  const renderTabs = () => {
    return (
      <div className="academic-tabs">
        <div 
          className={`academic-tab ${activeTab === 'materias' ? 'active' : ''}`} 
          onClick={() => setActiveTab('materias')}
        >
          📚 Materias
        </div>
        <div 
          className={`academic-tab ${activeTab === 'notas' ? 'active' : ''}`} 
          onClick={() => setActiveTab('notas')}
        >
          📊 Notas
        </div>
        <div 
          className={`academic-tab ${activeTab === 'horario' ? 'active' : ''}`} 
          onClick={() => setActiveTab('horario')}
        >
          📅 Horario
        </div>
      </div>
    );
  };
  
  // Función para renderizar el contenido según la pestaña activa
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          fontSize: '18px',
          color: theme.colors.textSecondary
        }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            fontSize: '40px'
          }}>
            ⏳
          </div>
          <span style={{ marginLeft: '16px' }}>Cargando...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          padding: '40px'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
          <div style={{ 
            fontSize: '18px', 
            color: theme.colors.notification,
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            {error}
          </div>
          <button
            onClick={() => {
              if (activeTab === 'materias') loadMateriasUsuario();
              else if (activeTab === 'notas') loadNotas();
              else if (activeTab === 'horario') loadHorarios();
            }}
            style={{
              padding: '12px 24px',
              background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'materias':
        return (
          <div className="academic-courses-grid">
            {materias.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px',
                fontSize: '16px',
                color: theme.colors.textSecondary
              }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>📚</div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  No hay materias registradas
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  marginTop: '16px',
                  color: theme.colors.textSecondary 
                }}>
                  Contacta a un administrador para que te asigne materias
                </div>
              </div>
            ) : (
              materias.map(materia => (
                <MateriaCard 
                  key={materia.id_materia} 
                  materia={materia}
                  theme={theme}
                />
              ))
            )}
          </div>
        );
      
      case 'notas':
        return notas.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            fontSize: '16px',
            color: theme.colors.textSecondary
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>📊</div>
            <div>No hay notas registradas</div>
          </div>
        ) : (
          <NotasView notas={notas} theme={theme} />
        );
      
      case 'horario':
        return horarios.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            fontSize: '16px',
            color: theme.colors.textSecondary
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>📅</div>
            <div>No hay horarios registrados</div>
          </div>
        ) : (
          <HorarioView horarios={horarios} theme={theme} />
        );
      
      default:
        return <div>Contenido no disponible</div>;
    }
  };

  return (
    <div className="academic-container">
      <div className="academic-header" style={{
        background: `linear-gradient(145deg, ${theme.colors.cardBackground}dd, ${theme.colors.cardBackground}ee)`,
        backdropFilter: 'blur(10px)',
        border: `2px solid ${theme.colors.primaryLight}40`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: theme.colors.text,
            margin: 0
          }}>
            📚 Mi Módulo Académico
          </h1>
          <div style={{
            padding: '8px 16px',
            background: theme.colors.primary + '20',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: theme.colors.primary,
            textTransform: 'capitalize'
          }}>
            {user?.rol || 'Estudiante'}
          </div>
        </div>
        <p style={{
          fontSize: '15px',
          color: theme.colors.textSecondary,
          margin: 0
        }}>
          {user?.nombre} {user?.apellido} - Visualiza tus materias, notas y horarios asignados
        </p>
        
        {/* Panel de información del estudiante */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: theme.colors.primary + '10',
          borderRadius: '8px',
          fontSize: '13px',
          color: theme.colors.text,
          border: `1px solid ${theme.colors.primary}40`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>👤 {user?.nombre} {user?.apellido}</strong> • {user?.correo}
            </div>
            <div style={{ 
              padding: '4px 12px',
              background: materias.length > 0 ? '#00cc0020' : theme.colors.cardBackground,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: materias.length > 0 ? '#00cc00' : theme.colors.textSecondary
            }}>
              📚 {materias.length} {materias.length === 1 ? 'materia' : 'materias'}
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: '16px'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <input 
              type="text" 
              placeholder="Buscar materias..." 
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingLeft: '40px',
                borderRadius: '12px',
                border: `1px solid ${theme.colors.primaryLight}40`,
                background: theme.colors.cardBackground,
                color: theme.colors.text,
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px'
            }}>🔍</span>
          </div>
        </div>
      </div>
      
      {renderTabs()}
      
      <div className="academic-content">
        <div className="academic-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Componente para tarjeta de materia
const MateriaCard = ({ materia, theme }) => {
  return (
    <div style={{
      background: `linear-gradient(145deg, ${theme.colors.cardBackground}dd, ${theme.colors.cardBackground}ee)`,
      backdropFilter: 'blur(10px)',
      border: `2px solid ${theme.colors.primaryLight}40`,
      borderRadius: '16px',
      padding: '20px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = theme.colors.primary;
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = `${theme.colors.primaryLight}40`;
    }}
    >
      <div style={{
        fontSize: '14px',
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: '8px'
      }}>
        {materia.codigo_materia || 'MAT-XXX'}
      </div>
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: '12px'
      }}>
        {materia.nombre_materia || 'Materia'}
      </div>
      <div style={{
        fontSize: '14px',
        color: theme.colors.textSecondary,
        marginBottom: '4px'
      }}>
        Docente: {materia.docente?.usuario?.nombre 
          ? `${materia.docente.usuario.nombre} ${materia.docente.usuario.apellido || ''}`
          : 'Por asignar'}
      </div>
      <div style={{
        fontSize: '14px',
        color: theme.colors.textSecondary
      }}>
        Origen: {materia.origen === 'SIU' ? 'SIU' : 'Manual'}
      </div>
    </div>
  );
};

// Componente para vista de notas
const NotasView = ({ notas, theme }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {notas.map((nota, index) => (
        <div key={index} style={{
          background: `linear-gradient(145deg, ${theme.colors.cardBackground}dd, ${theme.colors.cardBackground}ee)`,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${theme.colors.primaryLight}40`,
          borderRadius: '16px',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: '12px'
          }}>
            {nota.materia?.nombre_materia || 'Materia'}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <div style={{
              padding: '12px',
              background: `${theme.colors.primary}20`,
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                Tipo
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.text }}>
                {nota.tipo_nota || 'N/A'}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: `${theme.colors.success}20`,
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                Nota
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.success }}>
                {nota.nota || 'N/A'}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: `${theme.colors.info}20`,
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                Fecha
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>
                {nota.fecha_registro_nota 
                  ? new Date(nota.fecha_registro_nota).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Sin fecha'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para vista de horario
const HorarioView = ({ horarios, theme }) => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Función para formatear hora desde formato TIME de PostgreSQL
  const formatearHora = (horaString) => {
    if (!horaString) return 'N/A';
    // Si viene en formato HH:MM:SS, tomar solo HH:MM
    if (typeof horaString === 'string') {
      const partes = horaString.split(':');
      if (partes.length >= 2) {
        return `${partes[0]}:${partes[1]}`;
      }
    }
    return horaString;
  };
  
  return (
    <div style={{
      background: `linear-gradient(145deg, ${theme.colors.cardBackground}dd, ${theme.colors.cardBackground}ee)`,
      backdropFilter: 'blur(10px)',
      border: `2px solid ${theme.colors.primaryLight}40`,
      borderRadius: '16px',
      padding: '24px',
      overflowX: 'auto'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '16px',
        minWidth: '800px'
      }}>
        {dias.map(dia => (
          <div key={dia}>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: theme.colors.primary,
              marginBottom: '12px',
              textAlign: 'center',
              padding: '8px',
              background: `${theme.colors.primary}20`,
              borderRadius: '8px'
            }}>
              {dia}
            </div>
            {horarios
              .filter(h => h.dia_semana === dia)
              .sort((a, b) => {
                // Ordenar por hora de inicio
                if (a.hora_inicio < b.hora_inicio) return -1;
                if (a.hora_inicio > b.hora_inicio) return 1;
                return 0;
              })
              .map((horario, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: `linear-gradient(135deg, ${theme.colors.primary}25, ${theme.colors.primaryLight}15)`,
                  borderRadius: '12px',
                  marginBottom: '8px',
                  border: `2px solid ${theme.colors.primaryLight}40`,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = theme.colors.primary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = `${theme.colors.primaryLight}40`;
                }}
                >
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: theme.colors.text,
                    marginBottom: '6px',
                    lineHeight: '1.3'
                  }}>
                    {horario.materia?.nombre_materia || horario.grupomateria?.materia?.nombre_materia || 'Materia'}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.colors.primary,
                    marginBottom: '4px'
                  }}>
                    ⏰ {formatearHora(horario.hora_inicio)} - {formatearHora(horario.hora_fin)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📍 Aula: {horario.aula || 'N/A'}
                  </div>
                  {(horario.materia?.codigo_materia || horario.grupomateria?.materia?.codigo_materia) && (
                    <div style={{
                      fontSize: '11px',
                      color: theme.colors.textSecondary,
                      marginTop: '4px',
                      opacity: 0.8
                    }}>
                      {horario.materia?.codigo_materia || horario.grupomateria?.materia?.codigo_materia}
                    </div>
                  )}
                </div>
              ))}
            {horarios.filter(h => h.dia_semana === dia).length === 0 && (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                opacity: 0.5
              }}>
                Sin clases
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para mostrar tarjetas de cursos
const CourseCard = ({ course, onClick, isSelected }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`course-card ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
      style={{ 
        background: isSelected 
          ? `linear-gradient(145deg, ${theme.colors.primaryDark}80, ${theme.colors.primary}50)`
          : `linear-gradient(145deg, ${theme.colors.primaryDark}30, ${theme.colors.primary}20)` 
      }}
    >
      <div className="course-code">{course.code}</div>
      <div className="course-group">Grupo {course.group}</div>
      
      <h3 className="course-name">{course.name}</h3>
      
      <div className="course-professor">
        <div className="label">Docente:</div>
        <div className="value">{course.professor}</div>
      </div>
      
      <div className="course-schedule">
        {course.schedule[0] && (
          <>
            <div className="day">{course.schedule[0].day}</div>
            <div className="time">{course.schedule[0].time}</div>
            <div className="room">{course.schedule[0].room}</div>
          </>
        )}
        {course.schedule.length > 1 && <div className="more">+ {course.schedule.length - 1} más</div>}
      </div>
      
      <div className="course-footer">
        <div className="average">Promedio: {course.average}</div>
        <div className="semester">Semestre {course.semester}</div>
      </div>
    </div>
  );
};

// Componente para mostrar detalles de un curso
const CourseDetail = ({ course, grades }) => {
  const { theme } = useTheme();
  
  return (
    <div className="course-detail">
      <div className="course-detail-header">
        <h2 className="course-detail-name">{course.name}</h2>
        <div className="course-detail-meta">@{course.professor.toLowerCase().split(' ').join('.')}</div>
      </div>
      
      <div className="course-detail-content">
        <div className="course-detail-section">
          <h3 className="section-title">Docente: {course.professor}</h3>
        </div>
        
        <div className="course-detail-section">
          <h3 className="section-title">Horarios</h3>
          <div className="schedule-list">
            {course.schedule.map((slot, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-day">{slot.day}:</div>
                <div className="schedule-time">{slot.time}</div>
                <div className="schedule-room">{slot.room}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="course-detail-section">
          <h3 className="section-title">Calificaciones</h3>
          <div className="grades-list">
            <div className="grades-header">
              <div className="col">Evaluación</div>
              <div className="col">Nota</div>
              <div className="col">Fecha</div>
            </div>
            {grades.map((grade, index) => (
              <div key={index} className="grade-item">
                <div className="grade-name">{grade.name}</div>
                <div className="grade-score">{grade.score}</div>
                <div className="grade-date">{grade.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar vista de calificaciones
const GradesView = ({ grades, courses }) => {
  return (
    <div className="grades-view">
      <h2 className="section-title">Calificaciones por Materia</h2>
      
      <div className="grades-container">
        {courses.map(course => {
          const courseGrades = grades.find(g => g.courseId === course.id)?.evaluations || [];
          
          return (
            <div key={course.id} className="course-grades-card">
              <div className="course-grades-header">
                <h3>{course.name}</h3>
                <div className="course-code">{course.code}</div>
              </div>
              
              <div className="grades-list">
                {courseGrades.map((grade, index) => (
                  <div key={index} className="grade-row">
                    <div className="grade-name">{grade.name}</div>
                    <div className="grade-score">{grade.score}</div>
                  </div>
                ))}
              </div>
              
              <div className="course-average">
                Promedio: {course.average}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente para mostrar vista de horario
const ScheduleView = ({ schedule }) => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  
  // Organizar el horario por día
  const scheduleByDay = {};
  days.forEach(day => {
    scheduleByDay[day] = schedule.filter(slot => slot.day === day);
  });
  
  return (
    <div className="schedule-view">
      <h2 className="section-title">Horario Semanal</h2>
      
      <div className="weekly-schedule">
        {days.map(day => (
          <div key={day} className="day-column">
            <div className="day-header">{day}</div>
            <div className="day-slots">
              {scheduleByDay[day].length > 0 ? (
                scheduleByDay[day].map((slot, index) => (
                  <div key={index} className="schedule-slot">
                    <div className="slot-time">{slot.time}</div>
                    <div className="slot-course">{slot.course}</div>
                    <div className="slot-room">{slot.room}</div>
                    <div className="slot-professor">{slot.professor}</div>
                  </div>
                ))
              ) : (
                <div className="empty-day">No hay clases</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};