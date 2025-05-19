
// Types pour notre application
import { KeyManager } from './crypto';

// Type pour les données utilisateur
export interface User {
  id: number;
  email: string;
  createdAt: string;
  hasGeneratedKeys: boolean;
}

// Type pour les informations d'authentification
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Functions for authentication
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Type pour les catégories de mots de passe
export interface Category {
  id: number;
  name: string;
  icon?: string;
}

// Type pour un enregistrement de mot de passe
export interface PasswordEntry {
  id: number;
  title: string;
  username: string;
  password: string; // Encrypted password
  url?: string;
  notes?: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

// Type pour les données RSA
export interface RSAKeys {
  publicKey: string;
  privateKey?: string; // Ne sera jamais envoyé au serveur
}

// Re-export the KeyManager type from crypto
export type { KeyManager };
