import { ArrowLeft, Plus, Search, Calendar, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";
import type { ServiceOrder } from "../types";
import { formatDateBR, isWarrantyValid, getDaysRemainingInWarranty } from "../lib/date-utils";
import { useEquipments } from "../hooks/useEquipments";
import type { Equipment } from "../types";

interface WarrantiesPageProps {
  onBack: () => void;
  serviceOrders: ServiceOrder[];
  onSelectServiceOrder: (serviceOrder: ServiceOrder) => void;
}

export function WarrantiesPage({ onBack, serviceOrders, onSelectServiceOrder }: WarrantiesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all");
  const { equipments: manualEquipments } = useEquipments();

  // Função para identificar se é uma venda
  const isSale = (order: ServiceOrder): boolean => {
    return order.defect === "Venda de equipamento" || order.osNumber?.startsWith("VE-") || order.os_number?.startsWith("VE-");
  };

  // Função para formatar o título da venda
  const getSaleTitle = (order: ServiceOrder): string => {
    if (!isSale(order)) return `O.S #${order.osNumber || order.id}`;
    
    const date = new Date(order.entry_date || order.created_at);
    const formattedDate = date.toLocaleDateString("pt-BR");
    return `Venda de ${order.device} no dia ${formattedDate}`;
  };

  // Filter only completed orders with warranty (service orders)
  const warrantiesOrders = serviceOrders.filter(
    order => order.status === "completed" && order.warrantyEndDate
  );

  // Map manual equipments with active or expired warranty into a common shape
  type CommonWarranty = {
    id: string;
    clientName: string;
    device: string;
    brand: string;
    model: string;
    deliveryDate?: string; // sold date for sales
    warrantyEndDate: string;
    isSale: boolean;
    osNumber?: string;
    raw?: ServiceOrder | Equipment;
  };

  const equipmentWarranties: CommonWarranty[] = (manualEquipments || [])
    .filter(eq => eq.status === 'sold' && !!eq.warrantyEndDate)
    .map((eq) => ({
      id: eq.id,
      clientName: eq.soldTo || 'Cliente',
      device: eq.device,
      brand: eq.brand,
      model: eq.model,
      deliveryDate: eq.soldDate || eq.saleDate,
      warrantyEndDate: eq.warrantyEndDate!,
      isSale: true,
      osNumber: undefined,
      raw: eq,
    }));

  const serviceOrderWarranties: CommonWarranty[] = warrantiesOrders.map((o) => ({
    id: o.id,
    clientName: o.clientName || 'Cliente',
    device: o.device || '',
    brand: o.brand || '',
    model: o.model || '',
    deliveryDate: o.deliveryDate,
    warrantyEndDate: o.warrantyEndDate!,
    isSale: false,
    osNumber: o.osNumber || o.os_number,
    raw: o,
  }));

  const allWarranties: CommonWarranty[] = [...serviceOrderWarranties, ...equipmentWarranties];

  const filteredWarranties = allWarranties.filter(w => {
    const matchesSearch =
      w.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.osNumber && w.osNumber.includes(searchQuery)) ||
      w.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.model.toLowerCase().includes(searchQuery.toLowerCase());

    const status = w.warrantyEndDate ? (isWarrantyValid(w.warrantyEndDate) ? 'active' : 'expired') : 'expired';
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && status === 'active') ||
      (filterStatus === 'expired' && status === 'expired');

    return matchesSearch && matchesFilter;
  });

  const getWarrantyStatus = (order: ServiceOrder): "active" | "expired" => {
    if (!order.warrantyEndDate) return "expired";
    return isWarrantyValid(order.warrantyEndDate) ? "active" : "expired";
  };

  const getStatusBadge = (status: "active" | "expired") => {
    const variants = {
      active: { label: "Ativa", className: "bg-green-100 text-green-800 border-green-300" },
      expired: { label: "Expirada", className: "bg-red-100 text-red-800 border-red-300" }
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const statusCounts = {
    all: allWarranties.length,
    active: allWarranties.filter(o => o.warrantyEndDate && isWarrantyValid(o.warrantyEndDate)).length,
    expired: allWarranties.filter(o => o.warrantyEndDate && !isWarrantyValid(o.warrantyEndDate)).length,
  };

  return (
    <div className="w-full h-screen bg-[#f5f0e8] overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
              <div>
                <h1 className="text-2xl font-bold">Garantias</h1>
                <p className="text-sm text-gray-600">Gerencie as garantias dos serviços</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, O.S ou aparelho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-full bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "all"
                  ? "bg-[#8b7355] text-white"
                  : "bg-white border-2 border-gray-300 hover:border-[#8b7355]"
              }`}
            >
              Todas ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "active"
                  ? "bg-green-500 text-white"
                  : "bg-white border-2 border-gray-300 hover:border-green-500"
              }`}
            >
              Ativas ({statusCounts.active})
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "expired"
                  ? "bg-red-500 text-white"
                  : "bg-white border-2 border-gray-300 hover:border-red-500"
              }`}
            >
              Expiradas ({statusCounts.expired})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid gap-4">
          {filteredWarranties.map((warranty) => {
            const status = warranty.warrantyEndDate && isWarrantyValid(warranty.warrantyEndDate) ? 'active' : 'expired';
            const daysRemaining = warranty.warrantyEndDate ? getDaysRemainingInWarranty(warranty.warrantyEndDate) : 0;
            const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;

            return (
              <button
                key={warranty.id}
                onClick={() => {
                  // Se for venda de equipamento manual, não há O.S. associada.
                  if (!warranty.isSale && warranty.raw && 'osNumber' in warranty.raw) {
                    onSelectServiceOrder(warranty.raw as ServiceOrder);
                  }
                }}
                className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-[#8b7355] transition-colors text-left w-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{warranty.clientName}</h3>
                      {getStatusBadge(status as 'active' | 'expired')}
                      {isExpiringSoon && status === "active" && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Expira em breve
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {warranty.isSale ? `Venda de ${warranty.device}` : (warranty.osNumber ? `O.S #${warranty.osNumber}` : 'Serviço')}
                      {` - ${warranty.device} ${warranty.brand} ${warranty.model}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">{warranty.isSale ? "Tipo" : "Serviço Realizado"}</p>
                    <p className="font-semibold">{warranty.isSale ? "Venda de Equipamento" : "Serviço"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Data de Entrega
                    </p>
                    <p className="font-semibold">{warranty.deliveryDate ? formatDateBR(warranty.deliveryDate) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Validade
                    </p>
                    <p className="font-semibold">{warranty.warrantyEndDate ? formatDateBR(warranty.warrantyEndDate) : '—'}</p>
                    {status === "active" && (
                      <p className="text-xs text-gray-500 mt-1">
                        {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Vencida'}
                      </p>
                    )}
                  </div>
                </div>

                {!warranty.isSale && (warranty.raw as any)?.paymentMethod && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Pagamento: <span className="font-semibold">{String((warranty.raw as any).paymentMethod).toUpperCase()}</span>
                      {(warranty.raw as any).paymentAmount && ` - ${(warranty.raw as any).paymentAmount}`}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredWarranties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma garantia encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}