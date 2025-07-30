import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AdminContextType } from '../types';
import { defaultUsers } from '../data/users';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [activityLog, setActivityLog] = useState<Array<{
    id: string;
    action: string;
    userId: string;
    timestamp: string;
    details: string;
  }>>([]);

  useEffect(() => {
    const savedUsers = localStorage.getItem('systemUsers');
    const savedLog = localStorage.getItem('activityLog');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('systemUsers', JSON.stringify(defaultUsers));
    }
    
    if (savedLog) {
      setActivityLog(JSON.parse(savedLog));
    }
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
  };

  const logActivity = (action: string, userId: string, details: string) => {
    const newLog = {
      id: Date.now().toString(),
      action,
      userId,
      timestamp: new Date().toISOString(),
      details
    };
    
    const updatedLog = [newLog, ...activityLog].slice(0, 100); // Manter apenas os últimos 100 logs
    setActivityLog(updatedLog);
    localStorage.setItem('activityLog', JSON.stringify(updatedLog));
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    logActivity('CREATE', newUser.id, `Usuário criado: ${newUser.username}`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, ...updates } : user
    );
    saveUsers(updatedUsers);
    logActivity('UPDATE', id, `Usuário atualizado: ${updates.username || 'dados alterados'}`);
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    const updatedUsers = users.filter(user => user.id !== id);
    saveUsers(updatedUsers);
    logActivity('DELETE', id, `Usuário excluído: ${userToDelete?.username || 'desconhecido'}`);
  };

  const toggleUserStatus = (id: string) => {
    const user = users.find(u => u.id === id);
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, isActive: !user.isActive } : user
    );
    saveUsers(updatedUsers);
    logActivity(
      'STATUS_CHANGE', 
      id, 
      `Status alterado para: ${user?.isActive ? 'Inativo' : 'Ativo'}`
    );
  };

  const exportUsers = () => {
    return users.filter(u => u.username !== 'admin');
  };

  const importUsers = (importedUsers: User[]) => {
    const validUsers = importedUsers.filter(u => 
      u.username && u.password && u.unitName
    );
    
    const mergedUsers = [...users];
    let importCount = 0;
    
    validUsers.forEach(importedUser => {
      const existingIndex = mergedUsers.findIndex(u => u.username === importedUser.username);
      if (existingIndex >= 0) {
        mergedUsers[existingIndex] = { ...mergedUsers[existingIndex], ...importedUser };
      } else {
        mergedUsers.push({
          ...importedUser,
          id: Date.now().toString() + Math.random(),
          createdAt: new Date().toISOString()
        });
        importCount++;
      }
    });
    
    saveUsers(mergedUsers);
    logActivity('IMPORT', 'system', `${importCount} usuários importados`);
    return importCount;
  };

  const getActivityLog = () => activityLog;

  const clearActivityLog = () => {
    setActivityLog([]);
    localStorage.removeItem('activityLog');
  };

  return (
    <AdminContext.Provider value={{
      users,
      addUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      exportUsers,
      importUsers,
      getActivityLog,
      clearActivityLog
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
};