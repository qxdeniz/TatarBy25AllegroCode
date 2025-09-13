import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AgentChat = () => {
  const { agent_name } = useParams();
  const navigate = useNavigate();
  const [exists, setExists] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('access_token');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    const check = async () => {
      try {
        const resp = await axios.get(`/agents/${encodeURIComponent(agent_name)}/exists`);
        setExists(resp.data.exists);
        if (!resp.data.exists) {
          setExists(false);
        }
      } catch (err) {
        setExists(false);
      }
    };
    check();
  }, [agent_name, token, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const userMsg = { text: message, isUser: true, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const prompt = message;
    setMessage('');
    try {
      const resp = await axios.post(`/agents/${encodeURIComponent(agent_name)}/chat`, {
        prompt,
        model: 'gemini'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ответ: resp.data.response может быть {text: ...} или строкой
      const aiData = resp.data.response;
      let aiText = '';
      if (typeof aiData === 'string') aiText = aiData;
      else if (aiData && aiData.text) aiText = aiData.text;
      else aiText = JSON.stringify(aiData);

      const aiMsg = { text: aiText, isUser: false, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = { text: 'Ошибка при запросе к агенту', isUser: false, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (exists === null) return <div>Загрузка...</div>;
  if (exists === false) return <div>Агент "{agent_name}" не найден.</div>;

  return (
    <div className="main-container">
      <div className="welcome-message">
        <h1>Агент: {agent_name}</h1>
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((m, idx) => (
            <div key={idx} className={`message ${m.isUser ? 'user-message' : 'ai-message'}`}>
              <div className="message-content">{m.text}</div>
              <div className="message-time">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <div className="input-field">
          <input
            type="text"
            className="main-input"
            placeholder="Напишите сообщение агенту..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={loading}
          />
          <div className="input-bottom">
            <div className="left-controls">
              {/* пусто или добавить кнопки при необходимости */}
            </div>
            <button className="send-btn" onClick={handleSend} disabled={loading || !message.trim()}>
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
