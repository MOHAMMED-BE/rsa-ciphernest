
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DecryptionErrorType } from "@/store/cryptoStore";
import { RefreshCw, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DecryptionAlertProps {
  errorType: DecryptionErrorType | null;
  handleReloadKey: () => Promise<void>;
}

export function DecryptionAlert({ errorType, handleReloadKey }: DecryptionAlertProps) {
  const navigate = useNavigate();
  
  if (!errorType) return null;
  
  if (errorType === DecryptionErrorType.MISSING_KEY) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Clé de déchiffrement manquante</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>La clé privée nécessaire au déchiffrement n'est pas disponible.</p>
          <div className="flex space-x-2 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReloadKey}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recharger la clé
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/settings")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer la clé privée
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (errorType === DecryptionErrorType.CORRUPTED_DATA) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Données corrompues</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Les données chiffrées semblent être corrompues ou incompatibles avec la clé actuelle.</p>
          <div className="flex space-x-2 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReloadKey}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recharger la clé
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/settings")}
            >
              Gérer les clés
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
