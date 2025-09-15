import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { ObjectType } from '@shared/schema';

interface PropertiesTableProps {
  object: ObjectType;
}

export default function AdminPropertiesTable({ object }: PropertiesTableProps) {
  return (
    <Card data-testid="properties-table">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="h-5 w-5" />
          <span>Object Attributes</span>
        </CardTitle>
        <p className="text-muted-foreground">
          Detailed information about the selected object type
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Property Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Property Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr data-testid="property-id">
                <td className="px-6 py-4 text-sm font-medium text-foreground">ID</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{object.id}</td>
              </tr>
              <tr data-testid="property-name">
                <td className="px-6 py-4 text-sm font-medium text-foreground">Name</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{object.name}</td>
              </tr>
              <tr data-testid="property-type">
                <td className="px-6 py-4 text-sm font-medium text-foreground">Type</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{object.type}</td>
              </tr>
              <tr data-testid="property-description">
                <td className="px-6 py-4 text-sm font-medium text-foreground">Description</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{object.description}</td>
              </tr>
              
              {/* Dynamic attributes */}
              {object.attributes && typeof object.attributes === 'object' && 
               Object.entries(object.attributes).map(([key, value]) => (
                <tr key={key} data-testid={`property-${key}`}>
                  <td className="px-6 py-4 text-sm font-medium text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {key.toLowerCase() === 'status' ? (
                      <Badge 
                        className={
                          String(value || '').toLowerCase() === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : String(value || '').toLowerCase() === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {value != null ? String(value) : ''}
                      </Badge>
                    ) : (
                      value != null ? String(value) : ''
                    )}
                  </td>
                </tr>
              ))}
              
              <tr data-testid="property-created">
                <td className="px-6 py-4 text-sm font-medium text-foreground">Created Date</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {object.created_date ? new Date(object.created_date).toISOString() : ''}
                </td>
              </tr>
              <tr data-testid="property-modified">
                <td className="px-6 py-4 text-sm font-medium text-foreground">Modified Date</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {object.modified_date ? new Date(object.modified_date).toISOString() : ''}
                </td>
              </tr>
              <tr data-testid="property-revision">
                <td className="px-6 py-4 text-sm font-medium text-foreground">Revision</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{object.revision}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
