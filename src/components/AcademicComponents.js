import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Componente para mostrar un gráfico de rendimiento académico
export const PerformanceChart = ({ data }) => {
  const { theme } = useTheme();
  
  // Este componente simula un gráfico, en la implementación real se usaría una librería como Chart.js o react-native-chart-kit
  return (
    <div style={{
      backgroundColor: theme.colors.card,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: theme.colors.primary, marginBottom: '15px' }}>Rendimiento Académico</h3>
      
      <div style={{
        height: '200px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        marginTop: '20px',
        marginBottom: '20px',
        position: 'relative'
      }}>
        {/* Línea de base (eje X) */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '1px',
          backgroundColor: theme.colors.border
        }}></div>
        
        {/* Barras del gráfico */}
        {data.map((item, index) => (
          <div key={index} style={{ textAlign: 'center', width: '40px' }}>
            <div style={{
              height: `${(item.value / 100) * 150}px`,
              width: '30px',
              backgroundColor: theme.colors.primary,
              borderTopLeftRadius: '3px',
              borderTopRightRadius: '3px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center'
            }}>
              <span style={{
                color: 'white',
                fontSize: '12px',
                padding: '2px',
                fontWeight: 'bold'
              }}>{item.value}</span>
            </div>
            <div style={{ marginTop: '5px', color: theme.colors.text, fontSize: '12px' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <div style={{ color: theme.colors.textLight, fontSize: '14px' }}>Promedio General: 85.7</div>
      </div>
    </div>
  );
};

// Componente para mostrar un calendario académico semanal
export const WeeklyCalendar = ({ schedule, weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }) => {
  const { theme } = useTheme();
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  
  return (
    <div style={{
      backgroundColor: theme.colors.card,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: theme.colors.primary, marginBottom: '15px' }}>Horario Semanal</h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '10px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                textAlign: 'center'
              }}>Hora</th>
              {weekDays.map(day => (
                <th key={day} style={{
                  padding: '10px',
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  textAlign: 'center'
                }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, i) => (
              <tr key={time}>
                <td style={{
                  padding: '10px',
                  backgroundColor: theme.colors.accent,
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  borderBottom: i === timeSlots.length - 1 ? 'none' : `1px solid ${theme.colors.border}`
                }}>
                  {time} - {i < timeSlots.length - 1 ? timeSlots[i+1] : '20:00'}
                </td>
                {weekDays.map(day => {
                  const classItem = schedule.find(item => 
                    item.day === day && item.time === time
                  );
                  
                  return (
                    <td key={`${day}-${time}`} style={{
                      padding: '10px',
                      backgroundColor: classItem ? `${theme.colors.primary}15` : theme.colors.card,
                      borderBottom: i === timeSlots.length - 1 ? 'none' : `1px solid ${theme.colors.border}`,
                      borderRight: `1px solid ${theme.colors.border}`
                    }}>
                      {classItem && (
                        <div>
                          <div style={{ fontWeight: 'bold', color: theme.colors.primary }}>{classItem.course}</div>
                          <div style={{ fontSize: '0.9em' }}>{classItem.room}</div>
                          <div style={{ fontSize: '0.8em', color: theme.colors.textLight }}>{classItem.professor}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px'
      }}>
        <button style={{
          backgroundColor: theme.colors.primary,
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Exportar PDF
        </button>
        <button style={{
          backgroundColor: theme.colors.info,
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Exportar Excel
        </button>
      </div>
    </div>
  );
};

// Componente para mostrar tarjetas de materias
export const CourseCard = ({ course }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.card,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: `1px solid ${theme.colors.border}`
    }}>
      <div style={{
        backgroundColor: theme.colors.primary,
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'white' }}>{course.code}</h3>
          <span style={{ color: 'white' }}>Grupo {course.group}</span>
        </div>
      </div>
      
      <h3 style={{ color: theme.colors.text, marginBottom: '10px' }}>{course.name}</h3>
      <p style={{ color: theme.colors.textLight, marginBottom: '15px' }}>Docente: {course.professor}</p>
      
      <h4 style={{ color: theme.colors.primary, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '5px' }}>
        Horarios
      </h4>
      
      <div style={{ marginTop: '10px' }}>
        {course.schedule.map((slot, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px',
            backgroundColor: index % 2 === 0 ? `${theme.colors.primary}10` : 'transparent',
            borderRadius: '4px',
            marginBottom: '5px'
          }}>
            <span>{slot.day}</span>
            <span>{slot.time}</span>
            <span>Aula: {slot.room}</span>
          </div>
        ))}
      </div>
      
      <button style={{
        backgroundColor: theme.colors.info,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px',
        width: '100%',
        marginTop: '15px',
        cursor: 'pointer'
      }}>
        Ver detalles
      </button>
    </div>
  );
};

// Componente para mostrar tabla de calificaciones
export const GradesTable = ({ grades }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.card,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: theme.colors.primary, marginBottom: '15px' }}>Calificaciones</h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${theme.colors.border}`
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '10px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                textAlign: 'left'
              }}>Código</th>
              <th style={{
                padding: '10px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                textAlign: 'left'
              }}>Materia</th>
              <th style={{
                padding: '10px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                textAlign: 'center'
              }}>Parcial 1</th>
              <th style={{
                padding: '10px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                textAlign: 'center'
              }}>Parcial 2</th>
              <th style={{
                padding: '10px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                textAlign: 'center'
              }}>Final</th>
              <th style={{
                padding: '10px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                textAlign: 'center'
              }}>Promedio</th>
              <th style={{
                padding: '10px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                textAlign: 'center'
              }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, index) => (
              <tr key={index}>
                <td style={{
                  padding: '10px',
                  borderBottom: `1px solid ${theme.colors.border}`
                }}>{grade.code}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: `1px solid ${theme.colors.border}`
                }}>{grade.name}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: `1px solid ${theme.colors.border}`,
                  textAlign: 'center',
                  color: grade.exam1 >= 60 ? theme.colors.success : theme.colors.notification
                }}>{grade.exam1}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: `1px solid ${theme.colors.border}`,
                  textAlign: 'center',
                  color: grade.exam2 >= 60 ? theme.colors.success : theme.colors.notification
                }}>{grade.exam2}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: `1px solid ${theme.colors.border}`,
                  textAlign: 'center',
                  color: grade.final >= 60 ? theme.colors.success : theme.colors.notification
                }}>{grade.final}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: `1px solid ${theme.colors.border}`,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: grade.average >= 60 ? theme.colors.success : theme.colors.notification
                }}>{grade.average}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: `1px solid ${theme.colors.border}`,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: grade.average >= 60 ? theme.colors.success : theme.colors.notification
                }}>{grade.average >= 60 ? 'APROBADO' : 'REPROBADO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px'
      }}>
        <button style={{
          backgroundColor: theme.colors.primary,
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Exportar Reporte
        </button>
        <button style={{
          backgroundColor: theme.colors.info,
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Ver Gráfico
        </button>
      </div>
    </div>
  );
};
