
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePasswordStore } from "@/store/passwordStore";
import { useCryptoStore } from "@/store/cryptoStore";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Copy, MoreHorizontal, Plus, Trash, Edit, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PasswordList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [revealedPasswords, setRevealedPasswords] = useState<{[key: number]: string}>({});
  const { passwords, categories, deletePassword } = usePasswordStore();
  const { decryptData } = useCryptoStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fonction pour afficher le mot de passe
  const togglePasswordVisibility = async (passwordId: number, encryptedPassword: string) => {
    if (revealedPasswords[passwordId]) {
      // Cacher le mot de passe
      const newRevealedPasswords = {...revealedPasswords};
      delete newRevealedPasswords[passwordId];
      setRevealedPasswords(newRevealedPasswords);
      return;
    }
    
    try {
      const decryptedPassword = await decryptData(encryptedPassword);
      
      if (decryptedPassword) {
        // Afficher le mot de passe déchiffré
        setRevealedPasswords({...revealedPasswords, [passwordId]: decryptedPassword});
        
        // Cacher automatiquement après 30 secondes pour des raisons de sécurité
        setTimeout(() => {
          setRevealedPasswords((prev) => {
            const newState = {...prev};
            delete newState[passwordId];
            return newState;
          });
        }, 30000);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de déchiffrement",
          description: "Impossible de déchiffrer ce mot de passe.",
        });
      }
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du déchiffrement du mot de passe.",
      });
    }
  };
  
  // Fonction pour copier le mot de passe
  const copyPassword = async (encryptedPassword: string) => {
    try {
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
          description: "Impossible de déchiffrer ce mot de passe pour le copier.",
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
  
  // Filtrer les mots de passe selon le terme de recherche
  const filteredPasswords = passwords.filter(
    (password) => 
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (password.url && password.url.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Obtenir le nom de la catégorie
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Non catégorisé";
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mots de passe</h1>
            <p className="text-muted-foreground">
              Gérez tous vos mots de passe stockés en toute sécurité.
            </p>
          </div>
          <Button onClick={() => navigate("/add-password")}>
            <Plus size={16} className="mr-2" />
            Nouveau mot de passe
          </Button>
        </div>
        
        <div className="flex w-full items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un mot de passe..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {passwords.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucun mot de passe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vous n'avez pas encore ajouté de mot de passe. Cliquez sur "Nouveau mot de passe" pour commencer.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/add-password")}
              >
                <Plus size={16} className="mr-2" />
                Ajouter un mot de passe
              </Button>
            </CardContent>
          </Card>
        ) : filteredPasswords.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Aucun résultat trouvé pour "{searchTerm}".
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Nom d'utilisateur</TableHead>
                  <TableHead>Mot de passe</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPasswords.map((password) => (
                  <TableRow key={password.id}>
                    <TableCell className="font-medium">{password.title}</TableCell>
                    <TableCell>{password.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">
                          {revealedPasswords[password.id] 
                            ? revealedPasswords[password.id]
                            : "••••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePasswordVisibility(password.id, password.password)}
                        >
                          {revealedPasswords[password.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyPassword(password.password)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(password.categoryId)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/edit-password/${password.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              deletePassword(password.id);
                              toast({
                                title: "Supprimé",
                                description: "Le mot de passe a été supprimé avec succès.",
                              });
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
