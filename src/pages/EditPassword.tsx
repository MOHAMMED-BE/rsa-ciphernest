
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePasswordStore } from "@/store/passwordStore";
import { useCryptoStore } from "@/store/cryptoStore";
import { Eye, EyeOff, Key, Save } from "lucide-react";
import { generatePassword } from "@/utils/passwordGenerator";

const passwordSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
  url: z.string().optional(),
  notes: z.string().optional(),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
});

type PasswordValues = z.infer<typeof passwordSchema>;

export default function EditPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [decryptedPassword, setDecryptedPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const { passwords, categories, updatePassword } = usePasswordStore();
  const { encryptData, decryptData } = useCryptoStore();
  
  const passwordId = parseInt(id || "0");
  
  // Trouver le mot de passe à éditer
  const passwordToEdit = passwords.find(p => p.id === passwordId);
  
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      title: "",
      username: "",
      password: "",
      url: "",
      notes: "",
      categoryId: "",
    },
  });
  
  useEffect(() => {
    // Si le mot de passe n'existe pas, rediriger vers la liste
    if (!passwordToEdit) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe demandé n'existe pas.",
      });
      navigate("/passwords");
      return;
    }
    
    // Déchiffrer le mot de passe
    const fetchPassword = async () => {
      try {
        const decrypted = await decryptData(passwordToEdit.password);
        
        if (decrypted) {
          setDecryptedPassword(decrypted);
          
          // Initialiser le formulaire avec les valeurs du mot de passe
          form.reset({
            title: passwordToEdit.title,
            username: passwordToEdit.username,
            password: decrypted,
            url: passwordToEdit.url || "",
            notes: passwordToEdit.notes || "",
            categoryId: passwordToEdit.categoryId.toString(),
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erreur de déchiffrement",
            description: "Impossible de déchiffrer le mot de passe.",
          });
        }
      } catch (error) {
        console.error("Erreur lors du déchiffrement:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors du déchiffrement du mot de passe.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPassword();
  }, [passwordToEdit, decryptData, form, toast, navigate]);
  
  const onSubmit = async (data: PasswordValues) => {
    try {
      // Ne rechiffrer le mot de passe que s'il a été modifié
      let encryptedPassword = passwordToEdit?.password;
      
      if (data.password !== decryptedPassword) {
        const newEncryptedPassword = await encryptData(data.password);
        
        if (!newEncryptedPassword) {
          toast({
            variant: "destructive",
            title: "Erreur de chiffrement",
            description: "Impossible de chiffrer le mot de passe. Veuillez vérifier vos clés de chiffrement.",
          });
          return;
        }
        
        encryptedPassword = newEncryptedPassword;
      }
      
      // Mettre à jour le mot de passe
      updatePassword(passwordId, {
        title: data.title,
        username: data.username,
        password: encryptedPassword,
        url: data.url || "",
        notes: data.notes || "",
        categoryId: parseInt(data.categoryId),
        updatedAt: new Date().toISOString(),
      });
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Le mot de passe a été mis à jour avec succès.",
      });
      
      navigate("/passwords");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du mot de passe.",
      });
    }
  };
  
  // Fonction pour générer un mot de passe aléatoire
  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16, {
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
    
    form.setValue("password", newPassword);
    setDecryptedPassword(newPassword);
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p>Chargement...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!passwordToEdit) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p>Mot de passe non trouvé</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le mot de passe</h1>
          <p className="text-muted-foreground">
            Modifiez les informations de votre mot de passe.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Informations du mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Gmail, Facebook, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur / Email</FormLabel>
                      <FormControl>
                        <Input placeholder="nom@exemple.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="relative flex-grow">
                            <Input
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2 whitespace-nowrap"
                            onClick={handleGeneratePassword}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Générer
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemple.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informations complémentaires..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/passwords")}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
