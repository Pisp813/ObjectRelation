import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  IconButton,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';
import { useObjectContext } from '@/contexts/ObjectContext';
import { apiRequest } from '@/lib/queryClient';

interface EditObjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  object: any; // object to edit
}

interface AttributeField {
  name: string;
}

interface Column {
  name: string;
}

interface TableData {
  name: string;
  columns: Column[];
}

export default function EditObjectTypeDialog({ open, onOpenChange, object }: EditObjectDialogProps) {
  const [formData, setFormData] = useState({ name: '', description: '', type: 'Item' });
  const [attributes, setAttributes] = useState<AttributeField[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);

  const { dispatch } = useObjectContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Prefill form when object changes
  useEffect(() => {
    if (object) {
      setFormData({
        name: object.object_type || '',
        description: object.description || '',
        type: object.type || 'Item',
      });
      setAttributes(object.attributes?.map((attr: string) => ({ name: attr })) || []);
      setTables(
        object.tables?.map((table: any) => ({
          name: table.name,
          columns: table.columns?.map((col: string) => ({ name: col })) || [],
        })) || []
      );
    }
  }, [object]);

  const updateObjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/object-types/${object.id}`, data);
      return response.json();
    },
    onSuccess: (updatedObject) => {
      dispatch({ type: 'UPDATE_OBJECT', payload: updatedObject });
      queryClient.invalidateQueries({ queryKey: ['/api/object-types'] });
      toast({ title: 'Success', description: 'Object updated successfully.' });
      handleClose();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update object.', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attributesArray = attributes.map(a => a.name.trim()).filter(n => n.length > 0);
    const tablejson = tables.map(t => ({
      name: t.name.trim(),
      columns: t.columns.map(c => c.name.trim()).filter(n => n.length > 0),
    }));

    updateObjectMutation.mutate({
      object_type: formData.name,
      description: formData.description,
      parid: object.parid || 0,
      attributes: attributesArray,
      tables: tablejson,
    });
  };

  const handleClose = () => onOpenChange(false);

  // Attribute handlers
  const addAttribute = () => setAttributes([...attributes, { name: '' }]);
  const removeAttribute = (index: number) => setAttributes(attributes.filter((_, i) => i !== index));
  const updateAttribute = (index: number, value: string) => {
    const updated = [...attributes];
    updated[index].name = value;
    setAttributes(updated);
  };

  // Table & column handlers
  const addTable = () =>
    setTables([...tables, { name: `Table ${tables.length + 1}`, columns: [{ name: 'Column 1' }] }]);
  const removeTable = (tableIndex: number) => setTables(tables.filter((_, i) => i !== tableIndex));
  const updateTableName = (tableIndex: number, name: string) => {
    const updated = [...tables];
    updated[tableIndex].name = name;
    setTables(updated);
  };
  const addColumn = (tableIndex: number) => {
    const updated = [...tables];
    updated[tableIndex].columns.push({ name: `Column ${updated[tableIndex].columns.length + 1}` });
    setTables(updated);
  };
  const removeColumn = (tableIndex: number, columnIndex: number) => {
    const updated = [...tables];
    updated[tableIndex].columns.splice(columnIndex, 1);
    setTables(updated);
  };
  const updateColumn = (tableIndex: number, columnIndex: number, name: string) => {
    const updated = [...tables];
    updated[tableIndex].columns[columnIndex].name = name;
    setTables(updated);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Object Type</DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>
          {/* Object type */}
          <TextField
            label="Object Type"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />

          {/* Parent type */}
          <FormControl fullWidth>
            <InputLabel id="type-label">Parent Type</InputLabel>
            <Select
              labelId="type-label"
              value={formData.type}
              label="Parent Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="Object">Object</MenuItem>
              <MenuItem value="Item">Item</MenuItem>
              <MenuItem value="Document">Document</MenuItem>
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            label="Description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={4}
          />

          {/* Attributes */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1">Attributes</Typography>
              <Button size="small" startIcon={<Add />} onClick={addAttribute}>
                Add Attribute
              </Button>
            </Box>
            {attributes.map((attr, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  placeholder="Attribute name"
                  value={attr.name}
                  onChange={e => updateAttribute(index, e.target.value)}
                  fullWidth
                />
                <IconButton color="error" onClick={() => removeAttribute(index)}>
                  <Remove />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* Tables */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1">Tables</Typography>
              <Button size="small" startIcon={<Add />} onClick={addTable}>
                Add Table
              </Button>
            </Box>
            {tables.map((table, tIndex) => (
              <Paper key={tIndex} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <TextField
                    label="Table Name"
                    value={table.name}
                    onChange={(e) => updateTableName(tIndex, e.target.value)}
                    fullWidth
                  />
                  <IconButton color="error" onClick={() => removeTable(tIndex)}>
                    <Remove />
                  </IconButton>
                </Box>

                {table.columns.map((col, cIndex) => (
                  <Box key={cIndex} display="flex" alignItems="center" gap={1} mb={1}>
                    <TextField
                      placeholder="Column name"
                      value={col.name}
                      onChange={(e) => updateColumn(tIndex, cIndex, e.target.value)}
                      fullWidth
                    />
                    <IconButton color="error" onClick={() => removeColumn(tIndex, cIndex)}>
                      <Remove />
                    </IconButton>
                  </Box>
                ))}

                <Button size="small" startIcon={<Add />} onClick={() => addColumn(tIndex)}>
                  Add Column
                </Button>
              </Paper>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">Cancel</Button>
        <Button type="submit" variant="contained" onClick={handleSubmit} disabled={updateObjectMutation.isPending}>
          {updateObjectMutation.isPending ? 'Updating...' : 'Update Object Type'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
