import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { defaultUsers } from '../data/users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedUsers = localStorage.getItem('systemUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = users.find(
      u => u.username === username && u.password === password && u.isActive
    );

    if (foundUser) {
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };
      
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Atualizar último login no array de usuários
      const updatedUsers = users.map(u => 
        u.id === foundUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
      
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
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};