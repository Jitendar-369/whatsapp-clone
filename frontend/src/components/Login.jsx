import { useState } from 'react';
import { registerUser, loginUser, errorText } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const login = useAuthStore((state) => state.login);

  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = isRegister
        ? await registerUser(username.trim(), email.trim(), password)
        : await loginUser(username.trim(), password);
      login(response.data.user, response.data.token);
      onLoginSuccess?.();
    } catch (err) {
      setError(errorText(err, isRegister ? 'Registration failed' : 'Login failed'));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-banner" />
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.2 2 11.4c0 2.9 1.4 5.5 3.6 7.2L5 22l3.8-1.9c1 .3 2.1.4 3.2.4 5.52 0 10-4.2 10-9.4S17.52 2 12 2z" />
          </svg>
        </div>
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="login-sub">{isRegister ? 'Sign up to start chatting' : 'Log in to continue chatting'}</p>

        {error && <p className="login-error" role="alert">{error}</p>}

        <label>
          {isRegister ? 'Username' : 'Username or email'}
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required autoFocus />
        </label>

        {isRegister && (
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
        )}

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 6 : undefined}
            required
          />
        </label>

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Please wait…' : isRegister ? 'Register' : 'Log in'}
        </button>

        <p className="login-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </p>
      </form>
    </div>
  );
}
