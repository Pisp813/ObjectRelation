import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ObjectType {
  id: number;
  object_type: string;
}

interface RelationType {
  id: number;
  name: string;
  primary_type: number;
  secondary_type: number;
}

interface RelationTypeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  relationType: RelationType | null;
}

export default function RelationTypeEditDialog({
  isOpen,
  onClose,
  relationType,
}: RelationTypeEditDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [primaryTypeId, setPrimaryTypeId] = useState<number | "">("");
  const [secondaryTypeId, setSecondaryTypeId] = useState<number | "">("");

  // Fetch object types for dropdown
  const { data: objectTypes = [] } = useQuery<ObjectType[]>({
    queryKey: ["/api/object-types"],
  });

  // Pre-fill fields when dialog opens or relationType changes
  useEffect(() => {
    if (relationType) {
      setName(relationType.name || "");
      setPrimaryTypeId(relationType.primary_type);
      setSecondaryTypeId(relationType.secondary_type);
    }
  }, [relationType]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!relationType) return;
      const res = await fetch(`/api/relation-types/${relationType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          primary_type: primaryTypeId,
          secondary_type: secondaryTypeId,
        }),
      });
      if (!res.ok) throw new Error("Failed to update relation type");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["relation-types"]);
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Relation Type</DialogTitle>
          <DialogDescription>
            Update details for <b>{relationType?.name}</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Primary Type Dropdown */}
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

          {/* Secondary Type Dropdown */}
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
