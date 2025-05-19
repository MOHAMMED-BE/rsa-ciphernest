
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  searchTerm: string;
}

export function EmptyState({ searchTerm }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground py-8">
          {searchTerm 
            ? `Aucun résultat trouvé pour "${searchTerm}" dans cette catégorie.`
            : `Aucun mot de passe dans cette catégorie. Cliquez sur "Ajouter un mot de passe" pour commencer.`}
        </p>
      </CardContent>
    </Card>
  );
}
