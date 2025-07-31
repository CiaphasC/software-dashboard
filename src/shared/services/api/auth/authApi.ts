// Servicio completo de autenticación - Migrado desde api.ts monolítico
import { User, UserRole } from '@/features/auth/types';

// Datos de demostración
const demoUsers: (User & { password: string })[] = [
  {
    id: 'admin',
    name: 'Administrador',
    email: 'admin@empresa.com',
    password: 'admin123',
    role: UserRole.ADMIN,
    department: 'TI',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    avatar: undefined
  },
  {
    id: 'tecnico',
    name: 'Técnico',
    email: 'tecnico@empresa.com',
    password: 'tecnico123',
    role: UserRole.TECHNICIAN,
    department: 'TI',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    avatar: undefined
  },
  {
    id: 'solicitante',
    name: 'Solicitante',
    email: 'solicitante@empresa.com',
    password: 'solicitante123',
    role: UserRole.REQUESTER,
    department: 'Ventas',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    avatar: undefined
  }
];

// Simulación de usuarios en memoria
let users: User[] = demoUsers.map(({ password, ...user }) => user);

// Función para inicializar datos
export const initializeUsers = () => {
  if (users.length === 0) {
    users = demoUsers.map(({ password, ...user }) => user);
  }
};

export const authApi = {
  // Inicializar datos
  initializeUsers,
  
  // Autenticación
  async login(email: string, password: string): Promise<User> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    
    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Logout
  async logout(): Promise<void> {
    // Limpiar storage local si es necesario
    localStorage.removeItem('user');
  },

  // Verificar token/sesión
  async verifySession(): Promise<User | null> {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Gestión de usuarios (solo para admins)
  async getUsers(): Promise<User[]> {
    return users;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    return users[userIndex];
  },

  async deleteUser(id: string): Promise<void> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    users.splice(userIndex, 1);
  },

  // Cambio de contraseña
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = demoUsers.find(u => u.id === userId);
    if (!user || user.password !== currentPassword) {
      throw new Error('Contraseña actual incorrecta');
    }
    
    // En un sistema real, esto se haría en el backend
    user.password = newPassword;
  }
}; 
