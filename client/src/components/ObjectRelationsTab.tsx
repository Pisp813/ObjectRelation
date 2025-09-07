import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, Edit, Trash2, Flag } from 'lucide-react';
import { useObjectContext } from '@/contexts/ObjectContext';
import { useToast } from '@/hooks/use-toast';
import { Relation, ObjectType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function ObjectRelationsTab() {
  const { state } = useObjectContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: relations = [] } = useQuery<Relation[]>({
    queryKey: ['/api/objects', state.selectedObject?.id, 'relations'],
    enabled: !!state.selectedObject,
  });

  const { data: objects = [] } = useQuery<ObjectType[]>({
    queryKey: ['/api/objects'],
  });

  const deleteRelationMutation = useMutation({
    mutationFn: async (relationId: string) => {
      return apiRequest('DELETE', `/api/relations/${relationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/objects'] });
      toast({
        title: "Success",
        description: "Relation deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete relation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteRelation = (relationId: string) => {
    if (confirm('Are you sure you want to delete this relation?')) {
      deleteRelationMutation.mutate(relationId);
    }
  };

  const getRelatedObjectName = (objectId: string) => {
    const object = objects.find(obj => obj.id === objectId);
    return object?.name || 'Unknown Object';
  };

  if (!state.selectedObject) {
    return (
      <div className="text-center py-12" data-testid="no-object-selected">
        <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Object Selected</h3>
        <p className="text-muted-foreground">Select an object from the sidebar to view its relations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="object-relations-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5" />
            <span>Object Relations</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Manage relationships between objects and visualize connections.
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Relations Visualization Placeholder */}
          <div className="flex items-center justify-center min-h-96 bg-muted/20 rounded-lg border-2 border-dashed border-border mb-6">
            <div className="text-center">
              <Flag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-foreground mb-2">Relations Visualization</p>
              <p className="text-muted-foreground">
                Interactive diagram showing object relationships
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Future enhancement: D3.js or similar visualization library
              </p>
            </div>
          </div>

          {/* Relations List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-foreground">Connected Objects</h4>
              <Button size="sm" data-testid="button-add-relation">
                <Link className="h-4 w-4 mr-2" />
                Add Relation
              </Button>
            </div>
            
            {relations.length > 0 ? (
              <div className="space-y-3">
                {relations.map((relation) => (
                  <div 
                    key={relation.id} 
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                    data-testid={`relation-${relation.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Link className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">
                          {Array.isArray(relation.secondary_object_ids) 
                            ? relation.secondary_object_ids.map(id => getRelatedObjectName(id)).join(', ')
                            : 'No connected objects'
                          }
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {relation.relation_type}
                          </Badge>
                          {relation.description && (
                            <p className="text-sm text-muted-foreground">
                              {relation.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        data-testid={`button-edit-relation-${relation.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteRelation(relation.id)}
                        disabled={deleteRelationMutation.isPending}
                        data-testid={`button-delete-relation-${relation.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No relations found for this object. Create relations to connect it with other objects.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
