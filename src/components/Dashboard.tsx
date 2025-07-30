import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    // Redirecionar automaticamente para o Google Forms após 3 segundos
    if (!isAdmin) {
      const timer = setTimeout(() => {
        window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLScaEvAGFDYayY0pUz9FGjq1v_J4dpPART877HrXBmxqlFU6BQ/viewform';
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  const handleRedirectNow = () => {
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLScaEvAGFDYayY0pUz9FGjq1v_J4dpPART877HrXBmxqlFU6BQ/viewform';
  };

  if (isAdmin) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: 'var(--primary-orange)' }}>Painel Administrativo</h1>
            <button onClick={logout} className="btn btn-secondary">
              Sair
            </button>
          </div>
          
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Bem-vindo, Administrador!</h2>
            <p style={{ marginTop: '20px', color: 'var(--medium-gray)' }}>
              Use o painel de administração para gerenciar os usuários do sistema.
            </p>
            <div style={{ marginTop: '30px' }}>
              <Link to="/admin" className="btn btn-primary" style={{ marginRight: '10px', textDecoration: 'none' }}>
                👥 Gerenciar Usuários
              </Link>
              <button onClick={handleRedirectNow} className="btn btn-secondary">
                📋 Acessar Formulário
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: 'var(--primary-orange)' }}>Acesso Autorizado!</h1>
          <h2 style={{ color: 'var(--success)', marginTop: '10px' }}>✓ Login realizado com sucesso</h2>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            Bem-vindo(a), <strong>{user?.unitName}</strong>
          </p>
          <p style={{ color: 'var(--medium-gray)' }}>
            Você será redirecionado automaticamente para o formulário em <span id="countdown">3</span> segundos...
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <button onClick={handleRedirectNow} className="btn btn-primary" style={{ marginRight: '10px' }}>
            📋 Acessar Formulário Agora
          </button>
          <button onClick={logout} className="btn btn-secondary">
            🚪 Sair do Sistema
          </button>
        </div>

        <div style={{ fontSize: '14px', color: 'var(--medium-gray)' }}>
          <p>Último acesso: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Primeiro acesso'}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;