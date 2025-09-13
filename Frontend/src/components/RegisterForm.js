import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Валидация паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await axios.post('/signup', registerData);
      console.log('Успешная регистрация:', response.data);
      
      const token = response.data.access_token || response.data.token || response.data.accessToken;
      if (token) {
        localStorage.setItem('access_token', token);
        // Попробуем получить userinfo
        try {
          const userResp = await axios.get('/userinfo', { headers: { Authorization: `Bearer ${token}` } });
          if (userResp.data && userResp.data.name) {
            localStorage.setItem('userName', userResp.data.name);
          } else {
            localStorage.setItem('userName', formData.name);
          }
        } catch (err) {
          localStorage.setItem('userName', formData.name);
        }
      } else {
        localStorage.setItem('userName', formData.name);
      }
      
      onRegisterSuccess();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Имя
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Введите ваше имя"
          />
        </div>

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
            placeholder="Введите пароль (минимум 6 символов)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Подтвердите пароль
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Подтвердите пароль"
          />
        </div>

        {error && <span className="error-message">{error}</span>}

        <button 
          type="submit" 
          className="form-button"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="auth-switch">
        <button type="button" onClick={onSwitchToLogin}>
          Уже есть аккаунт? Войти
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;