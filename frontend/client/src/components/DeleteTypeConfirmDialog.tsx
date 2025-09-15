import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useObjectContext } from '@/contexts/ObjectContext';
import { apiRequest } from '@/lib/queryClient';
import { ObjectType } from '@shared/schema';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  object: ObjectType;
}

export default function DeleteTypeConfirmDialog({ open, onOpenChange, object }: DeleteConfirmDialogProps) {
  const { dispatch } = useObjectContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteObjectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/object-types/${object.id}`);
    },
    onSuccess: () => {
      dispatch({ type: 'REMOVE_OBJECT', payload: object.id });
      queryClient.invalidateQueries({ queryKey: ['/api/object-types'] });
      
      toast({
        title: "Success",
        description: "Object Type deleted successfully."
      });
      
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete object type. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    deleteObjectMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="delete-confirm-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <span>Delete Object</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete "{object.name}"? This action cannot be undone and will remove all associated data, relations, and hierarchies.
          </p>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-medium text-destructive mb-2">This will permanently delete:</h4>
            <ul className="text-sm text-destructive space-y-1">
              <li>• Object information and properties</li>
              <li>• All related data tables</li>
              <li>• Connected relationships</li>
              <li>• Hierarchy definitions</li>
            </ul>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleteObjectMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteObjectMutation.isPending}
              data-testid="button-delete"
            >
              {deleteObjectMutation.isPending ? 'Deleting...' : 'Delete Object'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
