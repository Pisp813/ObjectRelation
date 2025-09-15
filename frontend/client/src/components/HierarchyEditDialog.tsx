import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { useToast } from "@/hooks/use-toast";
import { HierarchyTypeBase, HierarchyUpdate } from "@shared/schema";

interface HierarchyEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hierarchy: HierarchyTypeBase;
  queryKey: any;
}

export default function HierarchyEditDialog({
  isOpen,
  onClose,
  hierarchy,
  queryKey,
}: HierarchyEditDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [inventory, setInventory] = useState("");
  const [purchase, setPurchase] = useState("");

  useEffect(() => {
    if (hierarchy) {
      setInventory(hierarchy.inventory.join(", "));
      setPurchase(hierarchy.purchase.join(", "));
    }
  }, [hierarchy]);

  const updateMutation = useMutation({
    mutationFn: async (data: HierarchyUpdate) => {
      const res = await fetch(`/api/hierarchy-types/${hierarchy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update hierarchy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      toast({ title: "Success", description: "Hierarchy updated successfully." });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update hierarchy.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      inventory: inventory.split(",").map((i) => i.trim()),
      purchase: purchase.split(",").map((i) => i.trim()),
    });
  };

  return (
    <Dialog open={isOpen && !!hierarchy} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Hierarchy</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box mb={3}>
            <TextField
              label="Inventory (comma-separated)"
              fullWidth
              variant="outlined"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
            />
          </Box>
          <Box mb={1}>
            <TextField
              label="Purchase (comma-separated)"
              fullWidth
              variant="outlined"
              value={purchase}
              onChange={(e) => setPurchase(e.target.value)}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
