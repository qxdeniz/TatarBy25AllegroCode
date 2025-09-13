import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/login', formData);
      console.log('Успешный вход:', response.data);
      
      const token = response.data.access_token || response.data.token || response.data.accessToken;
      if (token) {
        localStorage.setItem('access_token', token);
        // Получаем userinfo для имени
        try {
          const userResp = await axios.get('/userinfo', { headers: { Authorization: `Bearer ${token}` } });
          if (userResp.data && userResp.data.name) {
            localStorage.setItem('userName', userResp.data.name);
          }
        } catch (err) {
          // ignore userinfo errors
        }
      }
      
      onLoginSuccess();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Рәхим итегез</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Email кертегез"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Пароль кертегез"
          />
        </div>

        {error && <span className="error-message">{error}</span>}

        <button 
          type="submit" 
          className="form-button"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Керү'}
        </button>
      </form>

      <div className="auth-switch">
        <button type="button" onClick={onSwitchToRegister}>
          Аккаунт юкмы? Теркәлү
        </button>
      </div>
    </div>
  );
};

export default LoginForm;