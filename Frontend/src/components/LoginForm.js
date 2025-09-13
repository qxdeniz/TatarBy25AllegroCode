import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await axios.post('/api/auth/login', formData);
      console.log('Успешный вход:', response.data);
      // Здесь можно добавить логику сохранения токена и перенаправления
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Вход в систему</h2>
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
            placeholder="Введите ваш email"
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
            placeholder="Введите ваш пароль"
          />
        </div>

        {error && <span className="error-message">{error}</span>}

        <button 
          type="submit" 
          className="form-button"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="auth-switch">
        <button type="button" onClick={onSwitchToRegister}>
          Нет аккаунта? Зарегистрироваться
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
