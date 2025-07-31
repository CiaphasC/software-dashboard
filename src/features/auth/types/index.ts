// Tipos específicos para el feature de autenticación
import { UserRole, PendingUserStatus } from '@/shared/types/common.types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  TECHNICIAN = 'technician',
  REQUESTER = 'requester'
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  department: string;
  password: string;
  requestedRole: UserRole;
  status: PendingUserStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export enum PendingUserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterFormData) => Promise<void>;
  pendingUsersCount: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  requestedRole: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthError {
  message: string;
  code: string;
} 
