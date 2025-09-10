import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Search, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useObjectContext } from '@/contexts/ObjectContext';
import { apiRequest } from '@/lib/queryClient';

interface AISearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AISearchDialog({ open, onOpenChange }: AISearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const { dispatch } = useObjectContext();
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('POST', '/api/search', { query });
      return response.json();
    },
    onSuccess: (data) => {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: data.results });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: searchQuery });
      
      toast({
        title: "Search Complete",
        description: `Found ${data.results.length} relevant objects.`
      });
      
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Search Error",
        description: "Failed to perform AI search. Please try again.",
        variant: "destructive"
      });
    }
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId?: string }) => {
      const response = await apiRequest('POST', '/api/chat', { message, sessionId });
      return response.json();
    },
    onSuccess: (data) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString() + '-user',
        role: 'user',
        content: chatMessage,
        timestamp: new Date()
      };
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setSessionId(data.sessionId);
      setChatMessage('');
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    searchMutation.mutate(searchQuery);
  };

  const handleChat = () => {
    if (!chatMessage.trim()) return;
    chatMutation.mutate({ message: chatMessage, sessionId: sessionId || undefined });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'search' | 'chat') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (action === 'search') {
        handleSearch();
      } else {
        handleChat();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden" data-testid="ai-search-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI-Powered Search & Chat</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
          {/* Search Panel */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Smart Object Search</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask AI to find objects... (e.g., 'find user management system')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'search')}
                  className="flex-1"
                  data-testid="input-ai-search"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={searchMutation.isPending || !searchQuery.trim()}
                  data-testid="button-ai-search-submit"
                >
                  {searchMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Try these example searches:</p>
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1 text-xs text-left justify-start"
                    onClick={() => setSearchQuery('find all active objects')}
                  >
                    • "find all active objects"
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1 text-xs text-left justify-start"
                    onClick={() => setSearchQuery('show me document type objects')}
                  >
                    • "show me document type objects"
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1 text-xs text-left justify-start"
                    onClick={() => setSearchQuery('user management related objects')}
                  >
                    • "user management related objects"
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="space-y-4 flex flex-col h-96">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>AI Assistant Chat</span>
            </div>
            
            <ScrollArea className="flex-1 border rounded-lg p-4 bg-muted/20">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start a conversation with the AI assistant</p>
                  <p className="text-xs mt-1">Ask questions about objects, relationships, or the system</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      data-testid={`chat-message-${message.id}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card border'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Brain className="h-4 w-4 mt-0.5 text-primary" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-card border rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Ask the AI assistant anything..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'chat')}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button 
                onClick={handleChat}
                disabled={chatMutation.isPending || !chatMessage.trim()}
                data-testid="button-chat-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
