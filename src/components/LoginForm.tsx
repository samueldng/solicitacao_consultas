import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/globals.css';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Usuário ou senha inválidos. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Erro interno do sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src="/logo-nova-bacabal.png" 
            alt="Nova Bacabal - Secretaria de Saúde" 
            className="logo"
            style={{
              maxWidth: '280px',
              width: '100%',
              height: 'auto',
              marginBottom: '20px'
            }}
          />
          <p style={{ color: 'var(--medium-gray)', marginTop: '10px', fontSize: '16px' }}>
            Acesso ao Sistema de Solicitações
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Usuário (Unidade de Saúde)
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--medium-gray)' }}>
          <p>Acesso restrito às unidades de saúde autorizadas</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;