import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

// Явный базовый URL API (можно задать в окружении REACT_APP_API_URL)
const API_URL = process.env.REACT_APP_API_URL || '';

const HomePage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedAI, setSelectedAI] = useState('gemini');
  const [userName, setUserName] = useState('Алмаз');
  const [isLoading, setIsLoading] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);

  // Получаем имя пользователя из localStorage
  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    console.log('HomePage mounted, savedUserName=', savedUserName);
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  const fetchAccountInfo = async () => {
    const token = localStorage.getItem('access_token');
    console.log('fetchAccountInfo called, token=', !!token);
    if (!token) {
      setAccountInfo(null);
      setShowAccount(true);
      return;
    }
    try {
      const url = API_URL ? `${API_URL.replace(/\/$/, '')}/userinfo` : '/userinfo';
      console.log('Requesting userinfo at', url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('userinfo response status', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('userinfo data', data);
        setAccountInfo(data || null);
      } else {
        const text = await res.text().catch(()=>null);
        console.warn('userinfo error response', res.status, text);
        setAccountInfo(null);
      }
    } catch (e) {
      console.error('fetchAccountInfo error', e);
      setAccountInfo(null);
    }
    setShowAccount(true);
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userName');
    setShowAccount(false);
    if (typeof onLogout === 'function') onLogout();
  };

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = { 
        text: message, 
        isUser: true, 
        timestamp: new Date(),
        model: selectedAI
      };
      setMessages(prev => [...prev, userMessage]);
      const currentMessage = message;
      setMessage('');
      setIsLoading(true);

      try {
        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: currentMessage,
            model: selectedAI
          })
        });

        if (response.ok) {
          const data = await response.json();


          const aiText = typeof data.response === 'string'
            ? data.response
            : (data.response && typeof data.response.text === 'string'
              ? data.response.text
              : JSON.stringify(data.response));

          const aiMessage = { 
            text: aiText, 
            isUser: false, 
            timestamp: new Date(),
            model: selectedAI
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error('Ошибка при отправке сообщения');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        const errorMessage = { 
          text: 'Извините, произошла ошибка при обработке вашего сообщения.', 
          isUser: false, 
          timestamp: new Date(),
          model: selectedAI,
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Выбран файл:', file.name);
      }
    };
    input.click();
  };

  const handleAISelect = () => {
    const models = ['gemini', 'yandex'];
    const currentIndex = models.indexOf(selectedAI);
    const nextIndex = (currentIndex + 1) % models.length;
    setSelectedAI(models[nextIndex]);
  };

  const getAIIcon = (ai) => {
    switch (ai) {
      case 'gemini': return '💎';
      case 'yandex': return '🔍';
      default: return '💎';
    }
  };

  const getAIName = (ai) => {
    switch (ai) {
      case 'gemini': return 'Gemini';
      case 'yandex': return 'Yandex GPT';
      default: return 'Gemini';
    }
  };

  return (
    <div className="main-container">
      {/* Приветственное сообщение */}
      <div className="welcome-message">
        <h1>Сәлам, {userName}!</h1>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
          <button
            className="logout-button"
            onClick={fetchAccountInfo}
            title="Информация аккаунта"
          >
            Аккаунт
          </button>
          <button
            className="logout-button"
            onClick={() => navigate('/agents/create')}
            title="Перейти к созданию/списку агентов"
          >
            Агенты
          </button>
          <button
            className="logout-button"
            onClick={handleLogoutClick}
            title="Выйти из аккаунта"
          >
            Выйти
          </button>
        </div>

        {/* Карточка аккаунта */}
        {showAccount && (
          <div style={{
            marginTop: 12,
            background: 'rgba(255,255,255,0.95)',
            color: '#1B2951',
            padding: 12,
            borderRadius: 10,
            boxShadow: '0 6px 18px rgba(27,41,81,0.08)',
            maxWidth: 360,
            textAlign: 'left'
          }}>
            {accountInfo ? (
              <>
                <div style={{ fontWeight: 700 }}>{accountInfo.name || accountInfo.username || 'Пользователь'}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{accountInfo.email}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button className="form-button" onClick={() => { setShowAccount(false); navigate('/'); }}>Закрыть</button>
                  <button className="form-button" onClick={() => { setShowAccount(false); }}>ОК</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600 }}>Не удалось получить данные аккаунта</div>
                <div style={{ marginTop: 8 }}>
                  <button className="form-button" onClick={() => { setShowAccount(false); }}>Закрыть</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Область сообщений */}
      {messages.length > 0 && (
        <div className="chat-container">
          <div className="messages-area">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}>
                <div className="message-content">
                  {/* Гарантируем, что отображается только строка ответа */}
                  {typeof msg.text === 'string' ? msg.text : (msg.text && msg.text.text ? msg.text.text : '')}
                  {!msg.isUser && (
                    <div className="message-model">
                      {getAIName(msg.model)}
                    </div>
                  )}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}

            {/* Индикатор загрузки */}
            {isLoading && (
              <div className="message ai-message loading">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Основное поле ввода */}
      <div className="input-container">
        <div className="input-field">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Берәр нәрсә языгыз"
            className="main-input"
            disabled={isLoading}
          />
          
          {/* Нижняя панель с кнопками */}
          <div className="input-bottom">
            <div className="left-controls">
              <button className="attach-btn" onClick={handleFileUpload} title="Прикрепить файл">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                </svg>
              </button>
              
              <button className="ai-select-btn" onClick={handleAISelect} title={`Выбран: ${getAIName(selectedAI)}`}>
                {getAIIcon(selectedAI)}
              </button>
              
              <div className="ai-info">
                <div className="status-dot"></div>
                <span className="ai-name">{getAIName(selectedAI)}</span>
              </div>
            </div>
            
            <button 
              className="send-btn" 
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              title="Отправить сообщение"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
