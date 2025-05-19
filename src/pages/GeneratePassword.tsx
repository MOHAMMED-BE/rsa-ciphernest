
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GeneratePassword() {
  const [password, setPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const { toast } = useToast();
  
  // Fonction pour générer un mot de passe fort
  const generatePassword = () => {
    let charset = "";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+{}[]|:;<>,.?/~`";
    
    if (charset === "") {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner au moins un type de caractère.",
      });
      return;
    }
    
    let generatedPassword = "";
    const charsetLength = charset.length;
    
    // Utiliser Crypto API pour générer des nombres aléatoires sécurisés
    const randomValues = new Uint32Array(passwordLength);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < passwordLength; i++) {
      generatedPassword += charset.charAt(randomValues[i] % charsetLength);
    }
    
    setPassword(generatedPassword);
  };
  
  // Générer un mot de passe dès le chargement de la page
  useState(() => {
    generatePassword();
  });
  
  // Fonction pour copier le mot de passe dans le presse-papier
  const copyToClipboard = () => {
    navigator.clipboard.writeText(password).then(
      () => {
        toast({
          title: "Copié !",
          description: "Le mot de passe a été copié dans le presse-papier.",
        });
      },
      (err) => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de copier le mot de passe.",
        });
        console.error("Erreur lors de la copie : ", err);
      }
    );
  };
  
  // Calculer la force du mot de passe
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: "Aucun" };
    
    let strength = 0;
    
    // Longueur
    strength += Math.min(password.length / 2, 4);
    
    // Complexité
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    // Normaliser à 100%
    const normalizedStrength = Math.min(Math.round(strength * 10), 100);
    
    // Déterminer le label
    let label = "Faible";
    if (normalizedStrength >= 80) label = "Très fort";
    else if (normalizedStrength >= 60) label = "Fort";
    else if (normalizedStrength >= 40) label = "Moyen";
    
    return {
      strength: normalizedStrength,
      label
    };
  };
  
  const passwordStrength = getPasswordStrength();
  const getStrengthColor = () => {
    const strength = passwordStrength.strength;
    if (strength >= 80) return "bg-green-500";
    if (strength >= 60) return "bg-blue-500";
    if (strength >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Générateur de mot de passe</h1>
          <p className="text-muted-foreground">
            Créez des mots de passe forts et sécurisés selon vos critères.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Votre mot de passe généré</CardTitle>
            <CardDescription>
              Ce mot de passe a été généré de manière aléatoire et sécurisée.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-md border border-input bg-background px-3 py-4 text-center shadow-sm">
              <div className="text-xl font-mono break-all">{password}</div>
              <div className="absolute right-3 top-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={generatePassword}
                  title="Générer un nouveau mot de passe"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  title="Copier le mot de passe"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Force: {passwordStrength.label}</span>
                <span>{passwordStrength.strength}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${getStrengthColor()}`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
            </div>
            
            <Alert>
              <AlertDescription className="text-sm">
                Ce mot de passe est généré localement et n'est jamais envoyé à un serveur.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Longueur: {passwordLength} caractères</Label>
                </div>
                <Slider
                  value={[passwordLength]}
                  min={8}
                  max={32}
                  step={1}
                  onValueChange={(value) => setPasswordLength(value[0])}
                  className="my-4"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="uppercase">Majuscules (A-Z)</Label>
                  <Switch
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={setIncludeUppercase}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowercase">Minuscules (a-z)</Label>
                  <Switch
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={setIncludeLowercase}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="numbers">Chiffres (0-9)</Label>
                  <Switch
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="symbols">Symboles (!@#$%...)</Label>
                  <Switch
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={setIncludeSymbols}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={generatePassword}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Générer un nouveau mot de passe
                </Button>
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="w-full"
                >
                  <Copy className="mr-2 h-4 w-4" /> Copier le mot de passe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
