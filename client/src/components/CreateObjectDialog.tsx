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

interface CreateObjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AttributeField {
  name: string;
  value: string;
}

export default function CreateObjectDialog({ open, onOpenChange }: CreateObjectDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Item' as 'Item' | 'Document',
  });
  const [attributes, setAttributes] = useState<AttributeField[]>([]);
  
  const { dispatch } = useObjectContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createObjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const validatedData = insertObjectSchema.parse(data);
      return apiRequest('POST', '/api/objects', validatedData);
    },
    onSuccess: async (response) => {
      const newObject = await response.json();
      dispatch({ type: 'ADD_OBJECT', payload: newObject });
      queryClient.invalidateQueries({ queryKey: ['/api/objects'] });
      
      toast({
        title: "Success",
        description: "Object created successfully."
      });
      
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
    const attributesObject = attributes.reduce((acc, attr) => {
      if (attr.name.trim() && attr.value.trim()) {
        acc[attr.name.trim()] = attr.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const submitData = {
      ...formData,
      attributes: attributesObject,
      tables: []
    };

    createObjectMutation.mutate(submitData);
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', type: 'Item' });
    setAttributes([]);
    onOpenChange(false);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', value: '' }]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-object-dialog">
        <DialogHeader>
          <DialogTitle>Create New Object</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Object Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter object name"
                data-testid="input-object-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Object Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'Item' | 'Document') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger data-testid="select-object-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Item">Item</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter object description"
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
                    <Input
                      placeholder="Attribute value"
                      value={attribute.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      className="flex-1"
                      data-testid={`input-attribute-value-${index}`}
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
              {createObjectMutation.isPending ? 'Creating...' : 'Create Object'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
