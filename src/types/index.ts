export interface User {
  id: string;
  username: string;
  password: string;
  unitName: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface AdminContextType {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  exportUsers: () => User[];
  importUsers: (users: User[]) => number;
  getActivityLog: () => Array<{
    id: string;
    action: string;
    userId: string;
    timestamp: string;
    details: string;
  }>;
  clearActivityLog: () => void;
}