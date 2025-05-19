import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCryptoStore, DecryptionErrorType } from "@/store/cryptoStore";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Key, Lock, RefreshCw, Shield, Download, Upload, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { toast } = useToast();
  const { 
    generateKeys, 
    regenerateKeys, 
    hasGeneratedKeys, 
    isGeneratingKeys, 
    keyManager,
    exportPublicKey,
    exportPrivateKey,
    importPrivateKey,
    validatePrivateKey,
    reloadKeyFromStorage,
    error,
    errorType
  } = useCryptoStore();
  
  const [showDialog, setShowDialog] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmMasterPassword, setConfirmMasterPassword] = useState("");
  const [importKey, setImportKey] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Fonction pour gérer la génération de nouvelles clés
  const handleGenerateKeys = async () => {
    try {
      const success = await generateKeys();
      
      if (success) {
        toast({
          title: "Clés générées avec succès",
          description: "Vos nouvelles clés RSA ont été générées et sont stockées en sécurité sur votre appareil.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la génération des clés.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
      });
    }
  };
  
  // Fonction pour afficher la clé publique
  const handleShowPublicKey = async () => {
    const exportedKey = await exportPublicKey();
    if (exportedKey) {
      setPublicKey(exportedKey);
      setShowDialog(true);
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'exporter la clé publique.",
      });
    }
  };
  
  // Fonction pour exporter la clé privée
  const handleExportPrivateKey = async () => {
    setPasswordError("");
    
    // Validation des mots de passe
    if (!masterPassword) {
      setPasswordError("Le mot de passe est requis.");
      return;
    }
    
    if (masterPassword !== confirmMasterPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    
    if (masterPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    
    try {
      const exportedKey = await exportPrivateKey(masterPassword);
      
      if (exportedKey) {
        // Préparer le téléchargement
        const blob = new Blob([exportedKey], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ciphernest-private-key-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Need to wait a moment before cleaning up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        // Reset le formulaire et fermer la boîte de dialogue
        setMasterPassword("");
        setConfirmMasterPassword("");
        setShowExportDialog(false);
        
        toast({
          title: "Clé privée exportée",
          description: "Votre clé privée a été exportée et téléchargée. Conservez-la en lieu sûr.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation de la clé.",
      });
    }
  };
  
  // Fonction pour importer la clé privée
  const handleImportPrivateKey = async () => {
    setPasswordError("");
    
    if (!masterPassword) {
      setPasswordError("Le mot de passe est requis.");
      return;
    }
    
    if (!importKey) {
      setPasswordError("Veuillez coller la clé privée ou sélectionner un fichier.");
      return;
    }
    
    try {
      const success = await importPrivateKey(importKey, masterPassword);
      
      if (success) {
        // Valider la clé importée
        const isValid = await validatePrivateKey();
        
        if (isValid) {
          // Reset le formulaire et fermer la boîte de dialogue
          setMasterPassword("");
          setImportKey("");
          setShowImportDialog(false);
          
          toast({
            title: "Clé privée importée",
            description: "Votre clé privée a été importée avec succès et fonctionne correctement.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Clé invalide",
            description: "La clé privée a été importée mais ne fonctionne pas correctement.",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'importation de la clé.",
      });
    }
  };
  
  // Fonction pour recharger les clés depuis le stockage
  const handleReloadKeys = async () => {
    const success = await reloadKeyFromStorage();
    
    if (success) {
      toast({
        title: "Clés rechargées",
        description: "Vos clés ont été rechargées avec succès depuis le stockage.",
      });
    } else {
      if (errorType === DecryptionErrorType.MISSING_KEY) {
        toast({
          variant: "destructive",
          title: "Clé privée manquante",
          description: "La clé publique a été rechargée, mais vous devez importer votre clé privée.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de rechargement",
          description: error || "Une erreur est survenue lors du rechargement des clés.",
        });
      }
    }
  };
  
  // Fonction pour importer une clé depuis un fichier
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportKey(content);
    };
    reader.readAsText(file);
  };
  
  // Fonction pour régénérer les clés
  const handleRegenerateKeys = async () => {
    setIsRegenerating(true);
    try {
      const success = await regenerateKeys();
      setIsRegenerating(false);
      setShowRegenerateDialog(false);
      
      if (success) {
        toast({
          title: "Clés régénérées avec succès",
          description: "Vos nouvelles clés RSA ont été générées. Attention: les données déjà chiffrées avec vos anciennes clés ne pourront plus être déchiffrées. Une sauvegarde est recommandée avant cette opération.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la régénération des clés.",
        });
      }
    } catch (error) {
      console.error(error);
      setIsRegenerating(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos paramètres de sécurité et vos clés de chiffrement.
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Clés de chiffrement RSA
              </CardTitle>
              <CardDescription>
                Ces clés sont utilisées pour chiffrer et déchiffrer vos mots de passe. La clé privée n'est jamais partagée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorType === DecryptionErrorType.MISSING_KEY && (
                <Alert variant="destructive">
                  <AlertTitle>Clé de déchiffrement manquante</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>La clé privée nécessaire au déchiffrement n'est pas disponible.</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowImportDialog(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Importer la clé privée
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {errorType === DecryptionErrorType.CORRUPTED_DATA && (
                <Alert variant="destructive">
                  <AlertTitle>Données corrompues</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>Les données chiffrées semblent être corrompues ou incompatibles avec la clé actuelle.</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleReloadKeys}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Recharger la clé de chiffrement
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowImportDialog(true)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Importer une autre clé
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {errorType === DecryptionErrorType.UNSUPPORTED_ALGORITHM && (
                <Alert variant="destructive">
                  <AlertTitle>Algorithme non pris en charge</AlertTitle>
                  <AlertDescription>
                    L'algorithme de chiffrement n'est pas compatible avec cette version de l'application.
                  </AlertDescription>
                </Alert>
              )}
              
              {hasGeneratedKeys ? (
                <>
                  {!error && (
                    <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900">
                      <Lock className="h-4 w-4" />
                      <AlertTitle>Clés RSA générées</AlertTitle>
                      <AlertDescription>
                        Vos clés de chiffrement RSA ont été générées et sont stockées en sécurité sur votre appareil.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={handleShowPublicKey}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Afficher la clé publique
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setShowExportDialog(true)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exporter la clé privée (sauvegarde)
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setShowImportDialog(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Importer la clé privée
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={handleReloadKeys}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recharger la clé de chiffrement
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-950"
                      onClick={() => setShowRegenerateDialog(true)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Régénérer les clés (Avancé)
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="rounded-md bg-secondary/50 p-4">
                    <h4 className="font-medium mb-2">Informations sur la sécurité</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Les clés utilisent un chiffrement RSA 2048 bits</li>
                      <li>La clé privée ne quitte jamais votre navigateur</li>
                      <li>Seuls vos mots de passe chiffrés sont stockés sur le serveur</li>
                      <li>Le déchiffrement se fait uniquement sur votre appareil</li>
                      <li>Exportez votre clé privée et conservez-la en lieu sûr</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <Alert variant="destructive">
                    <AlertTitle>Clés manquantes</AlertTitle>
                    <AlertDescription>
                      Vous devez générer vos clés RSA pour commencer à utiliser l'application.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleGenerateKeys}
                    disabled={isGeneratingKeys}
                    className="w-full"
                  >
                    {isGeneratingKeys ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Générer des clés RSA
                      </>
                    )}
                  </Button>
                  
                  <div className="rounded-md bg-secondary/50 p-4">
                    <h4 className="font-medium mb-2">Pourquoi c'est important</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Les clés RSA permettent de chiffrer vos mots de passe avant qu'ils ne soient stockés</li>
                      <li>Sans ces clés, vous ne pouvez pas sécuriser ou accéder à vos mots de passe</li>
                      <li>Ce processus ne prend que quelques secondes</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="">
            <CardHeader>
              <CardTitle>Options de synchronisation</CardTitle>
              <CardDescription>
                Gérez la façon dont vos données sont synchronisées entre vos appareils.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Fonctionnalité à venir</AlertTitle>
                <AlertDescription>
                  La synchronisation multi-appareils sera disponible dans une future mise à jour.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogue pour afficher la clé publique */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Votre clé publique RSA</DialogTitle>
            <DialogDescription>
              Cette clé peut être partagée en toute sécurité. Elle permet de chiffrer des données que seule votre clé privée pourra déchiffrer.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/50 p-3 rounded-md overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {publicKey}
            </pre>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(publicKey);
                toast({
                  title: "Copié !",
                  description: "La clé publique a été copiée dans votre presse-papier.",
                });
              }}
            >
              Copier
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue pour exporter la clé privée */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter la clé privée</DialogTitle>
            <DialogDescription>
              Protégez votre clé privée avec un mot de passe fort. Cette clé vous permettra de déchiffrer vos données sur un autre appareil.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="master-password" className="text-sm font-medium">
                Mot de passe de protection
              </label>
              <Input
                id="master-password"
                type="password"
                placeholder="Entrez un mot de passe fort"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Le mot de passe doit contenir au moins 8 caractères.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirmez le mot de passe"
                value={confirmMasterPassword}
                onChange={(e) => setConfirmMasterPassword(e.target.value)}
              />
            </div>
            
            {passwordError && (
              <div className="text-sm font-medium text-destructive">
                {passwordError}
              </div>
            )}
            
            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Conservez ce fichier et ce mot de passe en lieu sûr. Sans cette clé, vous ne pourrez pas récupérer vos mots de passe chiffrés.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowExportDialog(false);
              setMasterPassword("");
              setConfirmMasterPassword("");
              setPasswordError("");
            }}>
              Annuler
            </Button>
            <Button onClick={handleExportPrivateKey}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger la clé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue pour importer la clé privée */}
      <Dialog open={showImportDialog} onOpenChange={(open) => {
        setShowImportDialog(open);
        if (!open) {
          setMasterPassword("");
          setImportKey("");
          setPasswordError("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer la clé privée</DialogTitle>
            <DialogDescription>
              Importez votre clé privée pour déchiffrer vos mots de passe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="import-file" className="text-sm font-medium">
                Fichier de clé privée
              </label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileImport}
              />
              <p className="text-xs text-muted-foreground">
                Ou collez le contenu ci-dessous
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="import-key" className="text-sm font-medium">
                Contenu de la clé privée
              </label>
              <Textarea
                id="import-key"
                placeholder='{"encryptedKey": [...], "salt": [...], ...}'
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                className="min-h-[100px] font-mono text-xs"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="import-password" className="text-sm font-medium">
                Mot de passe de protection
              </label>
              <Input
                id="import-password"
                type="password"
                placeholder="Entrez le mot de passe de la clé"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
              />
            </div>
            
            {passwordError && (
              <div className="text-sm font-medium text-destructive">
                {passwordError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowImportDialog(false);
              setMasterPassword("");
              setImportKey("");
              setPasswordError("");
            }}>
              Annuler
            </Button>
            <Button onClick={handleImportPrivateKey}>
              <Upload className="mr-2 h-4 w-4" />
              Importer la clé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* NEW: Alert dialog for confirming key regeneration */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer vos clés de chiffrement</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>
                  <strong>Attention:</strong> Cette action est irréversible et créera un nouveau jeu de clés de chiffrement.
                </p>
                <p>
                  Toutes les données chiffrées avec vos anciennes clés ne pourront plus être déchiffrées après cette opération.
                </p>
                <Alert variant="destructive">
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Avant de continuer, assurez-vous de:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Exporter votre clé privée actuelle</li>
                      <li>Sauvegarder vos mots de passe en clair si nécessaire</li>
                      <li>Comprendre que cette action ne peut pas être annulée</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRegenerating}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleRegenerateKeys();
              }}
              disabled={isRegenerating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Régénération...
                </>
              ) : (
                "Confirmer la régénération"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
