import { Search, ArrowLeft, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { ServiceOrder } from "../types";
import { formatDateBR } from "../lib/date-utils";
import { ChangeStatusModal } from "./ChangeStatusModal";
import { toast } from "sonner";

interface HistoryPageProps {
  onBack: () => void;
  serviceOrders: ServiceOrder[];
  onSelectServiceOrder: (serviceOrder: ServiceOrder) => void;
  onUpdateServiceOrder: (updatedOrder: ServiceOrder) => void;
}

export function HistoryPage({ onBack, serviceOrders, onSelectServiceOrder, onUpdateServiceOrder }: HistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceOrder["status"] | "all">("all");
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [selectedOrderForStatusChange, setSelectedOrderForStatusChange] = useState<ServiceOrder | null>(null);

  // Filter history based on search and status
  const filteredHistory = serviceOrders.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.osNumber?.toLowerCase().includes(query) ||
      item.clientName?.toLowerCase().includes(query) ||
      item.device?.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query) ||
      item.model?.toLowerCase().includes(query) ||
      item.defect?.toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ServiceOrder["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 hover:bg-green-100";
      case "pending":
        return "bg-yellow-50 hover:bg-yellow-100";
      case "in-progress":
        return "bg-blue-50 hover:bg-blue-100";
      case "waiting-parts":
        return "bg-orange-50 hover:bg-orange-100";
      case "cancelled":
        return "bg-red-50 hover:bg-red-100";
      default:
        return "bg-white hover:bg-gray-50";
    }
  };

  const getStatusBadgeColor = (status: ServiceOrder["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-600 text-white";
      case "in-progress":
        return "bg-blue-600 text-white";
      case "waiting-parts":
        return "bg-orange-600 text-white";
      case "under-observation":
        return "bg-purple-600 text-white";
      case "cancelled":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusLabel = (status: ServiceOrder["status"]) => {
    switch (status) {
      case "completed":
        return "CONCLUÍDO";
      case "pending":
        return "PENDENTE";
      case "in-progress":
        return "EM ANDAMENTO";
      case "waiting-parts":
        return "AGUARDANDO PEÇAS";
      case "under-observation":
        return "EM OBSERVAÇÃO";
      case "cancelled":
        return "CANCELADO";
      default:
        return "";
    }
  };

  const getStatusCount = (status: ServiceOrder["status"]) => {
    return serviceOrders.filter(item => item.status === status).length;
  };

  const handleOpenChangeStatus = (order: ServiceOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderForStatusChange(order);
    setIsChangeStatusModalOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: ServiceOrder["status"], waitingParts?: string[]) => {
    const orderToUpdate = serviceOrders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const updatedOrder: ServiceOrder = {
      ...orderToUpdate,
      status: newStatus,
      waitingParts: newStatus === "waiting-parts" ? waitingParts : undefined,
      updatedAt: new Date().toISOString(),
    };

    onUpdateServiceOrder(updatedOrder);

    // Se o status for "aguardando peças", mostrar toast especial
    if (newStatus === "waiting-parts" && waitingParts && waitingParts.length > 0) {
      toast.success("Status Alterado!", {
        description: `O.S #${orderToUpdate.osNumber} movida para "PEÇAS". Peças necessárias: ${waitingParts.join(", ")}`,
        duration: 5000,
      });
    } else {
      toast.success("Status Alterado!", {
        description: `O.S #${orderToUpdate.osNumber} agora está como "${getStatusLabel(newStatus)}"`,
      });
    }
  };

  return (
    <div className="h-screen bg-[#f5f0e8] overflow-y-auto flex flex-col">
      {/* Sticky Header with Back Button and Title */}
      <div className="sticky top-0 bg-[#f5f0e8] z-20 pb-4 pt-6 px-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 
            style={{
              fontFamily: 'Lexend Deca, sans-serif',
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            HISTÓRICO DE ORDENS DE SERVIÇO
          </h1>
        </div>

        {/* Sticky Search Bar and Filters - Centered */}
        <div className="max-w-[500px] mx-auto">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
            <input
              type="text"
              placeholder="Pesquisar por O.S, cliente, aparelho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-full bg-white text-sm focus:outline-none focus:border-[#8b7355] transition-colors shadow-sm"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button 
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-full border transition-all text-xs ${
                statusFilter === "all" 
                  ? "bg-[#8b7355] text-white border-[#8b7355] shadow-sm" 
                  : "bg-white border-gray-300 hover:border-[#8b7355] hover:bg-gray-50"
              }`}
              style={{ fontWeight: 600 }}
            >
              TODOS ({serviceOrders.length})
            </button>
            <button 
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-full border transition-all text-xs ${
                statusFilter === "pending" 
                  ? "bg-yellow-600 text-white border-yellow-600 shadow-sm" 
                  : "bg-white border-gray-300 hover:border-yellow-600 hover:bg-gray-50"
              }`}
              style={{ fontWeight: 600 }}
            >
              PENDENTES ({getStatusCount("pending")})
            </button>
            <button 
              onClick={() => setStatusFilter("in-progress")}
              className={`px-3 py-1 rounded-full border transition-all text-xs ${
                statusFilter === "in-progress" 
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                  : "bg-white border-gray-300 hover:border-blue-600 hover:bg-gray-50"
              }`}
              style={{ fontWeight: 600 }}
            >
              EM ANDAMENTO ({getStatusCount("in-progress")})
            </button>
            <button 
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1 rounded-full border transition-all text-xs ${
                statusFilter === "completed" 
                  ? "bg-green-600 text-white border-green-600 shadow-sm" 
                  : "bg-white border-gray-300 hover:border-green-600 hover:bg-gray-50"
              }`}
              style={{ fontWeight: 600 }}
            >
              CONCLUÍDOS ({getStatusCount("completed")})
            </button>
          </div>
        </div>
      </div>

      {/* Table Content - Scrollable */}
      <div className="flex-1 px-8 pb-8">
        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all" 
                ? "Nenhuma ordem de serviço encontrada com os filtros selecionados." 
                : "Nenhuma ordem de serviço cadastrada ainda."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md">
            {/* Table Header */}
            <div className="bg-[#8b7355] text-white grid gap-4 px-6 py-3 border-b border-gray-400" style={{ gridTemplateColumns: '80px 100px 180px 200px 1fr 120px 140px 60px' }}>
              <div 
                className="text-xs"
                style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 700 }}
              >
                O.S
              </div>
              <div 
                className="text-xs"
                style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 700 }}
              >
                DATA
              </div>
              <div 
                className="text-xs"
                style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 700 }}
              >
                CLIENTE
              </div>
              <div 
                className="text-xs"
                style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 700 }}
              >
                EQUIPAMENTO
              </div>
              <div 
                className="text-xs"
                style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 700 }}
              >
                DEFEITO
              </div>
              <div 
                className="text-xs"
                style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 700 }}
              >
                TÉCNICO
              </div>
              <div 
                className="text-xs text-center"
                style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 700 }}
              >
                STATUS
              </div>
              <div 
                className="text-xs text-center"
                style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 700 }}
              >
                AÇÕES
              </div>
            </div>

            {/* Table Body */}
            <div>
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectServiceOrder(item)}
                  className={`w-full grid gap-4 px-6 py-4 border-b border-gray-200 ${getStatusColor(item.status)} transition-all cursor-pointer`}
                  style={{ gridTemplateColumns: '80px 100px 180px 200px 1fr 120px 140px 60px' }}
                >
                  <div className="flex items-center">
                    <span 
                      className="text-sm"
                      style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 600 }}
                    >
                      #{item.osNumber || item.id.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs opacity-70">{formatDateBR(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <span 
                      className="text-sm truncate"
                      style={{ fontFamily: 'Lexend Deca, sans-serif', fontWeight: 500 }}
                    >
                      {item.clientName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs opacity-80 truncate">
                      {item.device || ''} {item.brand || ''} {item.model || ''}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs opacity-70 truncate">{item.defect || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs opacity-70 truncate">{item.technicianName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span 
                      className={`px-2 py-0.5 rounded-full text-[9px] ${getStatusBadgeColor(item.status)}`}
                      style={{ fontWeight: 700 }}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={(e) => handleOpenChangeStatus(item, e)}
                      className="p-1.5 hover:bg-black/10 rounded transition-colors"
                      title="Alterar Status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Change Status Modal */}
      <ChangeStatusModal
        isOpen={isChangeStatusModalOpen}
        onClose={() => {
          setIsChangeStatusModalOpen(false);
          setSelectedOrderForStatusChange(null);
        }}
        serviceOrder={selectedOrderForStatusChange}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
