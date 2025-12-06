import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const UserProfileButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // Función para navegar al perfil de usuario
  const goToUserProfile = () => {
    navigate('/profile');
  };
  
  // Obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!user) return 'US';
    
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    
    const iniciales = (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    return iniciales || 'US';
  };
  
  return (
    <div 
      className="user-profile-button"
      onClick={goToUserProfile}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: theme.colors.primary || '#E75A7C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        fontWeight: 'bold',
        color: 'white',
        cursor: 'pointer',
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
      }}
    >
      {getUserInitials()}
    </div>
  );
};

export default UserProfileButton;