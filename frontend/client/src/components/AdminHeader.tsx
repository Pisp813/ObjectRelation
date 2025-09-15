import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Search, MessageCircle, BriefcaseBusiness, Settings } from 'lucide-react';
import AISearchDialog from './AISearchDialog';
import { useObjectContext } from '@/contexts/ObjectContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const { state, dispatch } = useObjectContext();

  // Check if current user is admin
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = currentUser?.username === 'admin';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card shadow-sm border-b h-16" data-testid="header">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            data-testid="button-toggle-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Search className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-medium text-foreground">Object Types</h1>
          </div>
          
          {/* <div className="flex items-center space-x-2 max-w-md flex-1">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search objects..."
                value={state.searchQuery}
                onChange={handleSearchChange}
                className="w-full pr-10"
                data-testid="input-search"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              onClick={() => setIsAISearchOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-ai-search"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AIAsk
            </Button>
          </div> */}
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                title="Admin Panel"
                data-testid="button-admin"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <div className="flex items-center space-x-2">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <span className="text-foreground font-medium">Company Name</span>
          </div>
        </div>
      </div>

      <AISearchDialog 
        open={isAISearchOpen} 
        onOpenChange={setIsAISearchOpen}
        data-testid="ai-search-dialog"
      />
    </header>
  );
}
