// Servicio completo de autenticación - Migrado desde api.ts monolítico
import { User, UserRole, PendingUser, PendingUserStatus } from '@/features/auth/types';

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
    avatar: undefined,
    isActive: true,
    isEmailVerified: true,
    lastLoginAt: new Date()
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
    avatar: undefined,
    isActive: true,
    isEmailVerified: true,
    lastLoginAt: new Date()
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
    avatar: undefined,
    isActive: true,
    isEmailVerified: true,
    lastLoginAt: new Date()
  }
];

// Simulación de usuarios en memoria
let users: User[] = demoUsers.map(({ password, ...user }) => user);

// Simulación de usuarios pendientes en memoria
let pendingUsers: PendingUser[] = [];

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
    
    if (!user.isActive) {
      throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
    }
    
    // Actualizar último login
    user.lastLoginAt = new Date();
    
    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Registro de usuarios
  async register(userData: {
    name: string;
    email: string;
    password: string;
    department: string;
    requestedRole: UserRole;
  }): Promise<void> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar si el email ya existe
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado en el sistema');
    }
    
    const existingPending = pendingUsers.find(u => u.email === userData.email);
    if (existingPending) {
      throw new Error('Ya existe una solicitud pendiente con este email');
    }
    
    // Crear usuario pendiente
    const pendingUser: PendingUser = {
      id: `pending_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password, // En producción esto se hashearía
      department: userData.department,
      requestedRole: userData.requestedRole,
      status: PendingUserStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    pendingUsers.push(pendingUser);
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

  // Gestión de usuarios pendientes
  async getPendingUsers(): Promise<PendingUser[]> {
    return pendingUsers;
  },

  async getPendingUsersCount(): Promise<number> {
    return pendingUsers.filter(u => u.status === PendingUserStatus.PENDING).length;
  },

  async approvePendingUser(pendingUserId: string, approvedBy: string): Promise<User> {
    const pendingUserIndex = pendingUsers.findIndex(u => u.id === pendingUserId);
    if (pendingUserIndex === -1) {
      throw new Error('Usuario pendiente no encontrado');
    }
    
    const pendingUser = pendingUsers[pendingUserIndex];
    
    // Crear usuario activo
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: pendingUser.name,
      email: pendingUser.email,
      role: pendingUser.requestedRole,
      department: pendingUser.department,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isEmailVerified: false,
      avatar: undefined
    };
    
    // Agregar password al array de demoUsers para autenticación
    demoUsers.push({
      ...newUser,
      password: pendingUser.password
    });
    
    // Agregar usuario a la lista de usuarios activos
    users.push(newUser);
    
    // Actualizar estado del usuario pendiente
    pendingUsers[pendingUserIndex] = {
      ...pendingUser,
      status: PendingUserStatus.APPROVED,
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date()
    };
    
    return newUser;
  },

  async rejectPendingUser(pendingUserId: string, rejectedBy: string, reason: string): Promise<void> {
    const pendingUserIndex = pendingUsers.findIndex(u => u.id === pendingUserId);
    if (pendingUserIndex === -1) {
      throw new Error('Usuario pendiente no encontrado');
    }
    
    pendingUsers[pendingUserIndex] = {
      ...pendingUsers[pendingUserIndex],
      status: PendingUserStatus.REJECTED,
      approvedBy: rejectedBy,
      approvedAt: new Date(),
      rejectionReason: reason,
      updatedAt: new Date()
    };
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

  async updateUser(id: string, updates: Partial<User> & { password?: string }): Promise<User> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    // Si se proporciona una nueva contraseña, actualizarla en demoUsers
    if (updates.password) {
      const demoUserIndex = demoUsers.findIndex(u => u.id === id);
      if (demoUserIndex !== -1) {
        demoUsers[demoUserIndex].password = updates.password;
      }
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
