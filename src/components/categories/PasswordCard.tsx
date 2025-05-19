
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, EyeOff, Copy, Trash, Edit, RefreshCw } from "lucide-react";
import { PasswordEntry } from "@/types";
import { usePasswordStore } from "@/store/passwordStore";
import { toast } from "sonner";

interface PasswordCardProps {
  password: PasswordEntry;
  decryptData: (encryptedData: string) => Promise<string | null>;
  decryptionError: { id: number | null, message: string | null };
  revealedPasswords: { [key: number]: string };
  togglePasswordVisibility: (passwordId: number, encryptedPassword: string) => Promise<void>;
  copyPassword: (encryptedPassword: string) => Promise<void>;
  passwordStrength: { strength: string; color: string } | undefined;
  handleReloadKey: () => Promise<void>;
}

export function PasswordCard({
  password,
  decryptData,
  decryptionError,
  revealedPasswords,
  togglePasswordVisibility,
  copyPassword,
  passwordStrength,
  handleReloadKey
}: PasswordCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card key={password.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{password.title}</CardTitle>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/edit-password/${password.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon" 
              className="text-red-600" 
              onClick={() => {
                usePasswordStore.getState().deletePassword(password.id);
                toast("Supprimé", {
                  description: "Le mot de passe a été supprimé avec succès.",
                });
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Nom d'utilisateur:</span> {password.username}
          </div>
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Mot de passe:</span>
            <div className="flex items-center space-x-2 mt-1">
              {decryptionError.id === password.id ? (
                <span className="text-red-500 text-xs">Erreur de déchiffrement</span>
              ) : (
                <span className="font-mono">
                  {revealedPasswords[password.id] 
                    ? revealedPasswords[password.id]
                    : "••••••••"}
                </span>
              )}
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
            
            {decryptionError.id === password.id && (
              <div className="mt-1 text-xs text-red-500 flex items-center space-x-2">
                <span>{decryptionError.message}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs py-0"
                  onClick={handleReloadKey}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Recharger la clé
                </Button>
              </div>
            )}
          </div>
          {password.url && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">URL:</span> {password.url}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground mr-2">Sécurité:</span>
          <Badge className={passwordStrength?.color || "bg-gray-400"}>
            {passwordStrength?.strength || "Chargement..."}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          Mis à jour le {format(new Date(password.updatedAt), "dd/MM/yyyy", { locale: fr })}
        </span>
      </CardFooter>
    </Card>
  );
}
