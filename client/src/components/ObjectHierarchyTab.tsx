import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Flag, ChevronRight, Plus } from 'lucide-react';
import { useObjectContext } from '@/contexts/ObjectContext';
import { Hierarchy } from '@shared/schema';

export default function ObjectHierarchyTab() {
  const { state } = useObjectContext();

  const { data: hierarchies = [] } = useQuery<Hierarchy[]>({
    queryKey: ['/api/objects', state.selectedObject?.id, 'hierarchy'],
    enabled: !!state.selectedObject,
  });

  if (!state.selectedObject) {
    return (
      <div className="text-center py-12" data-testid="no-object-selected">
        <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Object Selected</h3>
        <p className="text-muted-foreground">Select an object from the sidebar to view its hierarchy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="object-hierarchy-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5" />
            <span>Object Hierarchy</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Manage parent-child relationships and hierarchical structure of objects.
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Hierarchy Tree */}
          <div className="border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-foreground">Hierarchy Tree</h4>
              <Button size="sm" data-testid="button-add-child">
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </div>
            
            <div className="space-y-2">
              {/* Root Level */}
              <div className="flex items-center space-x-2 p-2" data-testid="hierarchy-root">
                <Flag className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{state.selectedObject.name}</span>
                <Badge className="bg-primary/10 text-primary text-xs">Root</Badge>
              </div>
              
              {/* Sample hierarchy structure based on the selected object */}
              {state.selectedObject.name === "User Management System" && (
                <div className="ml-8 space-y-2">
                  <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded" data-testid="hierarchy-level-1">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Authentication Module</span>
                    <Badge variant="secondary" className="text-xs">Level 1</Badge>
                  </div>
                  
                  {/* Level 2 Children */}
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded" data-testid="hierarchy-level-2-1">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">Login Service</span>
                      <Badge variant="outline" className="text-xs">Level 2</Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded" data-testid="hierarchy-level-2-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">Password Reset</span>
                      <Badge variant="outline" className="text-xs">Level 2</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded" data-testid="hierarchy-level-1-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Permission Manager</span>
                    <Badge variant="secondary" className="text-xs">Level 1</Badge>
                  </div>
                </div>
              )}

              {hierarchies.length === 0 && state.selectedObject.name !== "User Management System" && (
                <div className="ml-8 text-sm text-muted-foreground p-2">
                  No child objects defined. Use the "Add Child" button to create hierarchy levels.
                </div>
              )}
            </div>
          </div>

          {/* Hierarchy Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Level Properties</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure properties for the selected hierarchy level.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level-name">Level Name</Label>
                  <Input 
                    id="level-name"
                    defaultValue="Authentication Module" 
                    data-testid="input-level-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level-type">Level Type</Label>
                  <Select defaultValue="module">
                    <SelectTrigger data-testid="select-level-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="module">Module</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="component">Component</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input 
                    id="priority"
                    type="number" 
                    defaultValue="1" 
                    data-testid="input-priority"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button data-testid="button-save-properties">
                  Save Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
