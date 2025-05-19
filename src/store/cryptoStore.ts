import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { 
  DecryptionErrorType, 
  CryptoState, 
  KeyManager 
} from '../types/crypto';
import {
  encryptWithPublicKey,
  decryptWithPrivateKey,
  generateRSAKeyPair,
  exportPrivateKeyWithPassword,
  importPrivateKeyWithPassword
} from '../utils/cryptoUtils';

export { DecryptionErrorType } from '../types/crypto';

export const useCryptoStore = create<CryptoState>()(
  persist(
    (set, get) => ({
      keyManager: {
        publicKey: null,
        privateKey: null,
        exportedPublicKey: null
      },
      isGeneratingKeys: false,
      hasGeneratedKeys: false,
      error: null,
      errorType: null,
      
      generateKeys: async () => {
        set({ isGeneratingKeys: true, error: null, errorType: null });
        try {
          const { keyPair, publicKeyJwk } = await generateRSAKeyPair();
          
          // Store keys in state
          set({
            keyManager: {
              publicKey: publicKeyJwk,
              privateKey: keyPair.privateKey,
              exportedPublicKey: JSON.stringify(publicKeyJwk)
            },
            hasGeneratedKeys: true,
            isGeneratingKeys: false,
            error: null,
            errorType: null
          });
          
          toast("Clés générées avec succès", {
            description: "Vos clés de chiffrement ont été créées et sauvegardées."
          });
          
          return true;
        } catch (error) {
          console.error("Error generating keys:", error);
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération des clés.';
          set({
            isGeneratingKeys: false,
            error: errorMessage,
            errorType: DecryptionErrorType.UNKNOWN
          });
          
          toast.error("Erreur de génération de clés", {
            description: errorMessage
          });
          
          return false;
        }
      },
      
      regenerateKeys: async () => {
        set({ isGeneratingKeys: true, error: null, errorType: null });
        try {
          // Generate new RSA key pair
          const { keyPair, publicKeyJwk } = await generateRSAKeyPair();
          
          // Store new keys in state, replacing old ones
          set({
            keyManager: {
              publicKey: publicKeyJwk,
              privateKey: keyPair.privateKey,
              exportedPublicKey: JSON.stringify(publicKeyJwk)
            },
            hasGeneratedKeys: true,
            isGeneratingKeys: false,
            error: null,
            errorType: null
          });
          
          toast("Clés régénérées avec succès", {
            description: "Vos nouvelles clés de chiffrement ont été créées. Les mots de passe existants devront être re-chiffrés."
          });
          
          return true;
        } catch (error) {
          console.error("Error regenerating keys:", error);
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la régénération des clés.';
          set({
            isGeneratingKeys: false,
            error: errorMessage,
            errorType: DecryptionErrorType.UNKNOWN
          });
          
          toast.error("Erreur de régénération de clés", {
            description: errorMessage
          });
          
          return false;
        }
      },
      
      encryptData: async (data: string) => {
        const { keyManager } = get();
        if (!keyManager.publicKey) {
          const errorMessage = 'Aucune clé publique disponible.';
          set({ 
            error: errorMessage, 
            errorType: DecryptionErrorType.MISSING_KEY 
          });
          
          toast.error("Erreur de chiffrement", {
            description: errorMessage
          });
          
          return null;
        }
        
        return await encryptWithPublicKey(keyManager.publicKey, data);
      },
      
      decryptData: async (encryptedData: string) => {
        const { keyManager } = get();
        // Clear previous errors
        set({ error: null, errorType: null });
        
        if (!keyManager.privateKey) {
          const errorMessage = 'Aucune clé privée disponible.';
          set({ 
            error: errorMessage,
            errorType: DecryptionErrorType.MISSING_KEY
          });
          return null;
        }
        
        try {
          return await decryptWithPrivateKey(keyManager.privateKey, encryptedData);
        } catch (error: any) {
          set({ 
            error: error.message, 
            errorType: error.type || DecryptionErrorType.UNKNOWN
          });
          return null;
        }
      },
      
      exportPublicKey: async () => {
        const { keyManager } = get();
        return keyManager.exportedPublicKey;
      },
      
      exportPrivateKey: async (masterPassword: string) => {
        const { keyManager } = get();
        if (!keyManager.privateKey) {
          set({ 
            error: "Aucune clé privée à exporter", 
            errorType: DecryptionErrorType.MISSING_KEY
          });
          return null;
        }
        
        return await exportPrivateKeyWithPassword(keyManager.privateKey, masterPassword);
      },
      
      importPrivateKey: async (encodedKey: string, masterPassword: string) => {
        try {
          const privateKey = await importPrivateKeyWithPassword(encodedKey, masterPassword);
          
          if (privateKey) {
            // Update the key manager with the imported private key
            set(state => ({
              keyManager: {
                ...state.keyManager,
                privateKey
              },
              error: null,
              errorType: null
            }));
            
            return true;
          }
          return false;
        } catch (error: any) {
          set({ 
            error: error.message, 
            errorType: error.type || DecryptionErrorType.UNKNOWN
          });
          
          return false;
        }
      },
      
      validatePrivateKey: async () => {
        const { keyManager } = get();
        
        if (!keyManager.privateKey) {
          set({ 
            error: "Aucune clé privée à valider", 
            errorType: DecryptionErrorType.MISSING_KEY 
          });
          return false;
        }
        
        try {
          // Generate a small test message
          const testMessage = "test_validation_" + Date.now();
          
          // Encrypt with public key
          const encryptedTest = await get().encryptData(testMessage);
          if (!encryptedTest) return false;
          
          // Try to decrypt with private key
          const decryptedTest = await get().decryptData(encryptedTest);
          
          // Check if decryption was successful
          const isValid = decryptedTest === testMessage;
          
          if (isValid) {
            set({ error: null, errorType: null });
            return true;
          } else {
            set({ 
              error: "La clé privée est invalide", 
              errorType: DecryptionErrorType.CORRUPTED_DATA 
            });
            return false;
          }
        } catch (error) {
          console.error("Error validating key:", error);
          set({ 
            error: "Erreur lors de la validation de la clé", 
            errorType: DecryptionErrorType.UNKNOWN 
          });
          return false;
        }
      },
      
      reloadKeyFromStorage: async () => {
        // This method attempts to reload keys from storage
        // It's mostly useful when the in-memory private key is lost
        try {
          // The persist middleware should have reloaded the publicKey already
          // We just need to check if it's there
          const { keyManager } = get();
          
          if (!keyManager.publicKey) {
            set({ 
              error: "Aucune clé publique trouvée dans le stockage", 
              errorType: DecryptionErrorType.MISSING_KEY 
            });
            return false;
          }
          
          // Report success but note that private key still needs to be imported
          if (!keyManager.privateKey) {
            set({ 
              error: "La clé publique a été rechargée, mais la clé privée doit être importée", 
              errorType: DecryptionErrorType.MISSING_KEY 
            });
            
            toast("Clé publique rechargée", {
              description: "La clé privée doit être importée pour déchiffrer les données."
            });
            
            return false;
          }
          
          toast("Clés rechargées", {
            description: "Vos clés de chiffrement ont été rechargées avec succès."
          });
          
          return true;
        } catch (error) {
          console.error("Error reloading keys:", error);
          set({ 
            error: "Erreur lors du rechargement des clés", 
            errorType: DecryptionErrorType.UNKNOWN 
          });
          
          toast.error("Erreur de rechargement", {
            description: "Impossible de recharger vos clés de chiffrement."
          });
          
          return false;
        }
      },
      
      setError: (error, errorType = null) => set({ error, errorType })
    }),
    {
      name: 'crypto-storage',
      // Only persist the public key and hasGeneratedKeys flag
      partialize: (state) => ({ 
        keyManager: { 
          publicKey: state.keyManager.publicKey,
          exportedPublicKey: state.keyManager.exportedPublicKey,
          privateKey: null // Do not persist the private key in localStorage
        },
        hasGeneratedKeys: state.hasGeneratedKeys
      }),
      // This merge function ensures we don't lose the privateKey in memory when loading from storage
      merge: (persistedState: any, currentState: CryptoState) => {
        return {
          ...currentState,
          ...persistedState,
          keyManager: {
            ...(persistedState.keyManager || {}),
            privateKey: currentState.keyManager.privateKey // Keep the current privateKey in memory
          }
        };
      }
    }
  )
);
