import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Users, UserPlus, GitBranch } from 'lucide-react';

interface CreateChildRelationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentObject: ObjectType;
  availableObjects: ObjectType[];
}

const RELATION_TYPES = [
  { value: 'child', label: 'Child', description: 'Parent-child relationship' },
  { value: 'contains', label: 'Contains', description: 'Object contains other objects' },
  { value: 'part_of', label: 'Part Of', description: 'Object is part of another object' },
  { value: 'depends_on', label: 'Depends On', description: 'Object depends on other objects' },
  { value: 'related_to', label: 'Related To', description: 'General relationship' },
];

export default function CreateChildRelationDialog({
  isOpen,
  onClose,
  parentObject,
  availableObjects
}: CreateChildRelationDialogProps) {
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [relationType, setRelationType] = useState<string>('child');
  const [description, setDescription] = useState<string>('');
  const [isCreatingNewObject, setIsCreatingNewObject] = useState(false);
  const [newObjectName, setNewObjectName] = useState('');
  const [newObjectDescription, setNewObjectDescription] = useState('');
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
        description: "Child relation created successfully."
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create child relation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const createObjectAndRelationMutation = useMutation({
    mutationFn: async (objectData: { name: string; description: string }) => {
      // First create the new object
      const newObjectResponse = await apiRequest('POST', '/api/objects', {
        name: objectData.name,
        description: objectData.description,
        type: 'Item',
        attributes: {}
      });
      const newObject = await newObjectResponse.json();

      // Then create the relation
      return apiRequest('POST', '/api/relations', {
        primary_object_id: parentObject.id,
        secondary_object_ids: [newObject.id],
        relation_type: relationType,
        description: description || `Child object of ${parentObject.name}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/objects'] });
      toast({
        title: "Success",
        description: "Child object and relation created successfully."
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create child object and relation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleClose = () => {
    setSelectedObjects([]);
    setRelationType('child');
    setDescription('');
    setIsCreatingNewObject(false);
    setNewObjectName('');
    setNewObjectDescription('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreatingNewObject) {
      if (!newObjectName.trim()) {
        toast({
          title: "Validation Error",
          description: "Child object name is required.",
          variant: "destructive"
        });
        return;
      }

      createObjectAndRelationMutation.mutate({
        name: newObjectName.trim(),
        description: newObjectDescription.trim() || `Child object of ${parentObject.name}`
      });
    } else {
      if (selectedObjects.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please select at least one child object.",
          variant: "destructive"
        });
        return;
      }

      createRelationMutation.mutate({
        primary_object_id: parentObject.id,
        secondary_object_ids: selectedObjects,
        relation_type: relationType,
        description: description || undefined
      });
    }
  };

  const handleObjectToggle = (objectId: string) => {
    setSelectedObjects(prev => 
      prev.includes(objectId) 
        ? prev.filter(id => id !== objectId)
        : [...prev, objectId]
    );
  };

  const selectedRelationType = RELATION_TYPES.find(type => type.value === relationType);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>Create Child Relation</span>
          </DialogTitle>
          <DialogDescription>
            Create a child relationship for <strong>{parentObject.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="relation-type">Relation Type</Label>
              <Select value={relationType} onValueChange={setRelationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relation type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRelationType && (
                <p className="text-sm text-muted-foreground">
                  {selectedRelationType.description}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the relationship..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Toggle between existing objects and creating new */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={isCreatingNewObject ? "outline" : "default"}
                size="sm"
                onClick={() => setIsCreatingNewObject(false)}
              >
                <Users className="h-4 w-4 mr-2" />
                Use Existing Objects
              </Button>
              <Button
                type="button"
                variant={isCreatingNewObject ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCreatingNewObject(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Object
              </Button>
            </div>

            {isCreatingNewObject ? (
              <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid gap-2">
                  <Label htmlFor="child-name">Child Object Name</Label>
                  <Input
                    id="child-name"
                    type="text"
                    placeholder="Enter name for the new child object"
                    value={newObjectName}
                    onChange={(e) => setNewObjectName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="child-description">Child Object Description</Label>
                  <Textarea
                    id="child-description"
                    placeholder="Describe the new child object..."
                    value={newObjectDescription}
                    onChange={(e) => setNewObjectDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Child Objects</Label>
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
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                (isCreatingNewObject && !newObjectName.trim()) ||
                (!isCreatingNewObject && selectedObjects.length === 0) ||
                createRelationMutation.isPending ||
                createObjectAndRelationMutation.isPending
              }
            >
              {createRelationMutation.isPending || createObjectAndRelationMutation.isPending 
                ? 'Creating...' 
                : isCreatingNewObject 
                  ? 'Create Child Object & Relation' 
                  : 'Create Child Relation'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
