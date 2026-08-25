import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field } from '../components/ui';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <div className="login__mark">abyr</div>
          <div className="login__sub">LINE · ADMIN</div>
        </div>
        <h1 className="login__title">Sign in</h1>
        <p className="login__hint">Owner access to your store content and orders.</p>

        <form className="login__form" onSubmit={onSubmit}>
          {error && <div className="login__error">{error}</div>}
          <Field
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={submitting} style={{ width: '100%', marginTop: 4 }}>
            Sign in
          </Button>
        </form>

        <div className="login__foot">Abyr Line — modest fashion</div>
      </div>
    </div>
  );
}
