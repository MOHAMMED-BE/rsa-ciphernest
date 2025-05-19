
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryHeaderProps {
  categoryName: string;
  categoryDescription: string;
  categoryId: string;
}

export function CategoryHeader({ categoryName, categoryDescription, categoryId }: CategoryHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{categoryName}</h1>
        <p className="text-muted-foreground">
          {categoryDescription}
        </p>
      </div>
      <Button onClick={() => navigate(`/add-password?category=${categoryId}`)}>
        <Plus size={16} className="mr-2" />
        Ajouter un mot de passe
      </Button>
    </div>
  );
}
