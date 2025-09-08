import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Flag, ChevronRight, Plus, Info } from 'lucide-react';
import { useObjectContext } from '@/contexts/ObjectContext';
import { Hierarchy, ObjectType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function ObjectHierarchyTab() {
  const { state } = useObjectContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildDescription, setNewChildDescription] = useState('');

  const { data: hierarchies = [] } = useQuery<Hierarchy[]>({
    queryKey: ['/api/objects', state.selectedObject?.id, 'hierarchy'],
    enabled: !!state.selectedObject,
  });

  const { data: objects = [] } = useQuery<ObjectType[]>({
    queryKey: ['/api/objects'],
  });

  const addChildMutation = useMutation({
    mutationFn: async (childData: { name: string; description: string }) => {
      // First create the new object
      const newObjectResponse = await apiRequest('POST', '/api/objects', {
        name: childData.name,
        description: childData.description,
        type: 'Item',
        attributes: {}
      });
      const newObject = await newObjectResponse.json();

      // Then create hierarchy entry
      const hierarchyData = {
        parent_object_id: state.selectedObject?.id,
        child_object_ids: [newObject.id],
        properties: { priority: 1 }
      };

      return apiRequest('POST', '/api/hierarchies', hierarchyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/objects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/objects', state.selectedObject?.id, 'hierarchy'] });
      toast({
        title: "Success",
        description: "Child object added successfully."
      });
      setIsAddChildDialogOpen(false);
      setNewChildName('');
      setNewChildDescription('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add child object. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddChild = () => {
    if (!newChildName.trim()) {
      toast({
        title: "Error",
        description: "Child name is required.",
        variant: "destructive"
      });
      return;
    }

    addChildMutation.mutate({
      name: newChildName.trim(),
      description: newChildDescription.trim() || `Child object of ${state.selectedObject?.name}`
    });
  };

  const getChildObjects = () => {
    // Only get hierarchies where the selected object is the parent
    const parentHierarchies = hierarchies.filter(h => h.parent_object_id === state.selectedObject?.id);
    if (!parentHierarchies.length) return [];
    
    const childIds = parentHierarchies.flatMap(h => h.child_object_ids || []);
    return objects.filter(obj => childIds.includes(obj.id));
  };

  const childObjects = getChildObjects();

  if (!state.selectedObject) {
    return (
      <div className="text-center py-12" data-testid="no-object-selected">
        <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Object Selected</h3>
        <p className="text-muted-foreground">Select an object from the sidebar to view its hierarchy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="object-hierarchy-tab">
      {/* Selected Object Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Info className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Currently Viewing Hierarchy For:</h3>
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
            <Flag className="h-5 w-5" />
            <span>Object Hierarchy</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Manage parent-child relationships and hierarchical structure of objects.
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Hierarchy Tree */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-foreground">Hierarchy Tree</h4>
              <Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-child">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Child
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Child Object</DialogTitle>
                    <DialogDescription>
                      Create a new child object under {state.selectedObject.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="child-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="child-name"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        className="col-span-3"
                        placeholder="Enter child object name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="child-description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="child-description"
                        value={newChildDescription}
                        onChange={(e) => setNewChildDescription(e.target.value)}
                        className="col-span-3"
                        placeholder="Enter description (optional)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddChildDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddChild} disabled={addChildMutation.isPending}>
                      {addChildMutation.isPending ? 'Adding...' : 'Add Child'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-2">
              {/* Root Level */}
              <div className="flex items-center space-x-2 p-2" data-testid="hierarchy-root">
                <Flag className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{state.selectedObject.name}</span>
                <Badge className="bg-primary/10 text-primary text-xs">Root</Badge>
              </div>
              
              {/* Child Objects */}
              {childObjects.length > 0 ? (
                <div className="ml-8 space-y-2">
                  {childObjects.map((child) => (
                    <div key={child.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded" data-testid={`hierarchy-child-${child.id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{child.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Child
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ml-8 text-sm text-muted-foreground p-2">
                  No child objects defined. Use the "Add Child" button to create hierarchy levels.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
