import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useObjectContext } from '@/contexts/ObjectContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface ObjectNode {
  id: number;
  object_type: string;
  description: string;
  parid: number;
  attributes: string[];
  tables: { name: string; columns: string[] }[];
  children?: ObjectNode[];
}

function buildTree(data: ObjectNode[]): ObjectNode[] {
  const map = new Map<number, ObjectNode & { children: ObjectNode[] }>();
  const roots: ObjectNode[] = [];

  data.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  map.forEach(node => {
    if (node.parid === 0) {
      roots.push(node);
    } else {
      const parent = map.get(node.parid);
      if (parent) {
        parent.children!.push(node);
      }
    }
  });

  return roots;
}

function TreeNode({
  node,
  selectedId,
  onSelect,
}: {
  node: ObjectNode;
  selectedId?: number;
  onSelect: (node: ObjectNode) => void;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-2">
      <div className="flex items-center">
        {hasChildren ? (
          <button
            onClick={() => setOpen(!open)}
            className="mr-1 text-muted-foreground"
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-4 mr-1" /> // spacer
        )}

        <Button
          variant="ghost"
          className={cn(
            "flex-1 justify-start p-2 h-auto",
            isSelected && "bg-accent text-accent-foreground"
          )}
          onClick={() => onSelect(node)}
        >
          <div className="flex items-center space-x-2">
            <Folder
              className={cn(
                "h-4 w-4",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="text-foreground">{node.object_type}</span>
          </div>
        </Button>
      </div>

      {hasChildren && open && (
        <div className="ml-4 border-l pl-2">
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({ isOpen, onClose, className }: AdminSidebarProps) {
  const { state, dispatch } = useObjectContext();

  const { data: objects = [], isLoading, refetch } = useQuery<ObjectNode[]>({
    queryKey: ['/api/object-types'],
    queryFn: async () => {
      const response = await fetch('/api/object-types');
      if (!response.ok) throw new Error('Failed to fetch objects');
      return response.json();
    },
  });

  useEffect(() => {
    if (objects.length > 0) {
      dispatch({ type: 'SET_OBJECTS', payload: objects });
    }
  }, [objects, dispatch]);

  const handleObjectSelect = (object: ObjectNode) => {
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: object });
    onClose(); // close sidebar on mobile
  };

  const tree = buildTree(objects);

  return (
    <>
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
            <h2 className="text-lg font-medium text-foreground">Object Tree</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <ChevronRight
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            {tree.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                selectedId={state.selectedObject?.id}
                onSelect={handleObjectSelect}
              />
            ))}
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
