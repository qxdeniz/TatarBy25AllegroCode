import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AgentCreateForm = () => {
  const [form, setForm] = useState({ name: '', system_prompt: '', knowledge: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    // Allow reading of common text formats
    const allowedTextTypes = ['text/plain', 'application/json', 'text/markdown', 'text/csv'];
    if (allowedTextTypes.includes(file.type) || /\.(txt|md|json|csv)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        setForm(prev => ({ ...prev, knowledge: typeof text === 'string' ? text : '' }));
      };
      reader.onerror = () => {
        setFileError('Не удалось прочитать файл');
      };
      reader.readAsText(file, 'utf-8');
    } else {
      // For unsupported binary formats notify user (optionally support base64 in future)
      setFileError('Поддерживаются только текстовые файлы (.txt, .md, .json, .csv). Для других форматов скопируйте содержимое в поле "Знания".');
      setFileName('');
    }
  };

  const clearFile = () => {
    setFileName('');
    setFileError('');
    setForm(prev => ({ ...prev, knowledge: '' }));
    // also clear input value if needed
    const input = document.getElementById('knowledge-file-input');
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Необходимо авторизоваться');
      setLoading(false);
      return;
    }
    try {
      const resp = await axios.post('/create_agent', {
        name: form.name,
        system_prompt: form.system_prompt,
        knowledge: form.knowledge
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/agents/${encodeURIComponent(resp.data.name)}`);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Ошибка при создании агента');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Создать агента</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Имя агента</label>
          <input name="name" required value={form.name} onChange={handleChange} className="form-input" placeholder="Имя агента (латинские/русские символы)" />
        </div>

        <div className="form-group">
          <label className="form-label">Системный промпт</label>
          <textarea name="system_prompt" value={form.system_prompt} onChange={handleChange} className="form-input" placeholder="Системный промпт" rows={4} />
        </div>

        <div className="form-group">
          <label className="form-label">Знания (опционально)</label>
          <textarea name="knowledge" value={form.knowledge} onChange={handleChange} className="form-input" placeholder="Дополнительные знания" rows={4} />
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input id="knowledge-file-input" type="file" accept=".txt,.md,.json,.csv,text/plain,application/json" onChange={handleFileChange} />
            {fileName && <span style={{ fontSize: 13 }}>{fileName}</span>}
            {fileName && <button type="button" onClick={clearFile} className="form-button" style={{ padding: '6px 8px' }}>Очистить файл</button>}
          </div>
          {fileError && <div className="error-message" style={{ marginTop: 6 }}>{fileError}</div>}
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--deep-navy)' }}>Поддержка: .txt, .md, .json, .csv. Для других форматов скопируйте содержимое вручную.</div>
        </div>

        {error && <span className="error-message">{error}</span>}

        <button type="submit" className="form-button" disabled={loading}>
          {loading ? 'Создание...' : 'Создать агента'}
        </button>
      </form>
    </div>
  );
};

export default AgentCreateForm;
