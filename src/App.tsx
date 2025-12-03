// Main application entry point - Refactored for better modularity with organized component structure

import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";

// Types
import type { Appointment, Part, StockPart, PageType, Equipment, Piece } from "./types";
import { type Client as DBClient, useClients } from "./hooks/useClients";

// Constants
import { 
  STORAGE_KEYS, 
  initialClients, 
  initialAppointments, 
  initialParts,
  initialStockParts,
  DEFAULT_SHOP_TOKEN
} from "./lib/constants";
import { projectId, publicAnonKey } from "./utils/supabase/info";

// Custom Hooks
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useClock } from "./hooks/useClock";
import { useAuth } from "./hooks/useAuth";
// useClients type imported above
import { useParts } from "./hooks/useParts";
import { useEquipments } from "./hooks/useEquipments";
import { usePieces } from "./hooks/usePieces";
import { useStockParts } from "./hooks/useStockParts";
import { AddPieceModal } from "./components/AddPieceModal";
import { EditPieceModal } from "./components/EditPieceModal";
import { PiecesPage } from "./components/PiecesPage";

// Utils
import { formatDateBR, calculateWarrantyEndDate } from "./lib/date-utils";

// ==================== COMPONENTS - ORGANIZED BY CATEGORY ====================

// Agendamentos (Appointments)
import { AddAppointmentModal } from "./components/AddAppointmentModal";

// Clientes (Clients) - Using organized folder
import { AddClientModal } from "./components/clientes/AddClientModal";
import { EditClientModal } from "./components/clientes/EditClientModal";
import { ClientsPage } from "./components/ClientsPage";
import { InactiveClientsPage } from "./components/InactiveClientsPage";

// Equipamentos (Equipment)
import { AddEquipmentModal } from "./components/AddEquipmentModal";
import { EditEquipmentModal } from "./components/EditEquipmentModal";
import { EquipmentsPage } from "./components/EquipmentsPage";

// Layout
import { MainLayout } from "./components/MainLayout";

// Peças (Parts)
import { AddPartModal } from "./components/AddPartModal";
import { AddStockPartModal } from "./components/AddStockPartModal";
import { EditPartModal } from "./components/EditPartModal";
import { EditStockPartModal } from "./components/EditStockPartModal";
import { PartsPage } from "./components/PartsPage";

// UI Components
import { Toaster } from "./components/ui/sonner";
import { ConfirmDialog } from "./components/ConfirmDialog";

