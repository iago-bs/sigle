import {
  Wrench,
  User,
  Settings,
  Laptop,
  LogOut,
  Package,
} from "lucide-react";
import type { AuthUser } from "../hooks/useAuth";

interface RightSidebarProps {
  currentUser?: AuthUser | null;
  onAddClient: () => void;
  onNavigateToClients: () => void;
  onNavigateToPieces: () => void;
  onNavigateToParts: () => void;
  onNavigateToEquipments: () => void;
  onManageTechnicians: () => void;
  onLogout: () => void;
}

export function RightSidebar({
  currentUser,
  onAddClient,
  onNavigateToClients,
  onNavigateToPieces,
  onNavigateToParts,
  onNavigateToEquipments,
  onLogout,
}: RightSidebarProps) {
  return (
    <div className="bg-[#8b7355] text-white h-full px-3 py-4 flex flex-col rounded-l-[30px]">
      <div className="text-center mb-3">
        <div
          style={{
            color: "#FFF",
            textAlign: "center",
            fontFamily: "Lexend Deca, sans-serif",
            fontSize: "36px",
            fontStyle: "normal",
            fontWeight: 200,
            lineHeight: "32px",
            letterSpacing: "5.76px",
          }}
        >
          SIGLE
        </div>
        <div
          style={{
            color: "#FFF",
            fontFamily: "Lexend Deca, sans-serif",
            fontSize: "18px",
            fontStyle: "normal",
            fontWeight: 200,
            lineHeight: "32px",
            letterSpacing: "2.88px",
          }}
        >
          SYSTEM
        </div>
        
        {currentUser && (
          <div
            className="mt-2 text-white/90"
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "10px",
              fontWeight: 300,
              letterSpacing: "0.5px",
            }}
          >
            Olá, <span style={{ fontWeight: 600 }}>@{currentUser.technicianName?.split(' ')[0] || 'Técnico'}</span>
          </div>
        )}
      </div>

      <button
        disabled
        className="bg-gray-300 text-gray-500 rounded-full py-2 px-4 mb-1.5 flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
        title="Funcionalidade desabilitada"
      >
        <span className="text-2xl">+</span>
        <span
          style={{
            fontFamily: "Lexend Deca, sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.6px",
          }}
        >
          NOVA O.S
        </span>
      </button>

      <button
        onClick={onAddClient}
        className="bg-[#d4c5a0] text-black rounded-full py-2 px-4 mb-4 flex items-center justify-center gap-2 hover:bg-[#c4b590] transition-colors"
      >
        <span className="text-2xl">+</span>
        <span
          style={{
            fontFamily: "Lexend Deca, sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.6px",
          }}
        >
          NOVO CLIENTE
        </span>
      </button>

      <nav className="flex flex-col gap-1.5 flex-1">
        <button
          onClick={onNavigateToEquipments}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <Laptop className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            EQUIPAMENTOS
          </span>
        </button>

        <button
          onClick={onNavigateToPieces}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <Wrench className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            PEÇAS
          </span>
        </button>

        <button
          onClick={onNavigateToParts}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <Package className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            ESTOQUE
          </span>
        </button>

        <button
          onClick={onNavigateToClients}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <User className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            CLIENTE
          </span>
        </button>
      </nav>

      <div className="mt-auto pt-3 border-t border-[#7a6345]">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-2 hover:bg-[#6d5a43] rounded-lg transition-colors"
          title="Sair do Sistema"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            SAIR
          </span>
        </button>
      </div>
    </div>
  );
}
