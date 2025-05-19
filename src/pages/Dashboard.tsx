
import { useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePasswordStore } from "@/store/passwordStore";
import { useCryptoStore } from "@/store/cryptoStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Key, Lock, Plus, Shield, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { passwords, categories } = usePasswordStore();
  const { user } = useAuthStore();
  const { hasGeneratedKeys } = useCryptoStore();
  const navigate = useNavigate();

  // Statistiques de base
  const passwordsCount = passwords.length;
  const categoriesCount = categories.length;
  
  // Analyse de sécurité (simple simulation)
  const weakPasswords = Math.floor(Math.random() * 3); // Pour la démo
  const reusedPasswords = Math.floor(Math.random() * 2); // Pour la démo
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre coffre-fort de mots de passe sécurisé.
          </p>
        </div>

        {!hasGeneratedKeys && (
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Initialisation requise</AlertTitle>
            <AlertDescription>
              Vous devez générer vos clés de chiffrement pour commencer à utiliser l'application.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => navigate("/settings")}
              >
                Générer les clés
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de mots de passe
              </CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{passwordsCount}</div>
              <p className="text-xs text-muted-foreground">
                {passwordsCount > 0 
                  ? "Tous vos mots de passe sont chiffrés" 
                  : "Commencez à ajouter des mots de passe"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Catégories
              </CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoriesCount}</div>
              <p className="text-xs text-muted-foreground">
                Organisez vos mots de passe par catégories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                État de sécurité
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weakPasswords + reusedPasswords === 0 ? "Excellent" : "À améliorer"}
              </div>
              <p className="text-xs text-muted-foreground">
                {weakPasswords > 0 ? `${weakPasswords} mots de passe faibles` : "Aucun mot de passe faible"}
                {reusedPasswords > 0 ? `, ${reusedPasswords} mots de passe réutilisés` : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {passwordsCount === 0 && hasGeneratedKeys && (
          <Card className="bg-primary/5 border-dashed">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Lock className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">Commencez à sécuriser vos mots de passe</CardTitle>
              <CardDescription className="mb-4">
                Ajoutez votre premier mot de passe pour commencer à bâtir votre coffre-fort sécurisé.
              </CardDescription>
              <Button onClick={() => navigate("/add-password")}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter un mot de passe
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <h2 className="font-semibold text-xl mb-4">Actions rapides</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4" 
              onClick={() => navigate("/add-password")}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Nouveau mot de passe</span>
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  Ajouter un nouveau mot de passe
                </span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => navigate("/generate-password")}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  <span>Générer un mot de passe</span>
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  Créer un mot de passe fort et sécurisé
                </span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => navigate("/settings")}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Sécurité</span>
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  Gérer vos clés de chiffrement
                </span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => navigate("/profile")}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  Mettre à jour vos informations
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