export default function App() {
  // Authentication
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  // Modo loja única: usa token padrão (UUID)

  // Custom hooks for state management with Supabase
  const currentTime = useClock();
  const { clients, setClients, createClient, fetchClients } = useClients();
  const { parts, createPart, updatePart, deletePart } = useParts();
  const { equipments, setEquipments, fetchEquipments, createEquipment, updateEquipment, deleteEquipment } = useEquipments();
  const { pieces, createPiece, updatePiece, deletePiece, fetchPieces } = usePieces();
  const { stockParts, setStockParts, createStockPart, updateStockPart, deleteStockPart } = useStockParts();
  
  // Still using localStorage for these (to be migrated later)
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
  
  // Page navigation state
  const [currentPage, setCurrentPage] = useState<PageType>("main");
  
  // Modal states
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isStockPartModalOpen, setIsStockPartModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isPieceModalOpen, setIsPieceModalOpen] = useState(false);
  const [isEditPieceModalOpen, setIsEditPieceModalOpen] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);
  const [selectedPieceFromAdd, setSelectedPieceFromAdd] = useState<Piece | null>(null);
  const [isFromStockModal, setIsFromStockModal] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isEditPartModalOpen, setIsEditPartModalOpen] = useState(false);
  const [isEditStockPartModalOpen, setIsEditStockPartModalOpen] = useState(false);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
    variant: "danger"
  });
  
  // Edit states
  const [clientToEdit, setClientToEdit] = useState<DBClient | null>(null);
  const [partToEdit, setPartToEdit] = useState<Part | null>(null);
  const [stockPartToEdit, setStockPartToEdit] = useState<StockPart | null>(null);
  const [isIndividualStockEdit, setIsIndividualStockEdit] = useState(false); // Modo de edição
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // ==================== TYPE CONVERTERS ====================
  
  // Convert Supabase Part to Frontend Part
  const convertSupabasePartToFrontend = (supabasePart: any): Part => {
    return {
      id: supabasePart.id,
      name: supabasePart.name,
      osNumber: supabasePart.os_number || '',
      osDescription: supabasePart.equipment_type || '',
      quantity: supabasePart.quantity,
      unit: supabasePart.notes || '',
      status: supabasePart.status as Part["status"],
      urgent: false, // TODO: Add urgent field to Supabase
      price: supabasePart.unit_price ? `R$ ${supabasePart.unit_price.toFixed(2)}` : undefined,
      orderDate: supabasePart.created_at ? new Date(supabasePart.created_at).toLocaleDateString('pt-BR') : undefined,
      expectedDate: supabasePart.estimated_arrival_date ? new Date(supabasePart.estimated_arrival_date).toLocaleDateString('pt-BR') : undefined,
    };
  };

  // Convert frontend parts to display format
  const frontendParts: Part[] = parts.map(convertSupabasePartToFrontend);

  // ==================== HANDLERS ====================

  // Logout desativado no modo loja única
  const handleLogout = () => {
    toast.info("Logout desativado no modo loja única");
  };

  // Drag and drop handler for appointments
  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setAppointments((prevCards) => {
      const newCards = [...prevCards];
      const draggedCard = newCards[dragIndex];
      newCards.splice(dragIndex, 1);
      newCards.splice(hoverIndex, 0, draggedCard);
      return newCards;
    });
  }, [setAppointments]);

  // Client creation handled in modal via hooks

  // Handler to add new part
  const handleAddPart = async (part: Part) => {
    try {
      await createPart({
        name: part.name,
        quantity: part.quantity,
        unit_price: 0, // TODO: Add price field to Part type
        os_number: part.osNumber,
        equipment_type: part.osDescription,
        status: part.status,
        notes: part.unit,
      });
      // Toast message is now shown in AddPartModal for better context
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error("Erro ao adicionar peça");
    }
  };

  // Handler to add stock part
  const handleAddStockPart = async (stockPartData: Omit<StockPart, 'id' | 'shop_token' | 'created_at' | 'updated_at'>) => {
    try {
      await createStockPart({
        pieceId: stockPartData.piece_id || stockPartData.pieceId,
        name: stockPartData.name,
        description: stockPartData.description,
        quantity: stockPartData.quantity,
        price: stockPartData.price,
        addedAt: stockPartData.added_at || stockPartData.addedAt,
        isAdjustment: stockPartData.is_adjustment,
        adjustmentReason: stockPartData.adjustment_reason,
      });
      toast.success("Peça adicionada ao estoque com sucesso!");
    } catch (error) {
      console.error('Error adding stock part:', error);
      toast.error("Erro ao adicionar peça ao estoque");
    }
  };

  // Handler to add new appointment
  const handleAddAppointment = (appointment: Appointment) => {
    setAppointments([...appointments, appointment]);
    toast.success("Agendamento criado com sucesso!");
  };

  // Handler to edit client
  const handleEditClient = (client: DBClient) => {
    setClientToEdit(client);
    setIsEditClientModalOpen(true);
  };

  // Handler to edit part
  const handleEditPart = (part: Part) => {
    setPartToEdit(part);
    setIsEditPartModalOpen(true);
  };

  // Handler to update part
  const handleUpdatePart = async (updatedPart: Part) => {
    try {
      await updatePart(updatedPart.id, {
        name: updatedPart.name,
        quantity: updatedPart.quantity,
        unit_price: 0, // TODO: Add price field
        os_number: updatedPart.osNumber,
        equipment_type: updatedPart.osDescription,
        status: updatedPart.status,
        notes: updatedPart.unit,
      });
      toast.success("Peça atualizada com sucesso!");
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error("Erro ao atualizar peça");
    }
  };

  // Handler to delete part
  const handleDeletePart = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Excluir Peça",
      description: "Tem certeza que deseja excluir esta peça? Esta ação não pode ser desfeita.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deletePart(id);
          toast.success("Peça excluída com sucesso");
        } catch (error) {
          console.error('Error deleting part:', error);
          toast.error("Erro ao excluir peça");
        }
      }
    });
  };

  // Handler to edit stock part
  const handleEditStockPart = (stockPart: StockPart, isIndividual: boolean = false) => {
    setStockPartToEdit(stockPart);
    setIsIndividualStockEdit(isIndividual);
    setIsEditStockPartModalOpen(true);
  };

  // Handler to update stock part (generates adjustment entries)
  const handleUpdateStockPart = async (pieceId: string, newQuantity: number, newPrice: number, newDate: string) => {
    if (!stockPartToEdit || !pieceId) return;

    // Calculate current total quantity for this piece
    const currentTotalQuantity = stockParts
      .filter(sp => sp.piece_id === pieceId)
      .reduce((sum, sp) => sum + (sp.quantity || 0), 0);

    const quantityDiff = newQuantity - currentTotalQuantity;

    // Only create adjustment if there's a difference
    if (quantityDiff !== 0) {
      try {
        const piece = pieces.find(p => p.id === pieceId);
        await createStockPart({
          pieceId: pieceId,
          name: piece?.name || stockPartToEdit.name,
          quantity: quantityDiff,
          price: newPrice,
          addedAt: `${newDate}T12:00:00.000Z`,
          isAdjustment: true,
          adjustmentReason: 'Ajuste manual de estoque'
        });
        toast.success(
          quantityDiff > 0
            ? `Adicionado ajuste de +${quantityDiff} unidades ao estoque`
            : `Adicionado ajuste de ${quantityDiff} unidades ao estoque`
        );
      } catch (error) {
        console.error('Error updating stock:', error);
        toast.error("Erro ao atualizar estoque");
      }
    } else {
      toast.info("Nenhuma alteração de quantidade foi feita");
    }

    setIsEditStockPartModalOpen(false);
    setStockPartToEdit(null);
    setIsIndividualStockEdit(false);
  };

  // Handler to update individual stock part record (direct update)
  const handleUpdateIndividualStockPart = async (updatedStockPart: StockPart) => {
    try {
      await updateStockPart(updatedStockPart.id, {
        quantity: updatedStockPart.quantity,
        price: updatedStockPart.price,
        description: updatedStockPart.description,
      });
      toast.success("Movimentação atualizada com sucesso!");
    } catch (error) {
      console.error('Error updating stock part:', error);
      toast.error("Erro ao atualizar movimentação");
    }
    setIsEditStockPartModalOpen(false);
    setStockPartToEdit(null);
    setIsIndividualStockEdit(false);
  };

  // Handler to delete stock part from aggregated view (generates negative entry to zero stock)
  const handleDeleteStockPart = (pieceId: string) => {
    const stockPart = stockParts.find(sp => sp.piece_id === pieceId);
    if (!stockPart) return;

    // Calculate current total quantity for this piece
    const currentTotalQuantity = stockParts
      .filter(sp => sp.piece_id === pieceId)
      .reduce((sum, sp) => sum + (sp.quantity || 0), 0);

    setConfirmDialog({
      open: true,
      title: "Remover do Estoque",
      description: `Tem certeza que deseja remover esta peça do estoque? Será criado um ajuste de -${currentTotalQuantity} unidades no histórico.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const piece = pieces.find(p => p.id === pieceId);
          await createStockPart({
            pieceId: pieceId,
            name: piece?.name || stockPart.name,
            quantity: -currentTotalQuantity,
            price: stockPart.price,
            addedAt: new Date().toISOString(),
            isAdjustment: true,
            adjustmentReason: 'Remoção completa do estoque'
          });
          toast.success("Peça removida do estoque (ajuste negativo criado no histórico)");
        } catch (error) {
          console.error('Error removing from stock:', error);
          toast.error("Erro ao remover do estoque");
        }
      }
    });
  };

  // Handler to delete individual stock part record (direct deletion from history)
  const handleDeleteIndividualStockPart = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Excluir Movimentação",
      description: "Tem certeza que deseja excluir esta movimentação? A quantidade agregada será recalculada automaticamente.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteStockPart(id);
          toast.success("Movimentação excluída com sucesso");
        } catch (error) {
          console.error('Error deleting stock part:', error);
          toast.error("Erro ao excluir movimentação");
        }
      }
    });
  };

  // Handler to add equipment manually
  const handleAddEquipment = async (equipment: Equipment) => {
    try {
      await createEquipment({
        brand: equipment.brand,
        model: equipment.model,
        device: equipment.device,
        serialNumber: equipment.serialNumber,
        notes: equipment.notes,
      });
      toast.success("Equipamento adicionado com sucesso!");
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao adicionar equipamento");
    }
  };

  const handleAddPiece = async (pieceData: Omit<Piece, "id" | "createdAt">) => {
    try {
      const newPiece = await createPiece(pieceData);
      toast.success("Peça cadastrada com sucesso!");
      return newPiece;
    } catch (error) {
      console.error('Erro ao cadastrar peça:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar peça");
      throw error;
    }
  };



  // ==================== RENDER ====================

  // Modo loja única: sem autenticação, segue para a aplicação principal

  // User is authenticated - show main application
  return (
    <DndProvider backend={HTML5Backend}>
      <Toaster position="top-right" />
      <div className="h-screen bg-[#f5f0e8] overflow-hidden flex">
        {/* Page Routing */}
        {currentPage === "clients" ? (
          <ClientsPage 
            onBack={() => setCurrentPage("main")}
            onViewInactive={() => setCurrentPage("inactive-clients")}
          />
        ) : currentPage === "inactive-clients" ? (
          <InactiveClientsPage 
            onBack={() => setCurrentPage("clients")}
          />
        ) : currentPage === "parts" ? (
          <PartsPage
            onBack={() => setCurrentPage("main")}
            parts={frontendParts}
            stockParts={stockParts}
            pieces={pieces}
            onAddPart={() => setIsPartModalOpen(true)}
            onAddStockPart={() => setIsStockPartModalOpen(true)}
            onEditPart={handleEditPart}
            onDeletePart={handleDeletePart}
            onEditStockPart={handleEditStockPart}
            onDeleteStockPart={handleDeleteStockPart}
            onDeleteIndividualStockPart={handleDeleteIndividualStockPart}
          />
        ) : currentPage === "equipments" ? (
          <EquipmentsPage 
            onBack={() => setCurrentPage("main")}
            equipments={equipments}
            clients={clients}
            onAddEquipment={() => setIsEquipmentModalOpen(true)}
            onEditEquipment={(equipment) => {
              setEditingEquipment(equipment);
              setIsEditEquipmentModalOpen(true);
            }}
            onDeleteEquipment={async (equipmentId: string) => {
              const result = await deleteEquipment(equipmentId);
              if (result.action === 'inactivated') {
                toast.info(result.message);
              } else {
                toast.success(result.message);
              }
            }}
            onReactivateEquipment={async (equipmentId: string) => {
              try {
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/equipments/${equipmentId}/reactivate`,
                  {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${publicAnonKey}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                
                if (!response.ok) {
                  throw new Error('Erro ao reativar equipamento');
                }
                
                await fetchEquipments();
                toast.success("Equipamento reativado com sucesso!");
              } catch (error) {
                console.error('Error reactivating equipment:', error);
                toast.error("Erro ao reativar equipamento");
              }
            }}
            onCreateClient={async (clientData) => {
              await createClient(clientData);
              toast.success("Cliente criado com sucesso!");
            }}
          />
        ) : currentPage === "pieces" ? (
          <PiecesPage
            onBack={() => setCurrentPage("main")}
            pieces={pieces}
            onAddPiece={() => setIsPieceModalOpen(true)}
            onEditPiece={(piece) => {
              setEditingPiece(piece);
              setIsEditPieceModalOpen(true);
            }}
            onDeletePiece={async (pieceId: string) => {
              const result = await deletePiece(pieceId);
              if (result.action === 'inactivated') {
                toast.info(result.message);
              } else {
                toast.success(result.message);
              }
            }}
            onReactivatePiece={async (pieceId: string) => {
              try {
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/pieces/${pieceId}/reactivate`,
                  {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${publicAnonKey}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                
                if (!response.ok) {
                  throw new Error('Erro ao reativar peça');
                }
                
                await fetchPieces();
                toast.success("Peça reativada com sucesso!");
              } catch (error) {
                console.error('Error reactivating piece:', error);
                toast.error("Erro ao reativar peça");
              }
            }}
          />
        ) : (
          <MainLayout
            currentTime={currentTime}
            currentUser={user}
            onAddClient={() => setIsClientModalOpen(true)}
            onNavigateToClients={() => setCurrentPage("clients")}
            onNavigateToPieces={() => setCurrentPage("pieces")}
            onNavigateToParts={() => setCurrentPage("parts")}
            onNavigateToEquipments={() => setCurrentPage("equipments")}
            onLogout={handleLogout}
          />
        )}

        {/* Modals */}
        <AddClientModal 
          open={isClientModalOpen} 
          onOpenChange={setIsClientModalOpen}
        />
        <AddAppointmentModal 
          open={isAppointmentModalOpen} 
          onOpenChange={setIsAppointmentModalOpen}
          onAddAppointment={handleAddAppointment}
        />
        <AddPartModal 
          open={isPartModalOpen} 
          onOpenChange={setIsPartModalOpen}
          onAddPart={handleAddPart}
        />
        <AddStockPartModal
          isOpen={isStockPartModalOpen}
          onClose={() => {
            setIsStockPartModalOpen(false);
            setSelectedPieceFromAdd(null);
          }}
          onAdd={handleAddStockPart}
          pieces={pieces}
          onOpenAddPieceModal={() => {
            setIsStockPartModalOpen(false);
            setIsFromStockModal(true);
            setIsPieceModalOpen(true);
          }}
          selectedPieceFromAdd={selectedPieceFromAdd}
        />
        <AddEquipmentModal
          open={isEquipmentModalOpen}
          onOpenChange={setIsEquipmentModalOpen}
          onCreateEquipment={handleAddEquipment}
        />
        <EditEquipmentModal
          open={isEditEquipmentModalOpen}
          onOpenChange={setIsEditEquipmentModalOpen}
          equipment={editingEquipment}
          onUpdateEquipment={async (updatedEquipment) => {
            await updateEquipment(updatedEquipment);
            await fetchEquipments();
            toast.success("Equipamento atualizado com sucesso!");
            setIsEditEquipmentModalOpen(false);
            setEditingEquipment(null);
          }}
        />
        <AddPieceModal
          isOpen={isPieceModalOpen}
          onClose={() => {
            setIsPieceModalOpen(false);
            setSelectedPieceFromAdd(null);
            setIsFromStockModal(false);
          }}
          onAdd={async (pieceData) => {
            const newPiece = await handleAddPiece(pieceData);
            setIsPieceModalOpen(false);
            // Se veio do botão + do modal de estoque, seleciona a peça e reabre o modal
            if (newPiece && isFromStockModal) {
              setSelectedPieceFromAdd(newPiece);
              setIsStockPartModalOpen(true);
              setIsFromStockModal(false);
            }
            // Se abriu direto da página de peças, só fecha o modal (não abre o de estoque)
          }}
        />
        <EditPieceModal
          isOpen={isEditPieceModalOpen}
          onClose={() => {
            setIsEditPieceModalOpen(false);
            setEditingPiece(null);
          }}
          piece={editingPiece}
          onUpdate={async (updatedPiece) => {
            await updatePiece(updatedPiece);
            toast.success("Peça atualizada com sucesso!");
            setIsEditPieceModalOpen(false);
            setEditingPiece(null);
          }}
        />
        <EditClientModal
          open={isEditClientModalOpen}
          onOpenChange={setIsEditClientModalOpen}
          client={clientToEdit}
          onSuccess={() => {
            toast.success("Cliente atualizado com sucesso!");
            fetchClients(false);
          }}
        />
        <EditPartModal
          open={isEditPartModalOpen}
          onOpenChange={setIsEditPartModalOpen}
          part={partToEdit}
          onEditPart={handleUpdatePart}
        />
        <EditStockPartModal
          isOpen={isEditStockPartModalOpen}
          onClose={() => {
            setIsEditStockPartModalOpen(false);
            setStockPartToEdit(null);
            setIsIndividualStockEdit(false);
          }}
          stockPart={stockPartToEdit}
          currentTotalQuantity={
            stockPartToEdit && (stockPartToEdit.piece_id || stockPartToEdit.pieceId)
              ? stockParts
                  .filter(sp => sp.piece_id === stockPartToEdit.piece_id)
                  .reduce((sum, sp) => sum + (sp.quantity || 0), 0)
              : 0
          }
          onUpdate={handleUpdateStockPart}
          onUpdateIndividual={handleUpdateIndividualStockPart}
          isIndividualEdit={isIndividualStockEdit}
          pieces={pieces}
        />
        
        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          variant={confirmDialog.variant}
        />
      </div>
    </DndProvider>
  );
}
