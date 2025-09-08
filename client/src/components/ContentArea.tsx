import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import ObjectInformationTab from './ObjectInformationTab';
import ObjectRelationsTab from './ObjectRelationsTab';
import ObjectHierarchyTab from './ObjectHierarchyTab';
import CreateObjectDialog from './CreateObjectDialog';
import EditObjectDialog from './EditObjectDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { useObjectContext } from '@/contexts/ObjectContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ContentAreaProps {
  className?: string;
}

export default function ContentArea({ className }: ContentAreaProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { state, dispatch } = useObjectContext();
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    dispatch({ 
      type: 'SET_ACTIVE_TAB', 
      payload: value as 'information' | 'relations' | 'hierarchy'
    });
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/reports/full');
      if (!response.ok) throw new Error('Failed to generate report');
      
      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create downloadable file
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `object-design-full-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Generated",
        description: "PDF report has been downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <main className={cn("bg-background", className)} data-testid="content-area">
      {/* Action Bar */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-create-object"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Object
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              disabled={!state.selectedObject}
              data-testid="button-edit-object"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!state.selectedObject}
              data-testid="button-delete-object"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
          <Button
            onClick={handleGenerateReport}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            data-testid="button-generate-report"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Tab Navigation and Content */}
      <Tabs value={state.activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start bg-card border-b rounded-none px-6">
          <TabsTrigger 
            value="information" 
            className="data-[state=active]:bg-accent/50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            data-testid="tab-information"
          >
            Object Information
          </TabsTrigger>
          <TabsTrigger 
            value="relations"
            className="data-[state=active]:bg-accent/50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            data-testid="tab-relations"
          >
            Object Relations
          </TabsTrigger>
          <TabsTrigger 
            value="hierarchy"
            className="data-[state=active]:bg-accent/50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            data-testid="tab-hierarchy"
          >
            Object Hierarchy
          </TabsTrigger>
        </TabsList>

        <div className="p-6 overflow-y-auto">
          <TabsContent value="information" className="mt-0">
            <ObjectInformationTab />
          </TabsContent>
          
          <TabsContent value="relations" className="mt-0">
            <ObjectRelationsTab />
          </TabsContent>
          
          <TabsContent value="hierarchy" className="mt-0">
            <ObjectHierarchyTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <CreateObjectDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      {state.selectedObject && (
        <>
          <EditObjectDialog 
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            object={state.selectedObject}
          />
          
          <DeleteConfirmDialog 
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            object={state.selectedObject}
          />
        </>
      )}
    </main>
  );
}
