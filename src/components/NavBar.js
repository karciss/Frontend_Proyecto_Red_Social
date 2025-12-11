import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button, Avatar } from './UIComponents';
import UserProfileButton from './UserProfileButton';

const NavBar = ({ activeTab, setActiveTab }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Determinamos el nombre e inicial del usuario para avatar
  const userInitial = user && user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U';
  const userName = user ? user.nombre : 'Usuario de Prueba';
  
  const NavTab = ({ id, label, icon }) => (
    <div 
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        cursor: 'pointer',
        borderBottom: activeTab === id 
          ? `3px solid ${theme.colors.primary}`
          : '3px solid transparent',
        color: activeTab === id 
          ? theme.colors.primary 
          : isDarkMode ? 'rgba(255,255,255,0.7)' : '#666',
        transition: 'all 0.2s ease',
        fontWeight: activeTab === id ? '600' : '500',
        fontSize: '15px',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (activeTab !== id) {
          e.currentTarget.style.color = theme.colors.primary;
          e.currentTarget.style.backgroundColor = 'rgba(139, 30, 65, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (activeTab !== id) {
          e.currentTarget.style.color = '#666';
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>{icon}</span>
      <span>{label}</span>
    </div>
  );

  const UserMenu = () => (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.medium,
      boxShadow: theme.shadows.large,
      minWidth: '220px',
      zIndex: 1000,
      overflow: 'hidden',
      border: `1px solid ${theme.colors.border}`
    }}>
      <div style={{ 
        padding: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: `${theme.colors.primary}15`
      }}>
        <div style={{ fontWeight: 'bold' }}>{userName}</div>
        <div style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>{user?.rol || 'estudiante'}</div>
        <div style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>{user?.email || 'usuario@univalle.edu'}</div>
      </div>
      
      <div style={{ padding: `${theme.spacing.xs} 0` }}>
        <MenuItem icon="👤" label="Mi Perfil" />
        <MenuItem icon="⚙️" label="Configuración" />
        {user?.rol === 'administrador' && (
          <MenuItem icon="🔐" label="Panel Admin" onClick={() => setActiveTab('admin')} />
        )}
        <div style={{ 
          margin: `${theme.spacing.xs} ${theme.spacing.md}`,
          height: '1px', 
          backgroundColor: theme.colors.border 
        }} />
        <MenuItem icon="🔄" label={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'} onClick={toggleTheme} />
        <MenuItem icon="📴" label="Cerrar Sesión" onClick={() => logout()} />
      </div>
    </div>
  );

  const MenuItem = ({ icon, label, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        ':hover': {
          backgroundColor: `${theme.colors.primary}10`,
        }
      }}
    >
      <span style={{ marginRight: theme.spacing.sm, width: '20px' }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
  
  return (
    <nav className="navbar">
      <div className="nav-icons">
        <NavTab id="academic" label="Académico" icon="📚" />
        <NavTab id="social" label="Social" icon="👥" />
        <NavTab id="carpooling" label="Carpooling" icon="🚗" />
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px'
      }}>
        {/* Nuevo botón de perfil */}
        <UserProfileButton />
        
        {/* Mantener el perfil actual para compatibilidad */}
        <div 
          className="profile-card" 
          onClick={() => window.location.href = '/settings'}
          style={{ cursor: 'pointer' }}
        >
          <img src={user?.foto_perfil || user?.avatar || "https://ui-avatars.com/api/?name="+userName} alt="avatar" />
          <div className="profile-name">{userName}</div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;