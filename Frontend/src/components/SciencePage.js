import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const SciencePage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => ([
    { text: 'Фәнни мәкалә темасын кертегез', isUser: false, timestamp: new Date().toISOString() }
  ]));
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const token = localStorage.getItem('access_token');
  const API_URL = process.env.REACT_APP_API_URL || '';
  const messagesEndRef = useRef(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [userName, setUserName] = useState('Алмаз');
  const profileRef = useRef(null);

  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) setUserName(savedUserName);
  }, []);

  const fetchAccountInfo = async () => {
    const t = localStorage.getItem('access_token');
    if (!t) {
      setAccountInfo(null);
      setShowProfilePopup(true);
      return;
    }
    try {
      const res = await fetch((process.env.REACT_APP_API_URL || '') + '/userinfo', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) setAccountInfo(await res.json());
      else setAccountInfo(null);
    } catch (e) {
      setAccountInfo(null);
    }
    setShowProfilePopup(true);
  };

  useEffect(() => {
    if (!showProfilePopup) return;
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfilePopup(false);
    };
    const onKeyDown = (e) => { if (e.key === 'Escape') setShowProfilePopup(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showProfilePopup]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        try { URL.revokeObjectURL(pdfUrl); } catch (e) { /* ignore */ }
      }
    };
  }, [pdfUrl]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const prompt = message;
    setMessage('');

    // добавляем сообщение пользователя
    const userMsg = { text: prompt, isUser: true, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const resp = await axios.post(`${API_URL}/creators/sci`, { prompt }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const base64 = resp.data && resp.data.base64_pdf;
      if (base64) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        if (pdfUrl) {
          try { URL.revokeObjectURL(pdfUrl); } catch (e) { /* ignore */ }
        }
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        // сообщение от ИИ о том, что PDF готов
        const aiMsg = { text: 'PDF-документ создан', isUser: false, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errMsg = { text: 'Не удалось получить PDF от сервера', isUser: false, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, errMsg]);
      }
    } catch (err) {
      const errMsg = { text: 'Ошибка при запросе к агенту', isUser: false, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleLogoutClick = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <button className="toggle-btn" onClick={toggleSidebar}>☰</button>

        <nav>
          <a href="/new-chat" className="nav-link">
            <img src="/images/newChat.svg" alt="New Chat Icon" style={{ width: 20, height: 20 }} />
            <span className="text">Яңа чат</span>
          </a>
          <a href="/agents" className="nav-link">
            <img src="/images/bot.svg" alt="Bot Icon" style={{ width: 20, height: 20 }} />
            <span className="text">Агентлар</span>
          </a>
        </nav>

        <div className="profile" ref={profileRef} onClick={() => { if (!showProfilePopup) fetchAccountInfo(); setShowProfilePopup(!showProfilePopup); }}>
          <img src="/images/noName.svg" alt="avatar" />
          <span className="text">Минем профиль</span>

          {showProfilePopup && (
            <div className="profile-popup">
              <div style={{ marginBottom: 8, fontWeight: 600 }}>{userName}</div>
              {accountInfo && accountInfo.email && (
                <div style={{ fontSize: 13, opacity: 0.8 }}>{accountInfo.email}</div>
              )}
              <button className="form-button" onClick={handleLogoutClick}>Выйти</button>
            </div>
          )}
        </div>
      </div>

      <div className={`main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : 'menu-open'}`}>
        <div className="chat-container">
          <div className="messages-area">
            {messages.map((m, idx) => (
              <div key={idx} className={`message ${m.isUser ? 'user-message' : 'ai-message'}`}>
                <div className="message-content">{m.text}</div>
                <div className="message-time">{new Date(m.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {pdfUrl && (
              <div style={{ width: '100%', height: '100%', minHeight: 480, marginTop: 10 }}>
                <iframe title="science-pdf" src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
              </div>
            )}
          </div>
        </div>

        <div className="input-container">
          <div className="input-field compact-input-field">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Напишите сообщение"
              className="main-input single-line-input"
              disabled={loading}
            />
            <div className="input-bottom">
              <div className="left-controls"></div>
              <button className="send-btn" onClick={handleSend} disabled={loading || !message.trim()}>
                <img src="/images/setMessage.svg" alt="Отправить" style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SciencePage;
