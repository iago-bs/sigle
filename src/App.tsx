// Main application entry point - Refactored for better modularity with organized component structure

import { useState, useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { Key, Copy } from "lucide-react";

// Types
import type { Appointment, Part, StockPart, OnlinePart, ServiceOrder, Technician, PageType, Equipment } from "./types";
import { type Client as DBClient, useClients } from "./hooks/useClients";

// Constants
import { 
  STORAGE_KEYS, 
  initialClients, 
  initialAppointments, 
  initialParts,
  initialStockParts,
  initialServiceOrders,
  initialTechnicians
} from "./lib/constants";

// Custom Hooks
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useClock } from "./hooks/useClock";
import { useAuth } from "./hooks/useAuth";
// useClients type imported above
import { useParts } from "./hooks/useParts";
import { useServiceOrders } from "./hooks/useServiceOrders";
import { useTechnicians } from "./hooks/useTechnicians";
import { useEquipments } from "./hooks/useEquipments";

// Utils
import { formatDateBR, calculateWarrantyEndDate } from "./lib/date-utils";

// ==================== COMPONENTS - ORGANIZED BY CATEGORY ====================

// Auth Components
import { LoginPage } from "./components/auth/LoginPage";
import { SignUpPage } from "./components/auth/SignUpPage";

// Setup Components
import { ShopTokenModal } from "./components/ShopTokenModal";

// Agendamentos (Appointments) - Using organized folder
import { AddAppointmentModal } from "./components/agendamentos/AddAppointmentModal";

// Clientes (Clients) - Using organized folder
import { AddClientModal } from "./components/clientes/AddClientModal";
import { EditClientModal } from "./components/clientes/EditClientModal";
import { ClientsPage } from "./components/ClientsPage";
import { InactiveClientsPage } from "./components/InactiveClientsPage";

// Equipamentos (Equipment)
import { AddEquipmentModal } from "./components/AddEquipmentModal";
import { EquipmentsPage } from "./components/EquipmentsPage";

// Garantias (Warranties)
import { WarrantiesPage } from "./components/WarrantiesPage";

// Histórico (History)
import { HistoryPage } from "./components/HistoryPage";

// Layout
import { MainLayout } from "./components/MainLayout";

// Notas Fiscais (Invoices)
import { InvoicesPage } from "./components/InvoicesPage";
import { InvoiceDetailModal } from "./components/InvoiceDetailModal";
import { InvoiceDocument } from "./components/InvoiceDocument";

// Ordem de Serviço (Service Orders)
import { AddServiceOrderModal } from "./components/AddServiceOrderModal";
import { ChangeStatusModal } from "./components/ChangeStatusModal";
import { DeliveryDateSelectionModal } from "./components/DeliveryDateSelectionModal";
import { ServiceOrderCompletionModal } from "./components/ServiceOrderCompletionModal";
import { ServiceOrderDetailModal } from "./components/ServiceOrderDetailModal";
import { ServiceOrderPrintPage } from "./components/ServiceOrderPrintPage";
import { ServiceOrderReceiptPrint } from "./components/ServiceOrderReceiptPrint";

// Orçamentos (Budgets)
import { BudgetsPage } from "./components/BudgetsPage";

// Peças (Parts)
import { AddOnlinePartModal } from "./components/AddOnlinePartModal";
import { AddPartModal } from "./components/AddPartModal";
import { AddStockPartModal } from "./components/AddStockPartModal";
import { EditOnlinePartModal } from "./components/EditOnlinePartModal";
import { EditPartModal } from "./components/EditPartModal";
import { EditStockPartModal } from "./components/EditStockPartModal";
import { PartsPage } from "./components/PartsPage";

// Técnicos (Technicians)
import { TechniciansManagementModal } from "./components/TechniciansManagementModal";
import { TechniciansPage } from "./components/TechniciansPage";

// Variáveis do Sistema
import { VariablesPage } from "./components/VariablesPage";

// UI Components
import { Toaster } from "./components/ui/sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { ConfirmDialog } from "./components/ConfirmDialog";

