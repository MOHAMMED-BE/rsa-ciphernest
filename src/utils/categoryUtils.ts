
// Helper function to get category descriptions
export const getCategoryDescription = (categoryName: string): string => {
  const descriptions: Record<string, string> = {
    "Email": "Gérez vos mots de passe email en toute sécurité",
    "Banque": "Sécurisez l'accès à vos comptes bancaires",
    "Réseaux sociaux": "Protégez vos comptes sur les réseaux sociaux",
    "Sites web": "Gérez vos identifiants pour différents sites web",
    "Applications": "Stockez les mots de passe de vos applications",
    "Autres": "Gérez vos mots de passe de manière sécurisée"
  };
  
  return descriptions[categoryName] || "Gérez vos mots de passe en toute sécurité";
};

// Helper function to evaluate password strength
export const evaluatePasswordStrength = (password: string): { strength: string; color: string } => {
  const length = password.length;
  
  if (length >= 12) {
    return { strength: "Fort", color: "bg-green-500" };
  } else if (length >= 8) {
    return { strength: "Moyen", color: "bg-yellow-500" };
  } else {
    return { strength: "Faible", color: "bg-red-500" };
  }
};
