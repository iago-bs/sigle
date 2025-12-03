// Main layout component

import { DateTimeDisplay } from "./DateTimeDisplay";
import { RightSidebar } from "./RightSidebar";
import type { AuthUser } from "../hooks/useAuth";

interface MainLayoutProps {
  currentTime: Date;
  currentUser?: AuthUser | null;
  onAddClient: () => void;
  onNavigateToClients: () => void;
  onNavigateToPieces: () => void;
  onNavigateToParts: () => void;
  onNavigateToEquipments: () => void;
  onLogout: () => void;
}

export function MainLayout({
  currentTime,
  currentUser,
  onAddClient,
  onNavigateToClients,
  onNavigateToPieces,
  onNavigateToParts,
  onNavigateToEquipments,
  onLogout,
}: MainLayoutProps) {

  return (
    <>
      <div className="flex-1 p-4 flex items-center justify-center" style={{ paddingBottom: '80vh' }}>
        <DateTimeDisplay 
          currentTime={currentTime}
        />
      </div>

      {/* Right Sidebar */}
      <div className="w-[200px] flex-shrink-0 h-screen">
        <RightSidebar
          currentUser={currentUser}
          onAddClient={onAddClient}
          onNavigateToClients={onNavigateToClients}
          onNavigateToPieces={onNavigateToPieces}
          onNavigateToParts={onNavigateToParts}
          onNavigateToEquipments={onNavigateToEquipments}
          onLogout={onLogout}
        />
      </div>
    </>
  );
}
