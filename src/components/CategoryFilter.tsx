import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface CategoryFilterProps {
  availableCategories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  showAllOption?: boolean;
}

export function CategoryFilter({ 
  availableCategories, 
  selectedCategories, 
  onCategoriesChange, 
  showAllOption = true 
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryToggle = (category: string) => {
    if (category === "Tous") {
      onCategoriesChange([]);
    } else {
      const isSelected = selectedCategories.includes(category);
      if (isSelected) {
        onCategoriesChange(selectedCategories.filter(c => c !== category));
      } else {
        onCategoriesChange([...selectedCategories, category]);
      }
    }
  };

  const isAllSelected = selectedCategories.length === 0;
  const hasActiveFilters = selectedCategories.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${hasActiveFilters ? 'border-primary' : ''}`}
        >
          <Filter className="h-4 w-4" />
          Catégories
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {selectedCategories.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle>Filtrer par catégories</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-wrap gap-2 mt-6">
          {showAllOption && (
            <Button
              variant={isAllSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryToggle("Tous")}
              className="rounded-full"
            >
              Tous
            </Button>
          )}
          
          {availableCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategories.includes(category) ? "default" : "outline"}
              size="sm" 
              onClick={() => handleCategoryToggle(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
        
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onCategoriesChange([])}
              className="text-muted-foreground"
            >
              Effacer tous les filtres
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}