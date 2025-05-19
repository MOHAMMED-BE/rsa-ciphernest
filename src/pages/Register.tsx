
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useAuthStore } from "@/store/authStore";
import { useCryptoStore } from "@/store/cryptoStore";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";

const registerSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isLoading, error } = useAuthStore();
  const { generateKeys } = useCryptoStore();
  
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterValues) => {
    // Étape 1: Créer le compte
    const success = await register(data.email, data.password);
    
    if (success) {
      // Étape 2: Générer les clés RSA
      toast({
        title: "Génération des clés RSA",
        description: "Veuillez patienter pendant la génération de vos clés de chiffrement...",
      });
      
      const keysGenerated = await generateKeys();
      
      if (keysGenerated) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé et vos clés RSA ont été générées avec succès.",
        });
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de génération des clés",
          description: "Impossible de générer les clés RSA. Veuillez réessayer plus tard.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error || "Une erreur est survenue lors de l'inscription.",
      });
    }
  };

  return (
    <AuthLayout 
      title="Créer un compte" 
      subtitle="Rejoignez CipherNest pour sécuriser vos mots de passe avec un chiffrement de bout en bout."
    >
      <div className="mb-6 rounded-md border border-border bg-secondary/50 p-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <p className="text-xs font-medium">Sécurité de bout en bout</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Vos mots de passe sont chiffrés localement avec votre clé privée qui ne quitte jamais votre appareil.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="exemple@email.com" {...field} />
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Création du compte..." : "Créer un compte"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm">
        <p>
          Vous avez déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Se connecter
          </Link>
        </p>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-2">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Chiffrement de bout en bout. Votre clé privée ne quitte jamais votre appareil.
        </p>
      </div>
    </AuthLayout>
  );
}
