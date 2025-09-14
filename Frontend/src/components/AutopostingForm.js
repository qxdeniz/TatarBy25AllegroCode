import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AutopostingForm = () => {
  const [form, setForm] = useState({ tg_bot_token: '', channel_id: '', prompt_morning: '', prompt_midday: '', prompt_evening: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const start = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('/autoposting/start', {
        tg_bot_token: form.tg_bot_token,
        channel_id: form.channel_id,
        prompt_morning: form.prompt_morning,
        prompt_midday: form.prompt_midday,
        prompt_evening: form.prompt_evening
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setStatus('Автопостинг запущен');
    } catch (err) {
      setStatus('Ошибка: ' + (err.response?.data?.detail || err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const stop = async () => {
    setLoading(true);
    setStatus('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('/autoposting/stop', { channel_id: form.channel_id }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setStatus('Запрос на остановку отправлен');
    } catch (err) {
      setStatus('Ошибка: ' + (err.response?.data?.detail || err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Автопостинг</h2>
      <form onSubmit={start}>
        <div className="form-group">
          <label className="form-label">TG Bot Token</label>
          <input name="tg_bot_token" required value={form.tg_bot_token} onChange={handleChange} className="form-input" placeholder="123456:ABC-DEF..." />
        </div>

        <div className="form-group">
          <label className="form-label">Channel ID</label>
          <input name="channel_id" required value={form.channel_id} onChange={handleChange} className="form-input" placeholder="-1001234567890" />
        </div>

        <div className="form-group">
          <label className="form-label">Промпт (утро)</label>
          <textarea name="prompt_morning" value={form.prompt_morning} onChange={handleChange} className="form-input" rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">Промпт (день)</label>
          <textarea name="prompt_midday" value={form.prompt_midday} onChange={handleChange} className="form-input" rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">Промпт (вечер)</label>
          <textarea name="prompt_evening" value={form.prompt_evening} onChange={handleChange} className="form-input" rows={3} />
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="submit" className="form-button" disabled={loading}>{loading ? 'Запуск...' : 'Start'}</button>
          <button type="button" className="form-button" onClick={stop} disabled={loading}>{loading ? '...' : 'Stop'}</button>
          <button type="button" className="form-button" onClick={() => navigate(-1)}>Back</button>
        </div>

        {status && <div style={{ marginTop: 10 }} className="error-message">{status}</div>}
      </form>
    </div>
  );
};

export default AutopostingForm;
