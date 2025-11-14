import { ArrowLeft, Search, Eye, Calendar, CreditCard, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { ServiceOrder, Client } from "../types";
import { InvoiceDetailModal } from "./InvoiceDetailModal";

interface InvoicesPageProps {
  onBack: () => void;
}

export function InvoicesPage({ onBack }: InvoicesPageProps) {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load service orders and clients
  useEffect(() => {
    const loadedOrders = JSON.parse(localStorage.getItem("serviceOrders") || "[]");
    const loadedClients = JSON.parse(localStorage.getItem("clients") || "[]");
    
    // Filter only completed orders (that have invoices)
    const completedOrders = loadedOrders.filter((order: ServiceOrder) => 
      order.status === "completed" && order.completionDate
    );
    
    setServiceOrders(completedOrders);
    setClients(loadedClients);
  }, []);

  const getClientForOrder = (order: ServiceOrder): Client | undefined => {
    return clients.find(c => c.id === order.clientId);
  };

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

  const handleOpenDetail = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdatePayment = (
    osId: string,
    paymentMethod: ServiceOrder["paymentMethod"],
    paymentAmount: string
  ) => {
    const updatedOrders = serviceOrders.map(order =>
      order.id === osId
        ? { ...order, paymentMethod, paymentAmount }
        : order
    );
    
    setServiceOrders(updatedOrders);
    
    // Update in localStorage
    const allOrders = JSON.parse(localStorage.getItem("serviceOrders") || "[]");
    const updatedAllOrders = allOrders.map((order: ServiceOrder) =>
      order.id === osId
        ? { ...order, paymentMethod, paymentAmount }
        : order
    );
    localStorage.setItem("serviceOrders", JSON.stringify(updatedAllOrders));
    
    // Update selected order if it's the one being edited
    if (selectedOrder?.id === osId) {
      setSelectedOrder({ ...selectedOrder, paymentMethod, paymentAmount });
    }
  };

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.osNumber && order.osNumber.includes(searchQuery)) ||
      order.id.includes(searchQuery) ||
      order.device.toLowerCase().includes(searchQuery.toLowerCase());
    
    const hasPaid = order.paymentAmount && parseFloat(order.paymentAmount.replace(/[^\d,]/g, "").replace(",", ".")) > 0;
    const matchesFilter = 
      filterStatus === "all" || 
      (filterStatus === "paid" && hasPaid) ||
      (filterStatus === "pending" && !hasPaid);
    
    return matchesSearch && matchesFilter;
  });

  const getPaymentStatus = (order: ServiceOrder) => {
    const hasPaid = order.paymentAmount && parseFloat(order.paymentAmount.replace(/[^\d,]/g, "").replace(",", ".")) > 0;
    return hasPaid ? "paid" : "pending";
  };

  const getStatusBadge = (order: ServiceOrder) => {
    const status = getPaymentStatus(order);
    const variants = {
      paid: { label: "✅ Pago", className: "bg-green-100 text-green-800 border-green-300" },
      pending: { label: "⏳ Pendente", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPaymentMethodLabel = (method?: ServiceOrder["paymentMethod"]) => {
    const methods = {
      cash: "Dinheiro",
      card: "Cartão",
      pix: "PIX",
      transfer: "Transferência",
    };
    return method ? methods[method] : "-";
  };

  const hasActiveWarranty = (order: ServiceOrder) => {
    if (!order.warrantyEndDate) return false;
    const warrantyEnd = new Date(order.warrantyEndDate);
    const today = new Date();
    return warrantyEnd > today;
  };

  const statusCounts = {
    all: serviceOrders.length,
    paid: serviceOrders.filter(o => getPaymentStatus(o) === "paid").length,
    pending: serviceOrders.filter(o => getPaymentStatus(o) === "pending").length,
  };

  return (
    <div className="w-full h-screen bg-[#f5f0e8] overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <div>
                <h1 className="text-2xl font-bold">Notas Fiscais</h1>
                <p className="text-sm text-gray-600">Serviços concluídos e faturamento</p>
              </div>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, O.S ou equipamento..."
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
              onClick={() => setFilterStatus("paid")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "paid"
                  ? "bg-green-500 text-white"
                  : "bg-white border-2 border-gray-300 hover:border-green-500"
              }`}
            >
              Pagas ({statusCounts.paid})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-white border-2 border-gray-300 hover:border-yellow-500"
              }`}
            >
              Pendentes ({statusCounts.pending})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const client = getClientForOrder(order);
            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-[#8b7355] transition-colors cursor-pointer"
                onClick={() => handleOpenDetail(order)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {getSaleTitle(order)}
                      </h3>
                      {getStatusBadge(order)}
                      {hasActiveWarranty(order) && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                          <Shield className="w-3 h-3 mr-1" />
                          Garantia
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">{order.clientName}</p>
                    <p className="text-sm text-gray-500">
                      {order.device} - {order.brand} {order.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-[#8b7355]">
                      {order.paymentAmount || "R$ 0,00"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  {order.completionDate && (
                    <div>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Conclusão
                      </p>
                      <p className="font-semibold">
                        {new Date(order.completionDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                  {order.deliveryDate && (
                    <div>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Entrega
                      </p>
                      <p className="font-semibold">
                        {new Date(order.deliveryDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                  {order.paymentMethod && (
                    <div>
                      <p className="text-gray-600 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Pagamento
                      </p>
                      <p className="font-semibold">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </p>
                    </div>
                  )}
                  {order.warrantyEndDate && (
                    <div>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Garantia até
                      </p>
                      <p className={`font-semibold ${hasActiveWarranty(order) ? "text-amber-700" : "text-gray-500"}`}>
                        {new Date(order.warrantyEndDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(order);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {serviceOrders.length === 0 
                ? "Nenhum serviço concluído ainda"
                : "Nenhuma nota fiscal encontrada com os filtros selecionados"
              }
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <InvoiceDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrder(null);
          }}
          serviceOrder={selectedOrder}
          client={getClientForOrder(selectedOrder) || {
            id: "",
            name: selectedOrder.clientName,
            phone: "",
          }}
          onUpdatePayment={handleUpdatePayment}
        />
      )}
    </div>
  );
}