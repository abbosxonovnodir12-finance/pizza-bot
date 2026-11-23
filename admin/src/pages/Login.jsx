import { useState } from 'react';
import { api, auth } from '../api.js';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.login(password);
      auth.set(token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">🍕</div>
        <h1>TEZ Admin</h1>
        <p className="muted">Boshqaruv paneliga kirish</p>
        <input
          type="password"
          className="input"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <div className="alert">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={loading || !password}>
          {loading ? 'Tekshirilmoqda...' : 'Kirish'}
        </button>
      </form>
    </div>
  );
}
