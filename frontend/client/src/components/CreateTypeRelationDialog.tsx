import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}

export default function CreateTypeRelationDialog({
  isOpen,
  onClose,
}: CreateRelationDialogProps) {
  const [relationType, setRelationType] = useState<string>('');
  const [primaryTypeId, setPrimaryTypeId] = useState<number | ''>('');
  const [secondaryTypeId, setSecondaryTypeId] = useState<number | ''>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch object types for dropdown
  const { data: objectTypes = [] } = useQuery<ObjectType[]>({
    queryKey: ['/api/object-types'],
  });

  const createRelationMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      primary_type: number;
      secondary_type: number;
    }) => {
      return apiRequest('POST', '/api/relation-types', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/relation-types'] });
      toast({
        title: "Success",
        description: "Relation created successfully."
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create relation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleClose = () => {
    setRelationType('');
    setPrimaryTypeId('');
    setSecondaryTypeId('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!relationType.trim() || !primaryTypeId || !secondaryTypeId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    createRelationMutation.mutate({
      name: relationType.trim(),
      primary_type: Number(primaryTypeId),
      secondary_type: Number(secondaryTypeId),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Create Relation Type</span>
          </DialogTitle>
          <DialogDescription>
            Create a relationship between object types.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Relation Type */}
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

            {/* Primary Object Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="primary-type">Primary Object Type</Label>
              <select
                id="primary-type"
                className="border rounded-md p-2"
                value={primaryTypeId}
                onChange={(e) => setPrimaryTypeId(Number(e.target.value))}
              >
                <option value="">-- Select Primary Object --</option>
                {objectTypes.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.object_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Secondary Object Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="secondary-type">Secondary Object Type</Label>
              <select
                id="secondary-type"
                className="border rounded-md p-2"
                value={secondaryTypeId}
                onChange={(e) => setSecondaryTypeId(Number(e.target.value))}
              >
                <option value="">-- Select Secondary Object --</option>
                {objectTypes.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.object_type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRelationMutation.isPending || !relationType.trim()}
            >
              {createRelationMutation.isPending ? 'Creating...' : 'Create Relation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
