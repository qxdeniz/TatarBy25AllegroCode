import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const AgentsPage = () => {
  const navigate = useNavigate();
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
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAccountInfo(null);
      setShowProfilePopup(true);
      return;
    }
    try {
      const res = await fetch((process.env.REACT_APP_API_URL || '') + '/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
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
          <a href="/agents" className="nav-link active">
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
        {/* декоративный эллипс: центр эллипса должен быть в верхнем правом углу экрана */}
        <img src="/images/Ellipse0.svg" className="hero-ellipse0" alt="" aria-hidden="true" />
        {/* декоративная звезда, центр которой должен совпадать с верхним правым углом; расположена за Ellipse0 через з-index в CSS */}
        <img src="/images/Star1.svg" className="hero-star1" alt="" aria-hidden="true" />
        {/* заголовок над квадратами */}
        <div className="decor-title" aria-hidden="true">
          <span className="title-light">Үзегез өчен </span>
          <span className="title-highlight">Идел</span>
          <span className="title-light">ачыгыз</span>
        </div>

        {/* декоративные квадраты чуть ниже центра */}
        <div className="decor-squares" aria-hidden="true">
          <div className="decor-square sq1" onClick={() => navigate('/autoposting')} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/autoposting'); }}>
            <img src="/images/Posts.svg" className="square-icon" alt="" aria-hidden="true" />
            <div className="square-title">Автопостинг</div>
            <div className="square-subtitle" style={{ fontSize: 15, opacity: 0.85, marginTop: 4 }}>Сезнең өчен кызыклы яңалыклар бастырачак</div>
          </div>
          <div className="decor-square sq2" onClick={() => navigate('/science')} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/science'); }}>
            <img src="/images/science.svg" className="square-icon" alt="" aria-hidden="true" />
            <div className="square-title">Белемгер</div>
            <div className="square-subtitle" style={{ fontSize: 15, opacity: 0.85, marginTop: 4 }}>Фәнни эшне татарча рәсмиләштерергә ярдәм итәчәк</div>  
          </div>
          <div className="decor-square sq3" onClick={() => navigate('/art')} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/art'); }}>
            <img src="/images/journal.svg" className="square-icon" alt="" aria-hidden="true" />
            <div className="square-title">Калемдэш</div>
            <div className="square-subtitle" style={{ fontSize: 15, opacity: 0.85, marginTop: 4 }}>Нәр журналга татарча колонка</div>
          </div>
        </div>

        {/* Кнопка создания агента — расположена под квадратами и ведёт на форму создания */}
        <button
          className="create-agent-btn"
          type="button"
          onClick={() => navigate('/agents/create')}
          aria-label="Создать агента"
        >
          Үз агентыңны булдыру
        </button>
        
      </div>
    </div>
  );
};

export default AgentsPage;
