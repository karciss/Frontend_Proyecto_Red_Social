import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Heading } from './UIComponents';
import '../styles/LoginFormNew.css';
import '../styles/themes.css';

const LoginForm = () => {
  const { theme, isDarkMode } = useTheme();
  const { login, signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const result = await login(formData.email, formData.password);
      
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : result.error.message || 'Error al iniciar sesión');
        return;
      }
      
      // El login fue exitoso - AuthContext se encargará de la redirección
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo-container">
          <h1 className="login-title">Red Univalle</h1>
          <p className="login-subtitle">
            Plataforma para estudiantes, docentes y personal de la universidad
          </p>
        </div>
        
        <form onSubmit={handleLoginSubmit}>
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@univalle.edu"
              className="login-input"
              required
            />
          </div>
          
          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="login-input"
              required
            />
          </div>
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
          
          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="login-footer">
          Red Social Univalle - Universidad del Valle Bolivia<br />
          © 2025 Todos los derechos reservados
        </div>
      </div>
    </div>
  );
};

export default LoginForm;