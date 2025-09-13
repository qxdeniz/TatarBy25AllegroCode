import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';
import AgentCreateForm from './components/AgentCreateForm';
import AgentChat from './components/AgentChat';

function App() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  const switchToRegister = () => {
    setIsLogin(false);
    navigate('/register');
  };

  const switchToLogin = () => {
    setIsLogin(true);
    navigate('/login');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsLogin(true);
    localStorage.removeItem('access_token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="App">
      <div className="container">
        <Routes>
          {/* Главная страница (доступна всем) */}
          <Route path="/" element={<HomePage onLogout={handleLogout} />} />

          {/* Отдельные маршруты для логина/регистрации */}
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginForm onSwitchToRegister={switchToRegister} onLoginSuccess={handleLoginSuccess} />
            )
          } />

          <Route path="/register" element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterForm onSwitchToLogin={switchToLogin} onRegisterSuccess={handleRegisterSuccess} />
            )
          } />

          {/* Маршруты агентов (требуют наличия компонентов) */}
          <Route path="/agents/create" element={isAuthenticated ? <AgentCreateForm /> : <Navigate to="/login" replace />} />
          <Route path="/agents/:agent_name" element={isAuthenticated ? <AgentChat /> : <Navigate to="/login" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
