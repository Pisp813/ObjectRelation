import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Link, Edit, Trash2, Flag, Network, Info } from 'lucide-react';
import { useObjectContext } from '@/contexts/ObjectContext';
import { useToast } from '@/hooks/use-toast';
import { Relation, ObjectType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import CreateRelationDialog from './CreateRelationDialog';
import EditRelationDialog from './EditRelationDialog';

export default function ObjectRelationsTab() {
  const { state } = useObjectContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState<Relation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleEditRelation = (relation: Relation) => {
    setEditingRelation(relation);
    setIsEditDialogOpen(true);
  };

  const getRelatedObjectName = (objectId: string) => {
    const object = objects.find(obj => obj.id === objectId);
    return object?.name || 'Unknown Object';
  };

  const getRelatedObjectType = (objectId: string) => {
    const object = objects.find(obj => obj.id === objectId);
    return object?.type || 'Unknown';
  };

  // Filter out the current object from available objects
  const availableObjects = objects.filter(obj => obj.id !== state.selectedObject?.id);

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
      {/* Selected Object Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Info className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Currently Viewing Relations For:</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg font-medium text-primary">{state.selectedObject.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {state.selectedObject.type}
                </Badge>
              </div>
              {state.selectedObject.description && (
                <p className="text-sm text-muted-foreground mt-1">{state.selectedObject.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Object Relations</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Manage relationships between objects.
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>

            {/* Table View */}
            <TabsContent value="table" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-foreground">Connected Objects</h4>
                <Button 
                  size="sm" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  data-testid="button-add-relation"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Add Relation
                </Button>
              </div>
              
              {relations.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Related Objects</TableHead>
                        <TableHead>Relation Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relations.map((relation) => (
                        <TableRow key={relation.id} data-testid={`relation-${relation.id}`}>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              {Array.isArray(relation.secondary_object_ids) 
                                ? relation.secondary_object_ids.map(id => (
                                    <div key={id} className="flex items-center space-x-2">
                                      <Link className="h-4 w-4 text-primary" />
                                      <div>
                                        <span className="font-medium">{getRelatedObjectName(id)}</span>
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          {getRelatedObjectType(id)}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))
                                : 'No connected objects'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {relation.relation_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {relation.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditRelation(relation)}
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No relations found for this object. Create relations to connect it with other objects.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Relation Dialog */}
      <CreateRelationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        primaryObject={state.selectedObject}
        availableObjects={availableObjects}
      />

      {/* Edit Relation Dialog */}
      <EditRelationDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        relation={editingRelation}
        allObjects={objects}
      />
    </div>
  );
}
