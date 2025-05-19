
// Error types for more specific error handling
export enum DecryptionErrorType {
  MISSING_KEY = 'MISSING_KEY',
  CORRUPTED_DATA = 'CORRUPTED_DATA',
  UNSUPPORTED_ALGORITHM = 'UNSUPPORTED_ALGORITHM',
  UNKNOWN = 'UNKNOWN'
}

// Interface for the key management system
export interface KeyManager {
  publicKey: JsonWebKey | null;
  privateKey: CryptoKey | null;
  exportedPublicKey: string | null;
}

// Interface for the crypto store state
export interface CryptoState {
  keyManager: KeyManager;
  isGeneratingKeys: boolean;
  hasGeneratedKeys: boolean;
  error: string | null;
  errorType: DecryptionErrorType | null;
  
  generateKeys: () => Promise<boolean>;
  regenerateKeys: () => Promise<boolean>; // Add new function to regenerate keys
  encryptData: (data: string) => Promise<string | null>;
  decryptData: (encryptedData: string) => Promise<string | null>;
  exportPublicKey: () => Promise<string | null>;
  exportPrivateKey: (masterPassword: string) => Promise<string | null>;
  importPrivateKey: (encodedKey: string, masterPassword: string) => Promise<boolean>;
  validatePrivateKey: () => Promise<boolean>;
  reloadKeyFromStorage: () => Promise<boolean>;
  setError: (error: string | null, errorType?: DecryptionErrorType | null) => void;
}
