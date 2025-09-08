import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ContentArea from "@/components/ContentArea";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background" data-testid="app-container">
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        data-testid="header"
      />
      
      <div className="flex pt-16 min-h-screen">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          data-testid="sidebar"
        />
        
        <ContentArea 
          className={`flex-1 ${isSidebarOpen && !isMobile ? 'ml-1/4' : ''}`}
          data-testid="content-area"
        />
      </div>
    </div>
  );
}
