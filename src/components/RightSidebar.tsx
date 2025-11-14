import {
  FileText,
  ShieldCheck,
  FileEdit,
  Receipt,
  Wrench,
  User,
  Settings,
  UserCog,
  Laptop,
  LogOut,
} from "lucide-react";
import { Badge } from "./ui/badge";
import type { AuthUser } from "../hooks/useAuth";

// TODO: Backend - Replace with real notification counts from database
const menuItems = [
  { icon: FileText, label: "HISTÓRICO", badge: 0 },
  { icon: ShieldCheck, label: "GARANTIAS", badge: 3 },
  { icon: FileEdit, label: "ORÇAMENTOS", badge: 5 },
  { icon: Receipt, label: "NOTAS FISCAIS", badge: 0 },
  { icon: Wrench, label: "PEÇAS", badge: 2 },
  { icon: User, label: "CLIENTE", badge: 0 },
  { icon: Settings, label: "CONFIGURAÇÕES", badge: 0 },
];

interface RightSidebarProps {
  currentUser?: AuthUser | null;
  onAddServiceOrder: () => void;
  onAddClient: () => void;
  onNavigateToHistory: () => void;
  onNavigateToClients: () => void;
  onNavigateToParts: () => void;
  onNavigateToWarranties: () => void;
  onNavigateToBudgets: () => void;
  onNavigateToInvoices: () => void;
  onNavigateToEquipments: () => void;
  onNavigateToVariables: () => void;
  onManageTechnicians: () => void;
  onLogout: () => void;
}

export function RightSidebar({
  currentUser,
  onAddServiceOrder,
  onAddClient,
  onNavigateToHistory,
  onNavigateToClients,
  onNavigateToParts,
  onNavigateToWarranties,
  onNavigateToBudgets,
  onNavigateToInvoices,
  onNavigateToEquipments,
  onNavigateToVariables,
  onManageTechnicians,
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
        
        {/* Current User Greeting */}
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
        onClick={onAddServiceOrder}
        className="bg-[#d4c5a0] text-black rounded-full py-2 px-4 mb-1.5 flex items-center justify-center gap-2 hover:bg-[#c4b590] transition-colors"
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
        {/* HISTÓRICO button - now functional */}
        <button
          onClick={onNavigateToHistory}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            HISTÓRICO
          </span>
        </button>

        {/* GARANTIAS button */}
        <button
          onClick={onNavigateToWarranties}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            GARANTIAS
          </span>
          {3 > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              3
            </Badge>
          )}
        </button>

        {/* ORÇAMENTOS button */}
        <button
          onClick={onNavigateToBudgets}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <FileEdit className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            ORÇAMENTOS
          </span>
          {5 > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              5
            </Badge>
          )}
        </button>

        {/* NOTAS FISCAIS button */}
        <button
          onClick={onNavigateToInvoices}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <Receipt className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            NOTAS FISCAIS
          </span>
        </button>

        {/* PEÇAS button - now functional */}
        <button
          onClick={onNavigateToParts}
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
          {2 > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              2
            </Badge>
          )}
        </button>

        {/* EQUIPAMENTOS button - Análise estatística */}
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

        {/* VARIÁVEIS button */}
        <button
          onClick={onNavigateToVariables}
          className="flex items-center justify-center gap-2 py-1.5 px-2 hover:bg-[#7a6345] rounded-lg transition-colors relative"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span
            style={{
              fontFamily: "Lexend Deca, sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.4px",
              textAlign: "center",
            }}
          >
            VARIÁVEIS
          </span>
        </button>

        {/* CLIENTE button - now functional */}
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

      {/* Bottom Section - Logout */}
      <div className="mt-auto pt-3 border-t border-[#7a6345]">
        {/* Logout Button */}
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