import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ObjectType } from '@shared/schema';
import { Link } from 'lucide-react';

interface CreateRelationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  primaryObject: ObjectType;
  availableObjects: ObjectType[];
}

export default function CreateRelationDialog({
  isOpen,
  onClose,
  primaryObject,
  availableObjects
}: CreateRelationDialogProps) {
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [relationType, setRelationType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRelationMutation = useMutation({
    mutationFn: async (data: {
      primary_object_id: string;
      secondary_object_ids: string[];
      relation_type: string;
      description?: string;
    }) => {
      return apiRequest('POST', '/api/relations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/objects'] });
      toast({
        title: "Success",
        description: "Relation created successfully."
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create relation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleClose = () => {
    setSelectedObjects([]);
    setRelationType('');
    setDescription('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedObjects.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one object to relate to.",
        variant: "destructive"
      });
      return;
    }

    if (!relationType.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a relation type.",
        variant: "destructive"
      });
      return;
    }

    createRelationMutation.mutate({
      primary_object_id: primaryObject.id,
      secondary_object_ids: selectedObjects,
      relation_type: relationType.trim(),
      description: description || undefined
    });
  };

  const handleObjectToggle = (objectId: string) => {
    setSelectedObjects(prev => 
      prev.includes(objectId) 
        ? prev.filter(id => id !== objectId)
        : [...prev, objectId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Create Relation</span>
          </DialogTitle>
          <DialogDescription>
            Create a relationship between <strong>{primaryObject.name}</strong> and other objects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="relation-type">Relation Type</Label>
              <Input
                id="relation-type"
                type="text"
                placeholder="Enter relation type (e.g., depends_on, contains, related_to)"
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the relationship..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Related Objects</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {availableObjects.length > 0 ? (
                  <div className="space-y-2">
                    {availableObjects.map((object) => (
                      <div key={object.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`object-${object.id}`}
                          checked={selectedObjects.includes(object.id)}
                          onChange={() => handleObjectToggle(object.id)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`object-${object.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{object.name}</span>
                            <span className="text-sm text-muted-foreground">{object.type}</span>
                          </div>
                          {object.description && (
                            <p className="text-sm text-muted-foreground mt-1">{object.description}</p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No other objects available to relate to.
                  </p>
                )}
              </div>
              {selectedObjects.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedObjects.length} object{selectedObjects.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRelationMutation.isPending || selectedObjects.length === 0 || !relationType.trim()}
            >
              {createRelationMutation.isPending ? 'Creating...' : 'Create Relation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
