
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PasswordEntry, Category } from '../types';

interface PasswordState {
  passwords: PasswordEntry[];
  categories: Category[];
  isLoading: boolean;
  currentCategory: number | null;
  error: string | null;
  
  setPasswords: (passwords: PasswordEntry[]) => void;
  addPassword: (password: PasswordEntry) => void;
  updatePassword: (id: number, password: Partial<PasswordEntry>) => void;
  deletePassword: (id: number) => void;
  
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  setCurrentCategory: (categoryId: number | null) => void;
  
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

// Catégories par défaut
const defaultCategories: Category[] = [
  { id: 1, name: 'Email', icon: 'mail' },
  { id: 2, name: 'Banque', icon: 'credit-card' },
  { id: 3, name: 'Réseaux sociaux', icon: 'share' },
  { id: 4, name: 'Sites web', icon: 'globe' },
  { id: 5, name: 'Applications', icon: 'smartphone' },
  { id: 6, name: 'Autres', icon: 'folder' }
];

export const usePasswordStore = create<PasswordState>()(
  persist(
    (set, get) => ({
      passwords: [],
      categories: defaultCategories,
      isLoading: false,
      currentCategory: null,
      error: null,
      
      setPasswords: (passwords) => set({ passwords }),
      addPassword: (password) => {
        const { passwords } = get();
        set({ passwords: [...passwords, password] });
      },
      updatePassword: (id, updatedPassword) => {
        const { passwords } = get();
        const updatedPasswords = passwords.map(password => 
          password.id === id ? { ...password, ...updatedPassword } : password
        );
        set({ passwords: updatedPasswords });
      },
      deletePassword: (id) => {
        const { passwords } = get();
        set({ passwords: passwords.filter(password => password.id !== id) });
      },
      
      setCategories: (categories) => set({ categories }),
      addCategory: (category) => {
        const { categories } = get();
        set({ categories: [...categories, category] });
      },
      updateCategory: (id, updatedCategory) => {
        const { categories } = get();
        const updatedCategories = categories.map(category => 
          category.id === id ? { ...category, ...updatedCategory } : category
        );
        set({ categories: updatedCategories });
      },
      deleteCategory: (id) => {
        const { categories } = get();
        set({ categories: categories.filter(category => category.id !== id) });
      },
      setCurrentCategory: (categoryId) => set({ currentCategory: categoryId }),
      
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'password-storage',
      partialize: (state) => ({ 
        categories: state.categories,
        currentCategory: state.currentCategory,
        // Note: passwords are stored encrypted, so it's safe to persist them
        passwords: state.passwords 
      }),
    }
  )
);
