import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

const AcademicScheduleScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // En producción, esto sería una llamada real a la API
        // const response = await apiService.academic.getSchedule();
        // setSchedule(response.data);
        
        // Datos simulados para desarrollo
        const mockSchedule = generateMockSchedule();
        setSchedule(mockSchedule);
      } catch (err) {
        console.error('Error al cargar el horario:', err);
        setError('No se pudo cargar el horario académico');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Función para generar datos de ejemplo
  const generateMockSchedule = () => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const timeSlots = ['08:00 - 09:30', '10:00 - 11:30', '12:00 - 13:30', '14:30 - 16:00', '16:30 - 18:00'];
    
    const subjects = [
      { id: 1, name: 'Bases de Datos II', code: 'BD202', instructor: 'Dr. González', classroom: 'Lab 1' },
      { id: 2, name: 'Programación Avanzada', code: 'PA301', instructor: 'Ing. Rodríguez', classroom: 'Aula 305' },
      { id: 3, name: 'Sistemas Operativos', code: 'SO401', instructor: 'Dra. Martínez', classroom: 'Lab 3' },
      { id: 4, name: 'Inteligencia Artificial', code: 'IA501', instructor: 'Dr. Pérez', classroom: 'Aula 201' },
      { id: 5, name: 'Redes de Computadoras', code: 'RC302', instructor: 'Ing. López', classroom: 'Lab 2' }
    ];
    
    // Crear horario para cada día
    return days.map(day => {
      // Seleccionar de 3 a 5 materias aleatorias para este día
      const numberOfSubjects = Math.floor(Math.random() * 3) + 3;
      const shuffledSubjects = [...subjects].sort(() => 0.5 - Math.random());
      const daySubjects = shuffledSubjects.slice(0, numberOfSubjects);
      
      // Asignar horarios aleatorios
      const classSchedule = daySubjects.map((subject, index) => ({
        ...subject,
        timeSlot: timeSlots[index]
      }));
      
      return {
        day,
        classes: classSchedule.sort((a, b) => timeSlots.indexOf(a.timeSlot) - timeSlots.indexOf(b.timeSlot))
      };
    });
  };

  return (
    <div style={{ padding: '15px' }}>
      <h2 style={{ color: theme.colors.text, marginBottom: '20px' }}>Horario Académico</h2>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
          <div>Cargando horario...</div>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', backgroundColor: theme.colors.error, color: 'white', borderRadius: '8px' }}>
          {error}
          <button 
            style={{ marginLeft: '10px', padding: '5px 10px' }} 
            onClick={() => generateMockSchedule()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div>
          {schedule && schedule.map((daySchedule, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '20px',
                backgroundColor: theme.colors.card,
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                backgroundColor: theme.colors.primary,
                padding: '10px 15px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {daySchedule.day}
              </div>
              
              {daySchedule.classes.length === 0 ? (
                <div style={{ padding: '15px', textAlign: 'center' }}>
                  No hay clases programadas
                </div>
              ) : (
                <div>
                  {daySchedule.classes.map((classInfo, classIndex) => (
                    <div 
                      key={classIndex}
                      style={{ 
                        padding: '12px 15px',
                        borderBottom: classIndex < daySchedule.classes.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', color: theme.colors.text }}>
                          {classInfo.name}
                        </div>
                        <div style={{ color: theme.colors.textLight, fontSize: '0.9rem' }}>
                          {classInfo.code} | {classInfo.instructor} | {classInfo.classroom}
                        </div>
                      </div>
                      <div style={{ 
                        backgroundColor: theme.colors.background,
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        alignSelf: 'center'
                      }}>
                        {classInfo.timeSlot}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcademicScheduleScreen;