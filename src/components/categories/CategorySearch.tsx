
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CategorySearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function CategorySearch({ searchTerm, setSearchTerm }: CategorySearchProps) {
  return (
    <div className="flex w-full items-center space-x-2 mb-6">
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
  );
}
