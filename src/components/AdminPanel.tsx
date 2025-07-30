import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { User } from '../types';

const AdminPanel: React.FC = () => {
  const { logout } = useAuth();
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useAdmin();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'username' | 'unitName' | 'lastLogin'>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false); // Novo estado para mostrar/ocultar senha
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    unitName: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Validação do formulário
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.length < 3) {
      errors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    } else if (users.some(u => u.username === formData.username && u.id !== editingUser?.id)) {
      errors.username = 'Nome de usuário já existe';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.unitName.trim()) {
      errors.unitName = 'Nome da unidade é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filtrar e ordenar usuários
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(u => u.username !== 'admin');
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.unitName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => 
        filterStatus === 'active' ? u.isActive : !u.isActive
      );
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      if (sortBy === 'lastLogin') {
        aValue = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        bValue = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
      } else {
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [users, searchTerm, filterStatus, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
      setEditingUser(null);
    } else {
      addUser(formData);
    }
    
    setFormData({ username: '', password: '', unitName: '', isActive: true });
    setFormErrors({});
    setShowAddForm(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      unitName: user.unitName,
      isActive: user.isActive
    });
    setFormErrors({});
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', unitName: '', isActive: true });
    setFormErrors({});
    setShowPassword(false); // Reset password visibility
  };

  const handleDeleteConfirm = (userId: string) => {
    deleteUser(userId);
    setShowConfirmDelete(null);
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    bulkSelected.forEach(userId => {
      if (action === 'activate' || action === 'deactivate') {
        const user = users.find(u => u.id === userId);
        if (user && user.isActive !== (action === 'activate')) {
          toggleUserStatus(userId);
        }
      } else if (action === 'delete') {
        deleteUser(userId);
      }
    });
    setBulkSelected([]);
  };

  const handleSelectAll = () => {
    if (bulkSelected.length === paginatedUsers.length) {
      setBulkSelected([]);
    } else {
      setBulkSelected(paginatedUsers.map(u => u.id));
    }
  };

  const handleSort = (column: 'username' | 'unitName' | 'lastLogin') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Usuário', 'Unidade', 'Status', 'Último Acesso', 'Data de Criação'],
      ...filteredAndSortedUsers.map(user => [
        user.username,
        user.unitName,
        user.isActive ? 'Ativo' : 'Inativo',
        user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca',
        new Date(user.createdAt).toLocaleString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: 'var(--primary-orange)', marginBottom: '5px' }}>Gerenciamento de Usuários</h1>
            <p style={{ color: 'var(--medium-gray)', margin: 0 }}>
              Total: {users.length - 1} usuários | Ativos: {users.filter(u => u.isActive && u.username !== 'admin').length}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={exportToCSV} className="btn btn-secondary">
              📊 Exportar CSV
            </button>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="btn btn-primary"
            >
              ➕ Adicionar Usuário
            </button>
            <button onClick={logout} className="btn btn-secondary">
              🚪 Sair
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="card" style={{ marginBottom: '20px', background: 'var(--light-gray)', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">🔍 Buscar</label>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por usuário ou unidade..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">📊 Status</label>
              <select
                className="form-input"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as 'all' | 'active' | 'inactive');
                  setCurrentPage(1);
                }}
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">📋 Itens por página</label>
              <select className="form-input" disabled>
                <option value={10}>10</option>
              </select>
            </div>
          </div>
        </div>

        {/* Formulário de Adição/Edição */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '30px', background: 'var(--light-orange)', border: '2px solid var(--primary-orange)' }}>
            <h3 style={{ color: 'var(--dark-orange)', marginBottom: '20px' }}>
              {editingUser ? '✏️ Editar Usuário' : '➕ Adicionar Novo Usuário'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Nome de Usuário *</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.username ? 'error' : ''}`}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ex: centro.aldeia"
                  />
                  {formErrors.username && (
                    <span style={{ color: 'var(--danger)', fontSize: '14px' }}>{formErrors.username}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Senha *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${formErrors.password ? 'error' : ''}`}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: 'var(--medium-gray)',
                        padding: '0',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {formErrors.password && (
                    <span style={{ color: 'var(--danger)', fontSize: '14px' }}>{formErrors.password}</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nome da Unidade *</label>
                <input
                  type="text"
                  className={`form-input ${formErrors.unitName ? 'error' : ''}`}
                  value={formData.unitName}
                  onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                  placeholder="ex: Centro de Saude Aldeia"
                />
                {formErrors.unitName && (
                  <span style={{ color: 'var(--danger)', fontSize: '14px' }}>{formErrors.unitName}</span>
                )}
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  ✅ Usuário Ativo
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-success">
                  {editingUser ? '💾 Atualizar' : '➕ Adicionar'}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ações em Lote */}
        {bulkSelected.length > 0 && (
          <div className="card" style={{ marginBottom: '20px', background: 'var(--info)', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📋 {bulkSelected.length} usuário(s) selecionado(s)</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleBulkAction('activate')} 
                  className="btn btn-success"
                  style={{ padding: '6px 12px', fontSize: '14px' }}
                >
                  ✅ Ativar
                </button>
                <button 
                  onClick={() => handleBulkAction('deactivate')} 
                  className="btn btn-warning"
                  style={{ padding: '6px 12px', fontSize: '14px' }}
                >
                  ⏸️ Desativar
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')} 
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '14px' }}
                >
                  🗑️ Excluir
                </button>
                <button 
                  onClick={() => setBulkSelected([])} 
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '14px' }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Usuários */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={bulkSelected.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => handleSort('username')}
                >
                  👤 Usuário {sortBy === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => handleSort('unitName')}
                >
                  🏥 Unidade {sortBy === 'unitName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>📊 Status</th>
                <th 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => handleSort('lastLogin')}
                >
                  🕒 Último Acesso {sortBy === 'lastLogin' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>⚙️ Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.6 }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkSelected([...bulkSelected, user.id]);
                        } else {
                          setBulkSelected(bulkSelected.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.unitName}</td>
                  <td>
                    <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                      {user.isActive ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                  </td>
                  <td>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : '❌ Nunca'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleEdit(user)} 
                        className="btn btn-primary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title="Editar usuário"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user.id)} 
                        className={`btn ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title={user.isActive ? 'Desativar' : 'Ativar'}
                      >
                        {user.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        onClick={() => setShowConfirmDelete(user.id)} 
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title="Excluir usuário"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
              style={{ padding: '8px 12px' }}
            >
              ← Anterior
            </button>
            
            <span style={{ padding: '0 15px', color: 'var(--medium-gray)' }}>
              Página {currentPage} de {totalPages} ({filteredAndSortedUsers.length} usuários)
            </span>
            
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
              style={{ padding: '8px 12px' }}
            >
              Próxima →
            </button>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showConfirmDelete && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ maxWidth: '400px', margin: '20px' }}>
              <h3 style={{ color: 'var(--danger)', marginBottom: '15px' }}>⚠️ Confirmar Exclusão</h3>
              <p>Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  onClick={() => handleDeleteConfirm(showConfirmDelete)} 
                  className="btn btn-danger"
                >
                  🗑️ Sim, Excluir
                </button>
                <button 
                  onClick={() => setShowConfirmDelete(null)} 
                  className="btn btn-secondary"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando não há usuários */}
        {filteredAndSortedUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
            <h3>📭 Nenhum usuário encontrado</h3>
            <p>Tente ajustar os filtros de busca ou adicione novos usuários.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;