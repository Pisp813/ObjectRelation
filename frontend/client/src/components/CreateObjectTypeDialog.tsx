import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useObjectContext } from '@/contexts/ObjectContext';
import { apiRequest } from '@/lib/queryClient';
import { insertObjectSchema } from '@shared/schema';
import { log } from 'console';

interface CreateObjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AttributeField {
  name: string;
}

interface Column {
  name: string;
}

interface TableData {
  name:string;
  columns: Column[];
}

export default function CreateObjectTypeDialog({ open, onOpenChange }: CreateObjectDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
  });
  const [attributes, setAttributes] = useState<AttributeField[]>([]);
  
  const { dispatch } = useObjectContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createHierarchyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/hierarchy-types', data);
    },
    onSuccess: async (response) => {
      toast({
        title: "Hierarchy Created",
        description: "Hierarchy type created automatically.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create hierarchy type.",
        variant: "destructive",
      });
    },
  });
  

  const createObjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/object-types', data);
    },
    onSuccess: async (response) => {
      const newObject = await response.json();
  
      // Dispatch and invalidate queries as before
      dispatch({ type: 'ADD_OBJECT', payload: newObject });
      queryClient.invalidateQueries({ queryKey: ['/api/object-types'] });
      
      toast({
        title: "Success",
        description: "Object created successfully."
      });
  
      // Automatically create hierarchy type
      const hierarchyData = {
        object_type: newObject.id,  // Use the newly created object ID
        inventory: attributes.map(attr => attr.name), // Or any default inventory
        purchase: [], // Can be empty initially or derived from attributes
      };
  
      createHierarchyMutation.mutate(hierarchyData);
  
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create object. Please check your input and try again.",
        variant: "destructive"
      });
    }
  });
  

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert attributes array to object
    const attributesArray = attributes
      .map(attr => attr.name.trim())
      .filter(name => name.length > 0);
    const tablejson = tables.map(table => ({
      name: table.name.trim(),
      columns: table.columns
        .map(col => col.name.trim())
        .filter(name => name.length > 0)
    }));
    
    //const attributesJson = JSON.stringify(attributesArray);
    const submitData = {
      object_type: formData.name,
      description: formData.description,
      parid: 0,
      attributes: attributesArray,
      tables: tablejson
    };

    createObjectMutation.mutate(submitData);
    
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', type: 'Item' });
    setAttributes([]);
    onOpenChange(false);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: ''}]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: 'name' | 'value', value: string) => {
    const updated = attributes.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    );
    setAttributes(updated);
  };

  const [tables, setTables] = useState<TableData[]>([]);

  const addTable = () => {
    setTables([...tables, { name: `Table ${tables.length + 1}`, columns: [{ name: "Column 1" }] }]);
  };

  const addColumn = (tableIndex: number) => {
    const updated = [...tables];
    updated[tableIndex].columns.push({
      name: `Column ${updated[tableIndex].columns.length + 1}`,
    });
    setTables(updated);
  };

  const updateColumn = (
    tableIndex: number,
    columnIndex: number,
    name: string
  ) => {
    const updated = [...tables];
    updated[tableIndex].columns[columnIndex].name = name;
    setTables(updated);
  };

  const removeColumn = (tableIndex: number, columnIndex: number) => {
    const updated = [...tables];
    updated[tableIndex].columns.splice(columnIndex, 1);
    setTables(updated);
  };

  const removeTable = (tableIndex: number) => {
    const updated = [...tables];
    updated.splice(tableIndex, 1);
    setTables(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-object-dialog">
        <DialogHeader>
          <DialogTitle>Create New Object Type</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="name">Object Type *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter object type"
              data-testid="input-object-type"
            />
          </div>
           
          <div className="space-y-2">
              <Label htmlFor="type">Parent Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'Object' | 'Item' | 'Document') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger data-testid="select-object-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Object">Object</SelectItem>
                  {/* <SelectItem value="Item">Item</SelectItem>
                  <SelectItem value="Document">Document</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter object type description"
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Attributes</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addAttribute}
                data-testid="button-add-attribute"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>
            
            {attributes.length > 0 && (
              <div className="space-y-3">
                {attributes.map((attribute, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Input
                      placeholder="Attribute name"
                      value={attribute.name}
                      onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                      className="flex-1"
                      data-testid={`input-attribute-name-${index}`}
                    />
                   
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAttribute(index)}
                      data-testid={`button-remove-attribute-${index}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label>Tables</Label>
        <Button type="button" variant="outline" size="sm" onClick={addTable}>
          <Plus className="h-4 w-4 mr-2" />
          Add Table
        </Button>
      </div>

      {tables.map((table, tIndex) => (
        <div key={tIndex} className="border p-4 rounded-lg space-y-4">
          <div className="flex flex-col space-y-2">
            <Input
              placeholder="Table name"
              value={table.name}
              onChange={(e) => {
                const updated = [...tables];
                updated[tIndex].name = e.target.value;
                setTables(updated);
              }}
              data-testid={`input-table-name-${tIndex}`}
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Table {tIndex + 1}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeTable(tIndex)}
            >
              <Minus className="h-4 w-4 mr-2" />
              Remove Table
            </Button>
          </div>

          {/* Column Headers */}
          <div className="space-y-3">
            {table.columns.map((col, cIndex) => (
              <div
                key={cIndex}
                className="flex items-center space-x-3"
              >
                <Input
                  placeholder="Column header"
                  value={col.name}
                  onChange={(e) =>
                    updateColumn(tIndex, cIndex, e.target.value)
                  }
                  className="flex-1"
                  data-testid={`input-table-${tIndex}-column-${cIndex}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeColumn(tIndex, cIndex)}
                  data-testid={`button-remove-column-${tIndex}-${cIndex}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Column Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addColumn(tIndex)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      ))}
    </div>
  

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createObjectMutation.isPending}
              data-testid="button-create"
            >
              {createObjectMutation.isPending ? 'Creating...' : 'Create Object Type'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
