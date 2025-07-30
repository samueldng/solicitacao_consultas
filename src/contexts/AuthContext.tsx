import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { defaultUsers } from '../data/users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers); // Sempre usar users.ts como base

  useEffect(() => {
    // Carregar apenas o usuário logado atual
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }

    // Carregar usuários adicionais criados pelo admin (se houver)
    const additionalUsers = localStorage.getItem('additionalUsers');
    if (additionalUsers) {
      try {
        const parsed = JSON.parse(additionalUsers);
        // Combinar usuários do users.ts com os adicionais
        setUsers([...defaultUsers, ...parsed]);
      } catch (error) {
        // Se der erro, usar apenas os usuários padrão
        setUsers(defaultUsers);
      }
    } else {
      // Usar apenas os usuários do users.ts
      setUsers(defaultUsers);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Tentando login com:', { username, password });
    
    const foundUser = users.find(
      u => u.username === username && u.password === password && u.isActive
    );
    
    console.log('Usuário encontrado:', foundUser);

    if (foundUser) {
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };
      
      // Salvar apenas o usuário logado (sem senha por segurança)
      const userToStore = {
        ...updatedUser,
        password: '' // Remover senha do localStorage
      };
      
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.username === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      isAuthenticated,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};