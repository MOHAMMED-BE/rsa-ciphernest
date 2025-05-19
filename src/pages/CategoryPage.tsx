import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePasswordStore } from "@/store/passwordStore";
import { useCryptoStore, DecryptionErrorType } from "@/store/cryptoStore";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layouts/MainLayout";

// Imported components
import { CategoryHeader } from "@/components/categories/CategoryHeader";
import { CategorySearch } from "@/components/categories/CategorySearch";
import { DecryptionAlert } from "@/components/categories/DecryptionAlert";
import { EmptyState } from "@/components/categories/EmptyState";
import { PasswordCard } from "@/components/categories/PasswordCard";

// Utilities
import { getCategoryDescription, evaluatePasswordStrength } from "@/utils/categoryUtils";

export default function CategoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [revealedPasswords, setRevealedPasswords] = useState<{[key: number]: string}>({});
  const [passwordStrengths, setPasswordStrengths] = useState<{[key: number]: { strength: string; color: string }}>({});
  const [decryptionError, setDecryptionError] = useState<{ id: number | null, message: string | null }>({ id: null, message: null });
  
  const { categoryId } = useParams<{ categoryId: string }>();
  const { toast } = useToast();
  
  const { passwords, categories } = usePasswordStore();
  const { decryptData, error, errorType, reloadKeyFromStorage } = useCryptoStore();
  
  // Get the category name
  const category = categories.find(cat => cat.id === Number(categoryId));
  const categoryName = category ? category.name : "Catégorie inconnue";
  const categoryDescription = getCategoryDescription(categoryName);
  
  // Filter passwords by the current category and search term
  const filteredPasswords = useMemo(() => {
    return passwords.filter(
      (password) => 
        password.categoryId === Number(categoryId) &&
        (password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (password.url && password.url.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [passwords, categoryId, searchTerm]);
  
  // Function to toggle password visibility
  const togglePasswordVisibility = async (passwordId: number, encryptedPassword: string) => {
    if (revealedPasswords[passwordId]) {
      // Hide password
      const newRevealedPasswords = {...revealedPasswords};
      delete newRevealedPasswords[passwordId];
      setRevealedPasswords(newRevealedPasswords);
      return;
    }
    
    try {
      // Clear any previous error
      setDecryptionError({ id: null, message: null });
      
      const decryptedPassword = await decryptData(encryptedPassword);
      
      if (decryptedPassword) {
        // Show decrypted password
        setRevealedPasswords({...revealedPasswords, [passwordId]: decryptedPassword});
        
        // Auto-hide after 30 seconds for security
        setTimeout(() => {
          setRevealedPasswords((prev) => {
            const newState = {...prev};
            delete newState[passwordId];
            return newState;
          });
        }, 30000);
        
        toast({
          title: "Mot de passe affiché",
          description: "Le mot de passe sera caché automatiquement après 30 secondes.",
        });
      } else {
        setDecryptionError({ 
          id: passwordId, 
          message: error || "Impossible de déchiffrer ce mot de passe." 
        });
        
        toast({
          variant: "destructive",
          title: "Erreur de déchiffrement",
          description: error || "Impossible de déchiffrer ce mot de passe.",
        });
      }
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      setDecryptionError({ 
        id: passwordId, 
        message: error instanceof Error ? error.message : "Une erreur est survenue lors du déchiffrement." 
      });
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du déchiffrement du mot de passe.",
      });
    }
  };
  
  // Function to copy password
  const copyPassword = async (encryptedPassword: string) => {
    try {
      // Clear any previous error
      setDecryptionError({ id: null, message: null });
      
      const decryptedPassword = await decryptData(encryptedPassword);
      
      if (decryptedPassword) {
        await navigator.clipboard.writeText(decryptedPassword);
        toast({
          title: "Copié !",
          description: "Le mot de passe a été copié dans le presse-papier.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de déchiffrement",
          description: error || "Impossible de déchiffrer ce mot de passe pour le copier.",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la copie du mot de passe.",
      });
    }
  };
  
  // Handle key reload
  const handleReloadKey = async () => {
    const success = await reloadKeyFromStorage();
    
    if (success) {
      // Clear any decryption error
      setDecryptionError({ id: null, message: null });
      
      toast({
        title: "Clés rechargées",
        description: "Vos clés ont été rechargées avec succès.",
      });
      
      // Recalculate password strengths with the new key
      await calculatePasswordStrengths();
    } else {
      toast({
        variant: "destructive",
        title: "Échec du rechargement",
        description: error || "Impossible de recharger les clés.",
      });
    }
  };
  
  // Calculate password strengths
  const calculatePasswordStrengths = async () => {
    const strengthsObj: {[key: number]: { strength: string; color: string }} = {};
    
    for (const password of filteredPasswords) {
      try {
        const decryptedPassword = await decryptData(password.password);
        if (decryptedPassword) {
          strengthsObj[password.id] = evaluatePasswordStrength(decryptedPassword);
        } else {
          strengthsObj[password.id] = { strength: "Inconnu", color: "bg-gray-400" };
        }
      } catch (error) {
        console.error('Erreur lors de l\'évaluation de la force du mot de passe:', error);
        strengthsObj[password.id] = { strength: "Erreur", color: "bg-gray-400" };
      }
    }
    
    setPasswordStrengths(strengthsObj);
  };
  
  // Calculate password strengths on component mount and when filteredPasswords change
  useEffect(() => {
    calculatePasswordStrengths();
  }, [filteredPasswords]);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <CategoryHeader 
          categoryName={categoryName} 
          categoryDescription={categoryDescription} 
          categoryId={categoryId || ""} 
        />
        
        <DecryptionAlert errorType={errorType} handleReloadKey={handleReloadKey} />
        
        <CategorySearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        {filteredPasswords.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPasswords.map((password) => (
              <PasswordCard
                key={password.id}
                password={password}
                decryptData={decryptData}
                decryptionError={decryptionError}
                revealedPasswords={revealedPasswords}
                togglePasswordVisibility={togglePasswordVisibility}
                copyPassword={copyPassword}
                passwordStrength={passwordStrengths[password.id]}
                handleReloadKey={handleReloadKey}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}