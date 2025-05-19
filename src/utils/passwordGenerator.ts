
/**
 * Génère un mot de passe aléatoire basé sur les critères spécifiés
 */
export const generatePassword = (
  length: number = 16,
  options: {
    includeLowercase?: boolean;
    includeUppercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {}
): string => {
  const {
    includeLowercase = true,
    includeUppercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  // Définir les jeux de caractères
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Construire le jeu de caractères complet
  let charset = "";
  if (includeLowercase) charset += lowercaseChars;
  if (includeUppercase) charset += uppercaseChars;
  if (includeNumbers) charset += numberChars;
  if (includeSymbols) charset += symbolChars;

  // Vérifier qu'au moins un jeu de caractères est sélectionné
  if (charset.length === 0) {
    throw new Error("Au moins un jeu de caractères doit être sélectionné");
  }

  // Générer le mot de passe
  let password = "";
  const charsetLength = charset.length;

  // Utiliser la Web Crypto API pour générer des nombres aléatoires sécurisés
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    password += charset.charAt(randomValues[i] % charsetLength);
  }

  return password;
};

/**
 * Évalue la force d'un mot de passe sur une échelle de 0 à 100
 */
export const evaluatePasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  if (!password) {
    return {
      score: 0,
      label: "Aucun",
      color: "bg-gray-300",
    };
  }

  let score = 0;
  const length = password.length;

  // Longueur (max 40 points)
  score += Math.min(length * 2, 40);

  // Complexité (max 60 points)
  if (/[a-z]/.test(password)) score += 10; // Minuscules
  if (/[A-Z]/.test(password)) score += 15; // Majuscules
  if (/[0-9]/.test(password)) score += 10; // Chiffres
  if (/[^a-zA-Z0-9]/.test(password)) score += 15; // Symboles

  // Variété (max 10 points)
  const uniqueChars = new Set(password).size;
  score += Math.min((uniqueChars / length) * 10, 10);

  // Patterns communs (pénalités)
  if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Lettres uniquement
  if (/^[0-9]+$/.test(password)) score -= 15; // Chiffres uniquement
  if (/(.)\1{2,}/.test(password)) score -= 5; // Répétitions de caractères

  // Clamp score to 0-100 range
  score = Math.max(0, Math.min(100, score));

  // Déterminer le label et la couleur
  let label: string;
  let color: string;

  if (score >= 80) {
    label = "Très fort";
    color = "bg-green-500";
  } else if (score >= 60) {
    label = "Fort";
    color = "bg-blue-500";
  } else if (score >= 40) {
    label = "Moyen";
    color = "bg-yellow-500";
  } else if (score >= 20) {
    label = "Faible";
    color = "bg-orange-500";
  } else {
    label = "Très faible";
    color = "bg-red-500";
  }

  return {
    score,
    label,
    color,
  };
};
