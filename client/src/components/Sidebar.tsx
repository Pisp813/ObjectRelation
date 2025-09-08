import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Package, 
  Settings, 
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useObjectContext } from '@/contexts/ObjectContext';
import { ObjectType } from '@shared/schema';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const { state, dispatch } = useObjectContext();

  const { data: objects = [], isLoading, refetch } = useQuery<ObjectType[]>({
    queryKey: ['/api/objects'],
    queryFn: async () => {
      const response = await fetch('/api/objects');
      if (!response.ok) throw new Error('Failed to fetch objects');
      return response.json();
    }
  });

  useEffect(() => {
    if (objects.length > 0) {
      dispatch({ type: 'SET_OBJECTS', payload: objects });
    }
  }, [objects, dispatch]);

  const handleObjectSelect = (object: ObjectType) => {
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: object });
    onClose(); // Close sidebar on mobile after selection
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'Document':
        return FileText;
      case 'Item':
      default:
        return Package;
    }
  };

  // Group objects by type for tree structure
  const systemObjects = objects.filter(obj => obj.type === 'Item');
  const documents = objects.filter(obj => obj.type === 'Document');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      <aside 
        className={cn(
          "fixed left-0 top-16 bottom-0 w-1/4 min-w-80 bg-card border-r shadow-sm z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        data-testid="sidebar"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">Objects</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2">
              {/* System Objects Folder */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    data-testid="folder-system-objects"
                  >
                    <div className="flex items-center space-x-2">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">System Objects</span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 space-y-1">
                  {systemObjects.map((object) => {
                    const IconComponent = getObjectIcon(object.type);
                    const isSelected = state.selectedObject?.id === object.id;
                    
                    return (
                      <Button
                        key={object.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start p-2 h-auto",
                          isSelected && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => handleObjectSelect(object)}
                        data-testid={`object-${object.id}`}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className={cn(
                            "h-4 w-4",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className="text-foreground">{object.name}</span>
                        </div>
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              {/* Documents Folder */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    data-testid="folder-documents"
                  >
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">Documents</span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 space-y-1">
                  {documents.map((object) => {
                    const IconComponent = getObjectIcon(object.type);
                    const isSelected = state.selectedObject?.id === object.id;
                    
                    return (
                      <Button
                        key={object.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start p-2 h-auto",
                          isSelected && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => handleObjectSelect(object)}
                        data-testid={`object-${object.id}`}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className={cn(
                            "h-4 w-4",
                            isSelected ? "text-secondary" : "text-muted-foreground"
                          )} />
                          <span className="text-foreground">{object.name}</span>
                        </div>
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              {/* Data Models Folder (placeholder for future expansion) */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    data-testid="folder-data-models"
                  >
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">Data Models</span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 space-y-1">
                  <div className="text-sm text-muted-foreground p-2">No data models yet</div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