export default function App() {
  // Authentication
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showInitialTokenModal, setShowInitialTokenModal] = useState(false);
  const [justCreatedAccount, setJustCreatedAccount] = useState(false);

  // Custom hooks for state management with Supabase
  const currentTime = useClock();
  const { clients, setClients, createClient } = useClients();
  const { parts, createPart, updatePart, deletePart } = useParts();
  const { serviceOrders, setServiceOrders, createServiceOrder, updateServiceOrder, updateStatus: updateServiceOrderStatus } = useServiceOrders();
  const { technicians } = useTechnicians();
  const { equipments, setEquipments, fetchEquipments, createEquipment } = useEquipments();
  
  // Still using localStorage for these (to be migrated later)
  const [stockParts, setStockParts] = useLocalStorage<StockPart[]>(STORAGE_KEYS.STOCK_PARTS, initialStockParts);
  const [onlineParts, setOnlineParts] = useLocalStorage<OnlinePart[]>('onlineParts', []);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
  
  // Page navigation state
  const [currentPage, setCurrentPage] = useState<PageType>("main");
  
  // Current service order for printing
  const [currentServiceOrder, setCurrentServiceOrder] = useState<ServiceOrder | null>(null);
  
  // Pre-selected client for O.S creation
  const [preSelectedClient, setPreSelectedClient] = useState<DBClient | null>(null);
  
  // Modal states
  const [isServiceOrderModalOpen, setIsServiceOrderModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isStockPartModalOpen, setIsStockPartModalOpen] = useState(false);
  const [isOnlinePartModalOpen, setIsOnlinePartModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isEditPartModalOpen, setIsEditPartModalOpen] = useState(false);
  const [isEditStockPartModalOpen, setIsEditStockPartModalOpen] = useState(false);
  const [isEditOnlinePartModalOpen, setIsEditOnlinePartModalOpen] = useState(false);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [isTechniciansModalOpen, setIsTechniciansModalOpen] = useState(false);
  const [isServiceOrderDetailModalOpen, setIsServiceOrderDetailModalOpen] = useState(false);
  const [isServiceOrderCompletionModalOpen, setIsServiceOrderCompletionModalOpen] = useState(false);
  const [isReceiptPrintModalOpen, setIsReceiptPrintModalOpen] = useState(false);
  const [isDeliveryDateModalOpen, setIsDeliveryDateModalOpen] = useState(false);
  const [isShopTokenModalOpen, setIsShopTokenModalOpen] = useState(false);
  const [isSaleInvoiceModalOpen, setIsSaleInvoiceModalOpen] = useState(false);
  const [isFromHistory, setIsFromHistory] = useState(false);
  
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
  const [onlinePartToEdit, setOnlinePartToEdit] = useState<OnlinePart | null>(null);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null);
  const [saleInvoiceOrder, setSaleInvoiceOrder] = useState<ServiceOrder | null>(null);
  const [saleInvoiceModalType, setSaleInvoiceModalType] = useState<"detail" | "invoice">("invoice"); // Start with nota fiscal directly
  
  // Temporary states for completion flow
  const [pendingCompletionData, setPendingCompletionData] = useState<{
    serviceOrder: ServiceOrder;
    reason?: "refused" | "no-repair";
    usedParts?: Array<{partId?: string; partName: string; quantity: number}>;
  } | null>(null);
  
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

  // Show token modal on first login after account creation
  useEffect(() => {
    if (user && justCreatedAccount) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowInitialTokenModal(true);
        setJustCreatedAccount(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, justCreatedAccount]);

  // Handler to show token modal before logout
  const handleLogout = () => {
    setIsShopTokenModalOpen(true);
  };

  // Handler to confirm logout (after showing token)
  const handleConfirmLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erro ao fazer logout");
    }
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
  const handleAddStockPart = (stockPart: StockPart) => {
    setStockParts([...stockParts, stockPart]);
    toast.success("Peça adicionada ao estoque com sucesso!");
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
  const handleEditStockPart = (stockPart: StockPart) => {
    setStockPartToEdit(stockPart);
    setIsEditStockPartModalOpen(true);
  };

  // Handler to update stock part
  const handleUpdateStockPart = (updatedStockPart: StockPart) => {
    setStockParts(stockParts.map(sp => sp.id === updatedStockPart.id ? updatedStockPart : sp));
    toast.success("Peça do estoque atualizada com sucesso!");
  };

  // Handler to delete stock part
  const handleDeleteStockPart = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Remover do Estoque",
      description: "Tem certeza que deseja remover esta peça do estoque? Esta ação não pode ser desfeita.",
      variant: "danger",
      onConfirm: () => {
        setStockParts(stockParts.filter(sp => sp.id !== id));
        toast.success("Peça removida do estoque");
      }
    });
  };

  // Handler to add online part
  const handleAddOnlinePart = (onlinePart: OnlinePart) => {
    setOnlineParts([...onlineParts, onlinePart]);
    
    // Se a peça foi vinculada a uma O.S, atualizar o status da O.S para "aguardando peça"
    if (onlinePart.linkedServiceOrderId) {
      setServiceOrders(serviceOrders.map(so => 
        so.id === onlinePart.linkedServiceOrderId
          ? { ...so, status: "waiting-parts", waitingParts: [onlinePart.name] }
          : so
      ));
      toast.success("Peça adicionada e O.S atualizada!", {
        description: "Status alterado para 'Aguardando Peça'"
      });
    } else {
      toast.success("Peça online adicionada com sucesso!");
    }
  };

  // Handler to edit online part
  const handleEditOnlinePart = (onlinePart: OnlinePart) => {
    setOnlinePartToEdit(onlinePart);
    setIsEditOnlinePartModalOpen(true);
  };

  // Handler to update online part
  const handleUpdateOnlinePart = (updatedOnlinePart: OnlinePart) => {
    const oldOnlinePart = onlineParts.find(op => op.id === updatedOnlinePart.id);
    
    // Verificar se a peça foi marcada como "delivered" e não está vinculada a nenhuma O.S
    const shouldMoveToStock = 
      updatedOnlinePart.status === "delivered" && 
      !updatedOnlinePart.linkedServiceOrderId &&
      oldOnlinePart?.status !== "delivered";
    
    if (shouldMoveToStock) {
      // Criar peça no estoque automaticamente
      const newStockPart: StockPart = {
        id: Date.now().toString(),
        name: updatedOnlinePart.name,
        description: updatedOnlinePart.notes || "Peça recebida via pedido online",
        compatibleModels: [], // Pode ser editado posteriormente
        compatibleBrands: [],
        quantity: 1,
        location: undefined,
        notes: `Pedido online recebido em ${new Date(updatedOnlinePart.receivedDate || new Date()).toLocaleDateString('pt-BR')}`,
        addedAt: new Date().toISOString()
      };
      
      setStockParts([...stockParts, newStockPart]);
      
      // Remover da lista de peças online (já que foi movida para o estoque)
      setOnlineParts(onlineParts.filter(op => op.id !== updatedOnlinePart.id));
      
      toast.success(`Peça "${updatedOnlinePart.name}" recebida e adicionada ao estoque automaticamente!`);
      return;
    }
    
    setOnlineParts(onlineParts.map(op => op.id === updatedOnlinePart.id ? updatedOnlinePart : op));
    
    // Se vinculou a uma nova O.S
    if (updatedOnlinePart.linkedServiceOrderId && 
        oldOnlinePart?.linkedServiceOrderId !== updatedOnlinePart.linkedServiceOrderId) {
      setServiceOrders(serviceOrders.map(so => 
        so.id === updatedOnlinePart.linkedServiceOrderId
          ? { ...so, status: "waiting-parts", waitingParts: [updatedOnlinePart.name] }
          : so
      ));
    }
    
    // Se desvinculou da O.S
    if (!updatedOnlinePart.linkedServiceOrderId && oldOnlinePart?.linkedServiceOrderId) {
      const linkedParts = onlineParts.filter(
        op => op.linkedServiceOrderId === oldOnlinePart.linkedServiceOrderId && op.id !== updatedOnlinePart.id
      );
      
      if (linkedParts.length === 0) {
        setServiceOrders(serviceOrders.map(so => 
          so.id === oldOnlinePart.linkedServiceOrderId
            ? { ...so, status: "in-progress", waitingParts: [] }
            : so
        ));
      }
    }
    
    toast.success("Peça online atualizada com sucesso!");
  };

  // Handler to delete online part
  const handleDeleteOnlinePart = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Excluir Peça Online",
      description: "Tem certeza que deseja excluir esta peça online? Esta ação não pode ser desfeita.",
      variant: "danger",
      onConfirm: () => {
        const onlinePart = onlineParts.find(op => op.id === id);
        
        // Se estava vinculada a uma O.S, verificar se precisa atualizar o status
        if (onlinePart?.linkedServiceOrderId) {
          const linkedParts = onlineParts.filter(
            op => op.linkedServiceOrderId === onlinePart.linkedServiceOrderId && op.id !== id
          );
          
          if (linkedParts.length === 0) {
            setServiceOrders(serviceOrders.map(so => 
              so.id === onlinePart.linkedServiceOrderId
                ? { ...so, status: "in-progress", waitingParts: [] }
                : so
            ));
          }
        }
        
        setOnlineParts(onlineParts.filter(op => op.id !== id));
        toast.success("Peça online excluída com sucesso");
      }
    });
  };

  // Handler to change service order status
  const handleChangeServiceOrderStatus = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder);
    setIsChangeStatusModalOpen(true);
  };

  // Handler to confirm status change
  const handleConfirmStatusChange = (orderId: string, newStatus: ServiceOrder["status"], waitingParts?: string[]) => {
    const updatedServiceOrder = serviceOrders.find(so => so.id === orderId);
    if (!updatedServiceOrder) return;

    const statusLabels: Record<ServiceOrder["status"], string> = {
      "pending": "Pendente",
      "in-progress": "Em Andamento",
      "waiting-parts": "Aguardando Peças",
      "under-observation": "Em Observação",
      "waiting-client-response": "Aguardando Cliente",
      "abandoned": "Abandonado",
      "completed": "Concluído",
      "cancelled": "Cancelado"
    };

    let observationsAddition = "";
    if (newStatus === "waiting-parts" && waitingParts && waitingParts.length > 0) {
      observationsAddition = `\n\nAguardando peças: ${waitingParts.join(", ")}`;
    }

    const nowIso = new Date().toISOString();
    const updated: ServiceOrder = {
      ...updatedServiceOrder,
      status: newStatus,
      waitingParts: newStatus === "waiting-parts" ? waitingParts : undefined,
      observations: (updatedServiceOrder.observations || "") + observationsAddition,
      updatedAt: nowIso
    };

    // If marking as completed via status change, ensure warranty fields are set
    if (newStatus === "completed") {
      const warrantyMonths = updated.warrantyMonths || 3;
      const warrantyStartDate = updated.warrantyStartDate || nowIso;
      const warrantyEndDate = updated.warrantyEndDate || calculateWarrantyEndDate(warrantyStartDate, warrantyMonths);
      updated.warrantyMonths = warrantyMonths;
      updated.warrantyStartDate = warrantyStartDate;
      updated.warrantyEndDate = warrantyEndDate;
      // Best-effort delivery/completion timestamps if not already present
      updated.completionDate = updated.completionDate || nowIso;
      updated.deliveryDate = updated.deliveryDate || nowIso;
    }

    setServiceOrders(serviceOrders.map(so => 
      so.id === updated.id ? updated : so
    ));

    toast.success("Status alterado com sucesso!", {
      description: `Novo status: ${statusLabels[newStatus]}`,
      duration: 4000
    });
  };

  // Handler to open service order modal with validation
  const handleOpenServiceOrderModal = () => {
    if (clients.length === 0) {
      toast.error("Cadastre um cliente primeiro", {
        description: "É necessário ter pelo menos um cliente cadastrado para criar uma O.S.",
        action: {
          label: "Cadastrar Cliente",
          onClick: () => setIsClientModalOpen(true),
        },
      });
      return;
    }
    
    if (technicians.length === 0) {
      toast.error("Cadastre um técnico primeiro", {
        description: "É necessário ter pelo menos um técnico cadastrado para criar uma O.S.",
        action: {
          label: "Gerenciar Técnicos",
          onClick: () => setIsTechniciansModalOpen(true),
        },
      });
      return;
    }
    
    setPreSelectedClient(null);
    setIsServiceOrderModalOpen(true);
  };

  // Handler to create service order
  const handleCreateServiceOrder = (serviceOrder: ServiceOrder) => {
    // Auto-register equipment when creating O.S
    if (serviceOrder.brand && serviceOrder.model && serviceOrder.device) {
      const equipmentKey = `${serviceOrder.brand.toLowerCase()}_${serviceOrder.model.toLowerCase()}`;
      const existingEquipment = equipments.find(
        eq => `${eq.brand.toLowerCase()}_${eq.model.toLowerCase()}` === equipmentKey
      );
      
      if (!existingEquipment) {
        const newEquipment: Equipment = {
          id: Date.now().toString(),
          device: serviceOrder.device,
          brand: serviceOrder.brand,
          model: serviceOrder.model,
          serialNumber: serviceOrder.serialNumber,
          lastServiceDate: new Date().toISOString(),
          totalServices: 0,
        };
        setEquipments([...equipments, newEquipment]);
      }
    }
    
    setCurrentServiceOrder(serviceOrder);
    setIsReceiptPrintModalOpen(true);
    toast.success("O.S criada com sucesso!");
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

  // Handler to save service order to history
  const handleSaveToHistory = (status: ServiceOrder["status"]) => {
    if (currentServiceOrder) {
      const updatedServiceOrder = { ...currentServiceOrder, status };
      setServiceOrders([...serviceOrders, updatedServiceOrder]);
      toast.success("O.S adicionada ao histórico com sucesso!");
      setCurrentPage("history");
      setCurrentServiceOrder(null);
    }
  };

  // Handler to close receipt and save to history
  const handleCloseReceiptPrint = () => {
    if (currentServiceOrder) {
      setServiceOrders([...serviceOrders, currentServiceOrder]);
      toast.success("O.S salva no histórico!");
    }
    setIsReceiptPrintModalOpen(false);
    setCurrentServiceOrder(null);
  };

  // Handler to select service order from history
  const handleSelectServiceOrder = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder);
    setIsServiceOrderDetailModalOpen(true);
    // Reset isFromHistory when opening, will be set by HistoryPage if needed
    if (!isFromHistory) {
      setIsFromHistory(false);
    }
  };

  // Handler to update service order
  const handleUpdateServiceOrder = (updatedServiceOrder: ServiceOrder) => {
    setServiceOrders(serviceOrders.map(so => so.id === updatedServiceOrder.id ? updatedServiceOrder : so));
    toast.success("O.S atualizada com sucesso!");
  };

  // Handler to mark service order as ready (opens completion modal)
  const handleMarkAsReady = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder);
    setIsServiceOrderDetailModalOpen(false);
    setIsServiceOrderCompletionModalOpen(true);
  };

  // Handler to complete without repair (refused or no repair)
  const handleCompleteWithoutRepair = (serviceOrder: ServiceOrder, reason: "refused" | "no-repair") => {
    // Armazena os dados temporariamente e abre o modal de data de entrega
    setPendingCompletionData({
      serviceOrder,
      reason
    });
    setIsDeliveryDateModalOpen(true);
  };

  // Handler to select delivery date
  const handleSelectDeliveryDate = (deliverToday: boolean, selectedDate?: Date) => {
    if (!pendingCompletionData) return;

    const { serviceOrder, reason, usedParts } = pendingCompletionData;
    const completionDate = new Date().toISOString();
    const deliveryDate = deliverToday 
      ? completionDate 
      : (selectedDate ? selectedDate.toISOString() : completionDate);

    // Se for conclusão sem reparo (recusado ou não tem conserto)
    if (reason) {
      const reasonText = reason === "refused" 
        ? "Cliente recusou o orçamento" 
        : "Não tem conserto";
      
      const completedServiceOrder: ServiceOrder = {
        ...serviceOrder,
        status: "completed",
        completionDate,
        deliveryDate,
        observations: (serviceOrder.observations || "") + `\n\n${reasonText}`,
        updatedAt: completionDate
      };

      setServiceOrders(serviceOrders.map(so => so.id === completedServiceOrder.id ? completedServiceOrder : so));
      
      toast.success("O.S Finalizada", {
        description: `${reasonText}. Entrega: ${deliverToday ? 'Hoje' : formatDateBR(deliveryDate)}`,
      });
    } 
    // Se for conclusão normal com peças e pagamento
    else if (usedParts) {
      const completedServiceOrder: ServiceOrder = {
        ...serviceOrder,
        deliveryDate
      };

      // Deduzir peças do estoque
      if (usedParts.length > 0) {
        const updatedStockParts = stockParts.map(sp => {
          const usedPart = usedParts.find(up => up.partId === sp.id);
          if (usedPart) {
            const newQuantity = Math.max(0, sp.quantity - usedPart.quantity);
            if (newQuantity === 0) {
              toast.warning(`Estoque zerado: ${sp.name}`, {
                description: "Considere reabastecer esta peça."
              });
            }
            return { ...sp, quantity: newQuantity };
          }
          return sp;
        });
        setStockParts(updatedStockParts);
        
        const stockPartsUsed = usedParts.filter(up => up.partId).length;
        if (stockPartsUsed > 0) {
          toast.info(`${stockPartsUsed} peça(s) deduzida(s) do estoque`);
        }
      }

      setServiceOrders(serviceOrders.map(so => so.id === completedServiceOrder.id ? completedServiceOrder : so));
      toast.success("O.S finalizada com sucesso!", {
        description: `Garantia ativada! Entrega: ${deliverToday ? 'Hoje' : formatDateBR(deliveryDate)}`,
      });
    }

    // Limpa os dados pendentes e fecha o modal
    setPendingCompletionData(null);
    setIsDeliveryDateModalOpen(false);
  };

  // Handler to complete service order
  const handleCompleteServiceOrder = (
    completedServiceOrder: ServiceOrder, 
    usedParts: Array<{partId?: string; partName: string; quantity: number}>
  ) => {
    // Armazena os dados temporariamente e abre o modal de data de entrega
    setPendingCompletionData({
      serviceOrder: completedServiceOrder,
      usedParts
    });
    setIsServiceOrderCompletionModalOpen(false);
    setIsDeliveryDateModalOpen(true);
  };

  // Handler to complete and print service order (same as normal completion for now)
  const handlePrintAndCompleteServiceOrder = (
    completedServiceOrder: ServiceOrder,
    usedParts: Array<{partId?: string; partName: string; quantity: number}>
  ) => {
    // Armazena os dados temporariamente e abre o modal de data de entrega
    setPendingCompletionData({
      serviceOrder: completedServiceOrder,
      usedParts
    });
    setIsServiceOrderCompletionModalOpen(false);
    setIsDeliveryDateModalOpen(true);
  };

  // Legacy setup handler removed (technicians via Supabase users)

  // Handler para venda de equipamento
  const handleSellEquipment = async (invoice: ServiceOrder, equipmentId?: string) => {
    try {
      // Adicionar o token da loja
      const invoiceWithToken = {
        ...invoice,
        shop_token: user?.shopToken || ""
      };

      // Criar a nota fiscal como uma O.S completa
      await createServiceOrder(invoiceWithToken);

      // NOVO: Marcar equipamento como vendido no backend e recarregar a lista
      if (equipmentId && user?.shopToken) {
        try {
          const { projectId, publicAnonKey } = await import('./utils/supabase/info');
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/equipments/mark-as-sold`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                shopToken: user.shopToken,
                equipmentId: equipmentId,
                soldDate: invoice.delivery_date || new Date().toISOString(),
                invoiceId: invoice.id,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error('[SELL] Erro ao marcar equipamento como vendido:', errorData);
          } else {
            const result = await response.json();
            console.log('[SELL] Equipamento marcado como vendido:', result.equipment);
          }

          // Aguardar um pouco para o banco atualizar, então recarregar
          await new Promise(resolve => setTimeout(resolve, 500));
          await fetchEquipments();
        } catch (error) {
          console.error('Erro ao marcar equipamento como vendido:', error);
        }
      }
      
      // Abrir modal de impressão da nota fiscal (diretamente como nota fiscal, não detail)
      setSaleInvoiceOrder(invoiceWithToken);
      setSaleInvoiceModalType("invoice"); // Open as nota fiscal directly
      setIsSaleInvoiceModalOpen(true);
      
      toast.success("Venda registrada com sucesso!", {
        description: "Nota fiscal criada com 3 meses de garantia"
      });
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      toast.error("Erro ao registrar venda");
    }
  };

  // Handlers for technician management
  const handleAddTechnician = (_technician: Technician) => {
    toast.info("Técnicos são gerenciados via cadastro de usuários.", {
      description: "Use a tela de login/cadastro para adicionar membros da equipe.",
    });
  };

  const handleUpdateTechnician = (_updatedTechnician: Technician) => {
    toast.info("Atualização de técnico não disponível aqui.", {
      description: "Gerencie técnicos pela área de usuários.",
    });
  };

  const handleDeleteTechnician = (_id: string) => {
    toast.info("Exclusão de técnico não disponível aqui.", {
      description: "Gerencie técnicos pela área de usuários.",
    });
  };

  // NOTE: Old technician selection system removed
  // Now using Supabase Auth - users login with email/password

  // Handler to toggle delivery status
  const handleToggleDelivered = (serviceOrder: ServiceOrder) => {
    const newStatus: ServiceOrder["status"] = serviceOrder.status === "completed" ? "in-progress" : "completed";
    const updatedServiceOrder: ServiceOrder = {
      ...serviceOrder,
      status: newStatus,
      deliveryDate: newStatus === "completed" ? new Date().toISOString() : serviceOrder.deliveryDate,
      updatedAt: new Date().toISOString()
    };
    setServiceOrders(serviceOrders.map(so => so.id === updatedServiceOrder.id ? updatedServiceOrder : so));
    
    if (newStatus === "completed") {
      toast.success("Ordem entregue ao cliente!", {
        description: `${serviceOrder.clientName} retirou o equipamento.`,
      });
    } else {
      toast.info("Status alterado", {
        description: "Ordem marcada como não entregue.",
      });
    }
  };

  // Get today's delivery orders
  const getTodaysDeliveries = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return serviceOrders.filter(order => {
      if (!order.deliveryDate) return false;
      const deliveryDate = new Date(order.deliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);
      return deliveryDate.getTime() === today.getTime();
    });
  };

  const todaysDeliveries = getTodaysDeliveries();

  // ==================== RENDER ====================

  // Show loading state while checking authentication
  if (authLoading) {
    return (
  <div className="min-h-screen bg-linear-to-br from-[#f5f0e8] to-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#8b7355] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show authentication screens if user is not logged in
  if (!user) {
    if (authMode === 'login') {
      return (
        <>
          <Toaster position="top-right" />
          <LoginPage 
            onSignIn={async (email, password, shopToken) => {
              await signIn(email, password, shopToken);
            }}
            onSwitchToSignUp={() => setAuthMode('signup')}
          />
        </>
      );
    } else {
      return (
        <>
          <Toaster position="top-right" />
          <SignUpPage 
            onSignUp={async (email, password, name, storeName, storeAddress, storePhone, mode, existingToken) => {
              const result = await signUp(email, password, name, storeName, storeAddress, storePhone, mode, existingToken);
              // Mark that account was just created to show token modal after login
              if (mode === 'create') {
                setJustCreatedAccount(true);
              }
              // Return the result so SignUpPage can access shopToken
              return result;
            }}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        </>
      );
    }
  }

  // User is authenticated - show main application
  return (
    <DndProvider backend={HTML5Backend}>
      <Toaster position="top-right" />
      <div className="h-screen bg-[#f5f0e8] overflow-hidden flex">
        {/* Page Routing */}
        {currentPage === "history" ? (
          <HistoryPage 
            onBack={() => setCurrentPage("main")}
            serviceOrders={serviceOrders}
            onSelectServiceOrder={(so) => {
              handleSelectServiceOrder(so);
              setIsFromHistory(true);
            }}
            onUpdateServiceOrder={(updatedOrder) => {
              setServiceOrders(serviceOrders.map(so => so.id === updatedOrder.id ? updatedOrder : so));
            }}
          />
        ) : currentPage === "clients" ? (
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
            onlineParts={onlineParts}
            serviceOrders={serviceOrders}
            onAddPart={() => setIsPartModalOpen(true)}
            onAddStockPart={() => setIsStockPartModalOpen(true)}
            onAddOnlinePart={() => setIsOnlinePartModalOpen(true)}
            onEditPart={handleEditPart}
            onDeletePart={handleDeletePart}
            onEditStockPart={handleEditStockPart}
            onDeleteStockPart={handleDeleteStockPart}
            onEditOnlinePart={handleEditOnlinePart}
            onDeleteOnlinePart={handleDeleteOnlinePart}
            onSelectServiceOrder={handleSelectServiceOrder}
          />
        ) : currentPage === "warranties" ? (
          <WarrantiesPage 
            onBack={() => setCurrentPage("main")}
            serviceOrders={serviceOrders}
            onSelectServiceOrder={handleSelectServiceOrder}
          />
        ) : currentPage === "budgets" ? (
          <BudgetsPage onBack={() => setCurrentPage("main")} />
        ) : currentPage === "invoices" ? (
          <InvoicesPage onBack={() => setCurrentPage("main")} />
        ) : currentPage === "equipments" ? (
          <EquipmentsPage 
            onBack={() => setCurrentPage("main")}
            serviceOrders={serviceOrders}
            equipments={equipments}
            clients={clients}
            onViewServiceOrder={handleSelectServiceOrder}
            onAddEquipment={() => setIsEquipmentModalOpen(true)}
            onSellEquipment={handleSellEquipment}
            onCreateClient={async (clientData) => {
              await createClient(clientData);
              toast.success("Cliente criado com sucesso!");
            }}
          />
        ) : currentPage === "technicians" ? (
          <TechniciansPage 
            onBack={() => setCurrentPage("main")}
          />
        ) : currentPage === "variables" ? (
          <div className="min-h-screen bg-gray-50 flex">
            <div className="w-full max-w-7xl mx-auto">
              <div className="bg-white border-b px-6 py-4">
                <button
                  onClick={() => setCurrentPage("main")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Voltar
                </button>
              </div>
              <div className="p-6">
                <VariablesPage />
              </div>
            </div>
          </div>
        ) : currentPage === "print-os" && currentServiceOrder ? (
          <ServiceOrderPrintPage
            serviceOrder={currentServiceOrder}
            onBack={() => setCurrentPage("main")}
            onSaveToHistory={handleSaveToHistory}
          />
        ) : (
          <MainLayout
            currentTime={currentTime}
            appointments={appointments}
            deliveryOrders={todaysDeliveries}
            serviceOrders={serviceOrders}
            parts={frontendParts}
            clients={clients}
            currentUser={user}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectServiceOrder={handleSelectServiceOrder}
            onMoveCard={moveCard}
            onToggleDelivered={handleToggleDelivered}
            onAddServiceOrder={handleOpenServiceOrderModal}
            onAddClient={() => setIsClientModalOpen(true)}
            onAddAppointment={() => setIsAppointmentModalOpen(true)}
            onAddPart={() => setIsPartModalOpen(true)}
            onNavigateToHistory={() => setCurrentPage("history")}
            onNavigateToClients={() => setCurrentPage("clients")}
            onNavigateToParts={() => setCurrentPage("parts")}
            onNavigateToWarranties={() => setCurrentPage("warranties")}
            onNavigateToBudgets={() => setCurrentPage("budgets")}
            onNavigateToInvoices={() => setCurrentPage("invoices")}
            onNavigateToEquipments={() => setCurrentPage("equipments")}
            onNavigateToVariables={() => setCurrentPage("variables")}
            onManageTechnicians={() => setIsTechniciansModalOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {/* Modals */}
        <AddServiceOrderModal 
          open={isServiceOrderModalOpen} 
          onOpenChange={setIsServiceOrderModalOpen}
          technicians={technicians.map(t => ({ id: t.id, name: t.name, createdAt: t.created_at }))}
          stockParts={stockParts}
          activeTechnicianId={user?.id || null}
          activeTechnicianName={user?.technicianName || null}
          preSelectedClient={preSelectedClient}
          onSuccess={() => {
            setPreSelectedClient(null);
            setIsServiceOrderModalOpen(false);
          }}
        />
        <AddClientModal 
          open={isClientModalOpen} 
          onOpenChange={setIsClientModalOpen}
          onSuccessAndCreateOS={(client) => {
            setPreSelectedClient(client);
            setIsServiceOrderModalOpen(true);
          }}
        />
        <AddAppointmentModal 
          open={isAppointmentModalOpen} 
          onOpenChange={setIsAppointmentModalOpen}
          onAddAppointment={handleAddAppointment}
          serviceOrders={serviceOrders}
        />
        <AddPartModal 
          open={isPartModalOpen} 
          onOpenChange={setIsPartModalOpen}
          onAddPart={handleAddPart}
          serviceOrders={serviceOrders}
        />
        <AddStockPartModal
          isOpen={isStockPartModalOpen}
          onClose={() => setIsStockPartModalOpen(false)}
          onAdd={handleAddStockPart}
        />
        <AddEquipmentModal
          open={isEquipmentModalOpen}
          onOpenChange={setIsEquipmentModalOpen}
          onCreateEquipment={handleAddEquipment}
        />
        <EditClientModal
          open={isEditClientModalOpen}
          onOpenChange={setIsEditClientModalOpen}
          client={clientToEdit}
          onSuccess={() => toast.success("Cliente atualizado com sucesso!")}
        />
        <EditPartModal
          open={isEditPartModalOpen}
          onOpenChange={setIsEditPartModalOpen}
          part={partToEdit}
          onEditPart={handleUpdatePart}
        />
        <EditStockPartModal
          isOpen={isEditStockPartModalOpen}
          onClose={() => setIsEditStockPartModalOpen(false)}
          stockPart={stockPartToEdit}
          onUpdate={handleUpdateStockPart}
        />
        <TechniciansManagementModal
          open={isTechniciansModalOpen}
          onOpenChange={setIsTechniciansModalOpen}
          technicians={technicians.map(t => ({ id: t.id, name: t.name, createdAt: t.created_at }))}
          onAddTechnician={handleAddTechnician}
          onUpdateTechnician={handleUpdateTechnician}
          onDeleteTechnician={handleDeleteTechnician}
        />
        <ServiceOrderDetailModal
          open={isServiceOrderDetailModalOpen}
          onOpenChange={(open) => {
            setIsServiceOrderDetailModalOpen(open);
            if (!open) {
              setIsFromHistory(false);
            }
          }}
          serviceOrder={selectedServiceOrder}
          clients={clients}
          technicians={technicians.map(t => ({ id: t.id, name: t.name, createdAt: t.created_at }))}
          onUpdateServiceOrder={handleUpdateServiceOrder}
          onMarkAsReady={handleMarkAsReady}
          onCompleteWithoutRepair={handleCompleteWithoutRepair}
          onNavigate={(page) => setCurrentPage(page as PageType)}
          isFromHistory={isFromHistory}
        />
        <ServiceOrderCompletionModal
          open={isServiceOrderCompletionModalOpen}
          onOpenChange={setIsServiceOrderCompletionModalOpen}
          serviceOrder={selectedServiceOrder}
          stockParts={stockParts}
          onComplete={handleCompleteServiceOrder}
          onPrintAndComplete={handlePrintAndCompleteServiceOrder}
        />
        {currentServiceOrder && (
          <ServiceOrderReceiptPrint
            isOpen={isReceiptPrintModalOpen}
            onClose={handleCloseReceiptPrint}
            serviceOrder={currentServiceOrder}
            client={clients.find(c => c.id === currentServiceOrder.clientId) || {
              id: '',
              name: currentServiceOrder.clientName || currentServiceOrder.client_name || "Cliente",
              phone: '',
            }}
          />
        )}
        <DeliveryDateSelectionModal
          open={isDeliveryDateModalOpen}
          onOpenChange={setIsDeliveryDateModalOpen}
          serviceOrder={pendingCompletionData?.serviceOrder || null}
          onSelectDate={handleSelectDeliveryDate}
        />
        <AddOnlinePartModal
          open={isOnlinePartModalOpen}
          onOpenChange={setIsOnlinePartModalOpen}
          serviceOrders={serviceOrders}
          onAdd={handleAddOnlinePart}
        />
        <EditOnlinePartModal
          open={isEditOnlinePartModalOpen}
          onOpenChange={setIsEditOnlinePartModalOpen}
          onlinePart={onlinePartToEdit}
          serviceOrders={serviceOrders}
          onUpdate={handleUpdateOnlinePart}
        />
        <ChangeStatusModal
          isOpen={isChangeStatusModalOpen}
          onClose={() => setIsChangeStatusModalOpen(false)}
          serviceOrder={selectedServiceOrder}
          onStatusChange={handleConfirmStatusChange}
        />
        <ShopTokenModal
          open={isShopTokenModalOpen}
          onOpenChange={setIsShopTokenModalOpen}
          shopToken={user?.shopToken || null}
          shopName={user?.storeName || "Loja"}
          userEmail={user?.email || ""}
          onConfirmLogout={handleConfirmLogout}
        />
        
        {/* Sale Invoice Modal - Open nota fiscal directly for sales */}
        {saleInvoiceOrder && saleInvoiceModalType === "invoice" && (() => {
          const formatDate = (isoDate: string | undefined) => {
            if (!isoDate) return new Date().toLocaleDateString("pt-BR");
            const date = new Date(isoDate);
            return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
          };

          const invoiceData = {
            id: `INV-${saleInvoiceOrder.id}`,
            osNumber: saleInvoiceOrder.osNumber || saleInvoiceOrder.os_number || saleInvoiceOrder.id,
            clientName: saleInvoiceOrder.clientName || saleInvoiceOrder.client_name,
            clientPhone: saleInvoiceOrder.client_phone || "",
            device: `${saleInvoiceOrder.device || saleInvoiceOrder.equipment_type} - ${saleInvoiceOrder.brand || saleInvoiceOrder.equipment_brand || ""} ${saleInvoiceOrder.model || saleInvoiceOrder.equipment_model || ""}`,
            items: [
              {
                description: saleInvoiceOrder.defect || "Venda de equipamento",
                quantity: 1,
                unitPrice: saleInvoiceOrder.paymentAmount || "R$ 0,00",
                total: saleInvoiceOrder.paymentAmount || "R$ 0,00",
              },
            ],
            totalValue: saleInvoiceOrder.paymentAmount || "R$ 0,00",
            issueDate: formatDate(saleInvoiceOrder.completionDate || saleInvoiceOrder.completion_date || saleInvoiceOrder.deliveryDate || saleInvoiceOrder.delivery_date),
            warrantyEndDate: formatDate(saleInvoiceOrder.warrantyEndDate),
            technicianName: saleInvoiceOrder.technicianName || saleInvoiceOrder.technician_name || "Técnico Responsável",
          };

          return (
            <InvoiceDocument
              invoice={invoiceData}
              isOpen={isSaleInvoiceModalOpen}
              onClose={() => {
                setIsSaleInvoiceModalOpen(false);
                setSaleInvoiceOrder(null);
              }}
            />
          );
        })()}
        
        {/* Initial Token Modal - shown after first account creation */}
        <Dialog open={showInitialTokenModal} onOpenChange={setShowInitialTokenModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#8b7355]" />
                Bem-vindo ao SIGLE Systems!
              </DialogTitle>
              <DialogDescription>
                Sua conta foi criada com sucesso. Este é o token único da sua loja.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Shop Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Loja:</strong> {user?.storeName || "Sua Loja"}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>E-mail:</strong> {user?.email}
                </p>
              </div>

              {/* Token Display */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 mb-3">
                  🔑 <strong>Token da Loja:</strong>
                </p>
                <div className="bg-white border border-gray-300 rounded p-3 font-mono text-sm break-all">
                  {user?.shopToken || "Token não disponível"}
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800">
                  ⚠️ <strong>IMPORTANTE:</strong> Guarde este token em local seguro! Você e outros membros da equipe precisarão dele para fazer login no sistema.
                </p>
              </div>

              {/* Info about accessing token later */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  💡 <strong>Dica:</strong> Você pode acessar este token novamente clicando em <strong>"Sair"</strong> na barra lateral direita. Lá você também poderá copiá-lo ou enviá-lo por e-mail.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (user?.shopToken) {
                      navigator.clipboard.writeText(user.shopToken);
                      toast.success("Token copiado para a área de transferência!");
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Token
                </Button>
                <Button
                  onClick={() => setShowInitialTokenModal(false)}
                  className="flex-1 bg-[#8b7355] hover:bg-[#7a6345]"
                >
                  Entendi!
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
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
