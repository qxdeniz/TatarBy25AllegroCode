import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';
import AgentCreateForm from './components/AgentCreateForm';
import AgentChat from './components/AgentChat';
import AgentsPage from './components/AgentsPage';
import SciencePage from './components/SciencePage';
import ArtPage from './components/ArtPage';
import AutopostingForm from './components/AutopostingForm';

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  const switchToRegister = () => {
    navigate('/register');
  };

  const switchToLogin = () => {
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="App">
      <div className="container">
        <Routes>
          {/* Главная страница — доступна только аутентифицированным; иначе редирект на /login */}
          <Route path="/" element={isAuthenticated ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} />

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
          <Route path="/agents" element={isAuthenticated ? <AgentsPage /> : <Navigate to="/login" replace />} />
          <Route path="/agents/create" element={isAuthenticated ? <AgentCreateForm /> : <Navigate to="/login" replace />} />
          <Route path="/agents/:agent_name" element={isAuthenticated ? <AgentChat /> : <Navigate to="/login" replace />} />
          <Route path="/autoposting" element={isAuthenticated ? <AutopostingForm /> : <Navigate to="/login" replace />} />

          <Route path="/science" element={isAuthenticated ? <SciencePage /> : <Navigate to="/login" replace />} />
          <Route path="/art" element={isAuthenticated ? <ArtPage /> : <Navigate to="/login" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
