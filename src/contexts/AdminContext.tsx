import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AdminContextType } from '../types';
import { defaultUsers } from '../data/users';
import { hashPassword, encryptData, decryptData } from '../utils/crypto';

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
      try {
        // Tentar descriptografar primeiro, se falhar, usar dados não criptografados (compatibilidade)
        const decryptedUsers = decryptData(savedUsers);
        setUsers(JSON.parse(decryptedUsers));
      } catch (error) {
        // Se falhar na descriptografia, pode ser dados antigos não criptografados
        try {
          setUsers(JSON.parse(savedUsers));
          // Migrar para formato criptografado
          const users = JSON.parse(savedUsers);
          localStorage.setItem('systemUsers', encryptData(JSON.stringify(users)));
        } catch (parseError) {
          console.error('Erro ao carregar usuários:', parseError);
          setUsers(defaultUsers);
          localStorage.setItem('systemUsers', encryptData(JSON.stringify(defaultUsers)));
        }
      }
    } else {
      localStorage.setItem('systemUsers', encryptData(JSON.stringify(defaultUsers)));
      setUsers(defaultUsers);
    }
    
    if (savedLog) {
      try {
        // ActivityLog pode não estar criptografado ainda, então tentamos ambos
        const decryptedLog = decryptData(savedLog);
        setActivityLog(JSON.parse(decryptedLog));
      } catch (error) {
        try {
          setActivityLog(JSON.parse(savedLog));
        } catch (parseError) {
          console.error('Erro ao carregar log de atividades:', parseError);
          setActivityLog([]);
        }
      }
    }
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('systemUsers', encryptData(JSON.stringify(updatedUsers)));
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

  // Na função addUser:
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      password: hashPassword(userData.password), // Hash da senha
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    logActivity('CREATE', newUser.id, `Usuário criado: ${newUser.username}`);
  };
  
  // Na função updateUser:
  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedData = { ...updates };
    
    if (updates.password) {
      updatedData.password = hashPassword(updates.password);
    }
    
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, ...updatedData } : user
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