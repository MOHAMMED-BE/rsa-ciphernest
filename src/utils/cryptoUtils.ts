import { toast } from 'sonner';
import { DecryptionErrorType } from '../types/crypto';

/**
 * Encrypts data using a public key
 */
export async function encryptWithPublicKey(
  publicKeyJwk: JsonWebKey,
  data: string
): Promise<string | null> {
  try {
    // Import the public key from JWK format
    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKeyJwk,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      false, // not extractable
      ["encrypt"] // usage
    );
    
    // Convert data to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      dataBuffer
    );
    
    // Convert encrypted data to base64
    const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
    const encryptedBase64 = btoa(String.fromCharCode.apply(null, encryptedArray));
    
    return encryptedBase64;
  } catch (error) {
    console.error("Error encrypting data:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chiffrement des données.';
    
    toast.error("Erreur de chiffrement", {
      description: errorMessage
    });
    
    return null;
  }
}

/**
 * Validates if a string is base64 encoded
 */
function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

/**
 * Decrypts data using a private key
 */
export async function decryptWithPrivateKey(
  privateKey: CryptoKey,
  encryptedData: string
): Promise<string | null> {
  try {
    // Validate input parameters
    if (!privateKey) {
      throw new Error("La clé privée n'est pas disponible");
    }
    
    if (!encryptedData) {
      throw new Error("Aucune donnée à déchiffrer");
    }
    
    // Validate base64 format
    if (!isValidBase64(encryptedData)) {
      throw new Error("Les données chiffrées ne sont pas au format valide");
    }
    
    // Convert base64 to ArrayBuffer
    const binaryString = atob(encryptedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Verify key algorithm and usage
    const keyAlgorithm = await window.crypto.subtle.exportKey("jwk", privateKey);
    if (keyAlgorithm.alg !== "RSA-OAEP-256") {
      throw new Error("La clé n'utilise pas l'algorithme attendu");
    }
    
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      bytes.buffer
    );
    
    // Convert decrypted data to string
    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedBuffer);
    
    return decryptedText;
  } catch (error) {
    console.error("Error decrypting data:", error);
    let errorMessage = '';
    let errorType = DecryptionErrorType.UNKNOWN;
    
    // Enhanced error type detection
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Analyze error message to determine type
      if (errorMessage.includes("La clé privée n'est pas disponible")) {
        errorType = DecryptionErrorType.MISSING_KEY;
        errorMessage = "La clé de déchiffrement n'est pas disponible. Veuillez recharger vos clés.";
      } else if (errorMessage.includes("format valide")) {
        errorType = DecryptionErrorType.CORRUPTED_DATA;
        errorMessage = "Le format des données chiffrées est invalide.";
      } else if (errorMessage.includes("algorithme")) {
        errorType = DecryptionErrorType.UNSUPPORTED_ALGORITHM;
        errorMessage = "L'algorithme de chiffrement n'est pas compatible.";
      } else if (errorMessage.includes("operation-specific")) {
        errorType = DecryptionErrorType.CORRUPTED_DATA;
        errorMessage = "Les données sont corrompues ou la clé est invalide.";
      } else if (errorMessage.includes("DataError") || 
                 errorMessage.includes("incorrect format") || 
                 errorMessage.includes("data length")) {
        errorType = DecryptionErrorType.CORRUPTED_DATA;
        errorMessage = "Les données chiffrées semblent corrompues.";
      }
    } else {
      errorMessage = 'Erreur lors du déchiffrement des données.';
    }
    
    toast.error("Erreur de déchiffrement", {
      description: errorMessage
    });
    
    throw { message: errorMessage, type: errorType };
  }
}

/**
 * Generate a new RSA key pair
 */
export async function generateRSAKeyPair(): Promise<{
  keyPair: CryptoKeyPair;
  publicKeyJwk: JsonWebKey;
}> {
  // Generate 2048 bit RSA key pair
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"] // usage
  );
  
  // Export public key to JWK format
  const publicKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );
  
  return { keyPair, publicKeyJwk };
}

/**
 * Export a private key with password protection
 */
