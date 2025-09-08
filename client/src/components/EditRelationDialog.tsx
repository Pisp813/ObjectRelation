import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Relation, ObjectType } from '@shared/schema';
import { Link } from 'lucide-react';

interface EditRelationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  relation: Relation | null;
  allObjects: ObjectType[];
}

const RELATION_TYPES = [
  'associated_with',
  'depends_on',
  'contains',
  'references',
  'related_to',
  'parent_of',
  'child_of',
  'similar_to',
  'different_from',
  'affects',
  'affected_by'
];

export default function EditRelationDialog({
  isOpen,
  onClose,
  relation,
  allObjects
}: EditRelationDialogProps) {
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [relationType, setRelationType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form with current relation data
  useEffect(() => {
    if (relation) {
      setSelectedObjects(Array.isArray(relation.secondary_object_ids) ? relation.secondary_object_ids : []);
      setRelationType(relation.relation_type);
      setDescription(relation.description || '');
    }
  }, [relation]);

  const updateRelationMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      secondary_object_ids: string[];
      relation_type: string;
      description?: string;
    }) => {
      return apiRequest('PUT', `/api/relations/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/objects'] });
      toast({
        title: "Success",
        description: "Relation updated successfully."
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update relation. Please try again.",
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
    
    if (!relation) return;

    if (selectedObjects.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one object to relate to.",
        variant: "destructive"
      });
      return;
    }

    if (!relationType) {
      toast({
        title: "Validation Error",
        description: "Please select a relation type.",
        variant: "destructive"
      });
      return;
    }

    updateRelationMutation.mutate({
      id: relation.id,
      secondary_object_ids: selectedObjects,
      relation_type: relationType,
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

  // Filter out the primary object from available objects
  const availableObjects = allObjects.filter(obj => obj.id !== relation?.primary_object_id);

  if (!relation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Edit Relation</span>
          </DialogTitle>
          <DialogDescription>
            Edit the relationship between objects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="relation-type">Relation Type</Label>
              <Select value={relationType} onValueChange={setRelationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a relation type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={updateRelationMutation.isPending || selectedObjects.length === 0 || !relationType}
            >
              {updateRelationMutation.isPending ? 'Updating...' : 'Update Relation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
