import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PLAYER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        navigate('/');
      } else {
        setError(data.error || 'Erro ao criar conta');
      }
    } catch {
      setError('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-decor">
        <div style={{ fontSize: '3.5rem' }}>⚽</div>
        <h1>SportHub</h1>
        <p>Crie sua conta gratuitamente</p>
      </div>

      <div className="auth-card">
        <h2>Criar conta</h2>
        <p className="auth-subtitle">Preencha os dados abaixo para começar</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Eu sou um(a)</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="PLAYER">Jogador(a)</option>
              <option value="ORGANIZER">Organizador(a) de Eventos</option>
              <option value="VENUE_ADMIN">Dono(a) de Quadra</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '0.5rem', padding: '0.875rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta?{' '}
          <Link to="/login" style={{ fontWeight: 700 }}>Fazer Login</Link>
        </div>
      </div>
    </div>
  );
}
