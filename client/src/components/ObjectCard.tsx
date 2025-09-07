import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Package } from 'lucide-react';
import { ObjectType } from '@shared/schema';
import { cn } from '@/lib/utils';

interface ObjectCardProps {
  object: ObjectType;
  onClick?: () => void;
  className?: string;
  isSearchResult?: boolean;
}

export default function ObjectCard({ object, onClick, className, isSearchResult }: ObjectCardProps) {
  const IconComponent = object.type === 'Document' ? FileText : Package;
  const iconColor = object.type === 'Document' ? 'text-secondary' : 'text-primary';
  const badgeColor = object.type === 'Document' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary';

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow cursor-pointer",
        isSearchResult && "border-l-4 border-primary",
        className
      )}
      onClick={onClick}
      data-testid={`card-object-${object.id}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <IconComponent className={cn("h-6 w-6", iconColor)} />
          <Badge className={cn("text-xs", badgeColor)}>
            {object.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <h3 className="text-lg font-medium text-foreground mb-2" data-testid={`text-name-${object.id}`}>
          {object.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-4" data-testid={`text-description-${object.id}`}>
          {object.description}
        </p>
        
        <div className="space-y-2">
          {object.attributes && typeof object.attributes === 'object' && Object.entries(object.attributes).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground capitalize">{key}:</span>
              <span className="font-medium text-foreground" data-testid={`text-${key}-${object.id}`}>
                {value != null ? String(value) : ''}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Modified:</span>
            <span className="font-medium text-foreground" data-testid={`text-modified-${object.id}`}>
              {object.modified_date ? new Date(object.modified_date).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
