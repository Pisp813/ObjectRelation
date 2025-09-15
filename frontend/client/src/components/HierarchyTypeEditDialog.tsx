import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HierarchyType {
  id: number;
  object_type: number;
  inventory: string[];
  purchase: string[];
}

interface HierarchyTypeEditDialogProps {
  objectId: number; // pass object_id from parent
}

export default function HierarchyTypeEditDialog({ objectId }: HierarchyTypeEditDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState('');
  const [purchase, setPurchase] = useState('');

  // 🔎 Fetch latest hierarchy type by object_id when dialog opens
  const { data, isLoading, error } = useQuery<HierarchyType>({
    queryKey: ['hierarchy-type', objectId],
    queryFn: async () => {
      const res = await fetch(`/api/hierarchy-types/${objectId}`);
      if (!res.ok) throw new Error('Failed to fetch hierarchy type');
      return res.json();
    },
    enabled: open, // only fetch when dialog is open
    onSuccess: (hierarchy) => {
      setInventory(hierarchy.inventory.join(', '));
      setPurchase(hierarchy.purchase.join(', '));
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/hierarchy-types/${objectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: inventory.split(',').map((s) => s.trim()).filter(Boolean),
          purchase: purchase.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error('Failed to update hierarchy type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hierarchy-type', objectId]);
      setOpen(false);
    },
  });

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hierarchy Type</DialogTitle>
            <DialogDescription>
              Update inventory and purchase columns for this hierarchy type.
            </DialogDescription>
          </DialogHeader>

          {isLoading && <div>Loading...</div>}
          {error && <div className="text-red-500">Failed to load hierarchy type</div>}

          {data && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Inventory Columns</label>
                <Input
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  placeholder="Comma separated (e.g. col1, col2)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Purchase Columns</label>
                <Input
                  value={purchase}
                  onChange={(e) => setPurchase(e.target.value)}
                  placeholder="Comma separated (e.g. col1, col2)"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