export async function exportPrivateKeyWithPassword(
  privateKey: CryptoKey,
  masterPassword: string
): Promise<string | null> {
  try {
    // Export the private key to PKCS8 format first
    const privateKeyPkcs8 = await window.crypto.subtle.exportKey(
      "pkcs8",
      privateKey
    );
    
    // Derive an encryption key from the master password using PBKDF2
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(masterPassword),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    // Generate a random salt for PBKDF2
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    
    // Derive an AES key for encryption
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 600000, // Increased iterations for better security
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    
    // Generate a random IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the private key
    const encryptedPrivateKey = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      aesKey,
      privateKeyPkcs8
    );
    
    // Create a final object with all the necessary parts
    const exportData = {
      encryptedKey: Array.from(new Uint8Array(encryptedPrivateKey)),
      salt: Array.from(salt),
      iv: Array.from(iv),
      version: 2, // Updated version for PKCS8 format
      format: "pkcs8"
    };
    
    toast("Clé privée exportée", {
      description: "Votre clé privée a été exportée avec succès."
    });
    
    return JSON.stringify(exportData);
  } catch (error) {
    console.error("Error exporting private key:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Erreur lors de l'exportation de la clé privée.";
    
    toast.error("Erreur d'exportation", {
      description: errorMessage
    });
    
    return null;
  }
}

/**
 * Import a private key with password protection
 */
export async function importPrivateKeyWithPassword(
  encodedKey: string,
  masterPassword: string
): Promise<CryptoKey | null> {
  try {
    // Parse the imported key data
    const importData = JSON.parse(encodedKey);
    
    // Check the version and format
    if (importData.version !== 2 || importData.format !== "pkcs8") {
      toast.error("Format incompatible", {
        description: "La version ou le format de la clé importée n'est pas pris en charge."
      });
      return null;
    }
    
    // Convert arrays back to Uint8Arrays
    const encryptedKey = new Uint8Array(importData.encryptedKey);
    const salt = new Uint8Array(importData.salt);
    const iv = new Uint8Array(importData.iv);
    
    // Derive key from master password using PBKDF2
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(masterPassword),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    // Derive the same AES key used for encryption
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 600000,
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
    // Decrypt the private key
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv
      },
      aesKey,
      encryptedKey
    );
    
    // Import the private key from PKCS8 format
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      decryptedBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true, // Make sure it's extractable for future exports
      ["decrypt"]
    );
    
    toast("Clé importée avec succès", {
      description: "Votre clé privée a été importée et est prête à l'emploi."
    });
    
    return privateKey;
  } catch (error) {
    console.error("Error importing private key:", error);
    
    let errorMessage = '';
    let errorType = DecryptionErrorType.UNKNOWN;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      // Try to provide more specific error messages
      if (errorMessage.includes("decrypt")) {
        errorMessage = "Mot de passe incorrect ou clé corrompue.";
        errorType = DecryptionErrorType.CORRUPTED_DATA;
      } else if (errorMessage.includes("JSON")) {
        errorMessage = "Format de clé invalide.";
        errorType = DecryptionErrorType.CORRUPTED_DATA;
      }
    } else {
      errorMessage = "Erreur lors de l'importation de la clé privée.";
    }
    
    toast.error("Erreur d'importation", { 
      description: errorMessage
    });
    
    throw { message: errorMessage, type: errorType };
  }
}

/**
 * Validate an imported private key by testing encryption/decryption
 */
export async function validatePrivateKey(privateKey: CryptoKey): Promise<boolean> {
  try {
    // Export the public key
    const publicKey = await window.crypto.subtle.exportKey(
      "jwk",
      privateKey
    );
    
    // Test encryption/decryption
    const testMessage = "test_validation_" + Date.now();
    const encrypted = await encryptWithPublicKey(publicKey, testMessage);
    
    if (!encrypted) return false;
    
    const decrypted = await decryptWithPrivateKey(privateKey, encrypted);
    return decrypted === testMessage;
  } catch (error) {
    console.error("Error validating key:", error);
    return false;
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 12) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins 12 caractères"
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins une majuscule"
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins une minuscule"
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins un chiffre"
    };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins un caractère spécial"
    };
  }
  
  return { isValid: true };
}