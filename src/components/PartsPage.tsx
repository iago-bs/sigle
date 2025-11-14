import { ArrowLeft, Search, Plus, Pencil, Trash2, AlertCircle, Package, Archive, Clock, ShoppingCart, Truck, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Part, StockPart, ServiceOrder } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import type { OnlinePart } from "../types";

interface PartsPageProps {
  onBack: () => void;
  parts: Part[];
  stockParts: StockPart[];
  onlineParts: OnlinePart[];
  serviceOrders: ServiceOrder[];
  onAddPart: () => void;
  onAddStockPart: () => void;
  onAddOnlinePart: () => void;
  onEditPart: (part: Part) => void;
  onDeletePart: (id: string) => void;
  onEditStockPart: (stockPart: StockPart) => void;
  onDeleteStockPart: (id: string) => void;
  onEditOnlinePart: (onlinePart: OnlinePart) => void;
  onDeleteOnlinePart: (id: string) => void;
  onSelectServiceOrder: (serviceOrder: ServiceOrder) => void;
}

const statusConfig = {
  "to-order": { label: "À Pedir", color: "bg-red-100 text-red-800 border-red-300" },
  "ordered": { label: "Pedido Realizado", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  "arriving": { label: "À Chegar", color: "bg-blue-100 text-blue-800 border-blue-300" },
  "received": { label: "Recebido", color: "bg-green-100 text-green-800 border-green-300" },
};

export function PartsPage({ 
  onBack, 
  parts, 
  stockParts,
  onlineParts,
  serviceOrders,
  onAddPart, 
  onAddStockPart,
  onAddOnlinePart,
  onEditPart, 
  onDeletePart,
  onEditStockPart,
  onDeleteStockPart,
  onEditOnlinePart,
  onDeleteOnlinePart,
  onSelectServiceOrder,
}: PartsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"orders" | "stock" | "online" | "waiting">("orders");

  // Filter parts based on search and status
  const filteredParts = parts.filter((part) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      part.name.toLowerCase().includes(query) ||
      part.osNumber.toLowerCase().includes(query) ||
      part.osDescription.toLowerCase().includes(query) ||
      part.unit?.toLowerCase().includes(query);

    const matchesStatus = filterStatus === "all" || part.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Filter stock parts based on search
  const filteredStockParts = stockParts.filter((stockPart) => {
    const query = searchQuery.toLowerCase();
    return (
      stockPart.name.toLowerCase().includes(query) ||
      stockPart.description?.toLowerCase().includes(query) ||
      stockPart.compatibleModels.some(m => m.toLowerCase().includes(query)) ||
      stockPart.compatibleBrands?.some(b => b.toLowerCase().includes(query)) ||
      stockPart.location?.toLowerCase().includes(query)
    );
  });

  // Filter O.S aguardando peças
  const waitingPartsOrders = serviceOrders.filter(
    (order) => order.status === "waiting-parts"
  );

  const filteredWaitingOrders = waitingPartsOrders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.osNumber?.toLowerCase().includes(query) ||
      order.clientName.toLowerCase().includes(query) ||
      order.device.toLowerCase().includes(query) ||
      order.brand.toLowerCase().includes(query) ||
      order.model.toLowerCase().includes(query) ||
      order.waitingParts?.some(part => part.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex-1 bg-[#f5f0e8] h-screen overflow-hidden flex flex-col">
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
            GERENCIAMENTO DE PEÇAS
          </h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "orders" | "stock" | "online" | "waiting")} className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4 mb-4">
            <TabsTrigger value="waiting">
              <Clock className="w-4 h-4 mr-1" />
              Aguardando ({waitingPartsOrders.length})
            </TabsTrigger>
            <TabsTrigger value="online">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Online ({onlineParts.length})
            </TabsTrigger>
            <TabsTrigger value="orders">Pedidos ({parts.length})</TabsTrigger>
            <TabsTrigger value="stock">Estoque ({stockParts.length})</TabsTrigger>
          </TabsList>

          {/* Search Bar - Centered */}
          <div className="max-w-[600px] mx-auto">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
              <input
                type="text"
                placeholder={activeTab === "orders" ? "Pesquisar por peça, O.S ou descrição..." : "Pesquisar por peça, modelo ou marca..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-full bg-white text-sm focus:outline-none focus:border-[#8b7355] transition-colors shadow-sm"
              />
            </div>

            {/* Status Filters - Only for Orders Tab */}
            {activeTab === "orders" && (
              <div className="flex gap-2 justify-center mb-4">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterStatus === "all"
                      ? "bg-[#8b7355] text-white border-[#8b7355]"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterStatus("to-order")}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterStatus === "to-order"
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  À Pedir
                </button>
                <button
                  onClick={() => setFilterStatus("arriving")}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterStatus === "arriving"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  À Chegar
                </button>
              </div>
            )}

            {/* Add Button */}
            {activeTab !== "waiting" && (
              <div className="flex justify-center">
                <Button 
                  onClick={activeTab === "orders" ? onAddPart : activeTab === "online" ? onAddOnlinePart : onAddStockPart}
                  className="bg-[#8b7355] hover:bg-[#7a6345] text-white rounded-full px-6 py-2 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {activeTab === "orders" ? "Nova Peça (Pedido)" : activeTab === "online" ? "Nova Peça Online" : "Adicionar ao Estoque"}
                </Button>
              </div>
            )}
          </div>

          {/* Waiting Parts Tab Content */}
          <TabsContent value="waiting" className="mt-0">
            <div className="flex-1 px-8 pb-8 overflow-y-auto max-h-[calc(100vh-380px)]">
              {filteredWaitingOrders.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma O.S aguardando peças</p>
                  <p className="text-sm mt-2">
                    {searchQuery 
                      ? "Tente outra pesquisa" 
                      : "As ordens de serviço com status 'Aguardando Peças' aparecerão aqui"}
                  </p>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto space-y-3">
                  {filteredWaitingOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onSelectServiceOrder(order)}
                      className="bg-white border-2 border-orange-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-pointer hover:border-orange-400"
                    >
                      <div className="flex items-start justify-between">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              O.S #{order.osNumber}
                            </h3>
                            <Badge className="bg-orange-500 text-white">
                              AGUARDANDO PEÇAS
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Cliente:</span>
                              <span className="ml-1 font-medium">{order.clientName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Técnico:</span>
                              <span className="ml-1">{order.technicianName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Aparelho:</span>
                              <span className="ml-1">{order.device} {order.brand} {order.model}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Defeito:</span>
                              <span className="ml-1">{order.defect}</span>
                            </div>
                          </div>

                          {/* Lista de Peças Necessárias */}
                          {order.waitingParts && order.waitingParts.length > 0 && (
                            <div className="border-t pt-3">
                              <span className="text-sm font-semibold text-orange-700">Peças Necessárias:</span>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {order.waitingParts.map((part, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-orange-50 text-orange-800 border border-orange-300 rounded-full text-sm font-medium"
                                  >
                                    {part}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="ml-4 text-orange-500">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab Content */}
          <TabsContent value="orders" className="mt-0">
            <div className="flex-1 px-8 pb-8 overflow-y-auto max-h-[calc(100vh-380px)]">
              {filteredParts.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma peça encontrada</p>
                  <p className="text-sm mt-2">
                    {searchQuery || filterStatus !== "all" 
                      ? "Tente outra pesquisa ou filtro" 
                      : "Adicione sua primeira peça"}
                  </p>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto space-y-3">
                  {filteredParts.map((part) => (
                    <div
                      key={part.id}
                      className={`bg-white border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow ${
                        part.urgent ? "border-red-500 border-l-4" : "border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        {/* Part Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {part.name}
                            </h3>
                            {part.urgent && (
                              <Badge className="bg-red-500 text-white flex items-center gap-1 text-xs">
                                <AlertCircle className="w-3 h-3" />
                                URGENTE
                              </Badge>
                            )}
                            <span className={`px-3 py-1 text-xs rounded-full border ${statusConfig[part.status].color}`}>
                              {statusConfig[part.status].label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">O.S:</span>
                              <span className="ml-1 font-medium">{part.osNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Aparelho:</span>
                              <span className="ml-1">{part.osDescription}</span>
                            </div>
                            {part.unit && (
                              <div>
                                <span className="text-gray-600">Modelo:</span>
                                <span className="ml-1">{part.unit}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Quantidade:</span>
                              <span className="ml-1 font-medium">{part.quantity}</span>
                            </div>
                            {part.price && (
                              <div>
                                <span className="text-gray-600">Preço:</span>
                                <span className="ml-1 font-medium text-green-700">{part.price}</span>
                              </div>
                            )}
                            {part.orderDate && (
                              <div>
                                <span className="text-gray-600">Pedido em:</span>
                                <span className="ml-1">{part.orderDate}</span>
                              </div>
                            )}
                            {part.expectedDate && (
                              <div>
                                <span className="text-gray-600">Previsão:</span>
                                <span className="ml-1">{part.expectedDate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onEditPart(part)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Editar peça"
                          >
                            <Pencil className="w-4 h-4 text-[#8b7355]" />
                          </button>
                          <button
                            onClick={() => onDeletePart(part.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Excluir peça"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Stock Tab Content */}
          <TabsContent value="stock" className="mt-0">
            <div className="flex-1 px-8 pb-8 overflow-y-auto max-h-[calc(100vh-380px)]">
              {filteredStockParts.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma peça em estoque</p>
                  <p className="text-sm mt-2">
                    {searchQuery 
                      ? "Nenhuma peça encontrada com esse filtro" 
                      : "Adicione peças ao estoque para ter controle do inventário"}
                  </p>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto space-y-3">
                  {filteredStockParts.map((stockPart) => (
                    <div
                      key={stockPart.id}
                      className="bg-white border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        {/* Stock Part Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {stockPart.name}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              Em Estoque: {stockPart.quantity}
                            </Badge>
                          </div>

                          {stockPart.description && (
                            <p className="text-sm text-gray-600 mb-2">{stockPart.description}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Modelos Compatíveis:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {stockPart.compatibleModels.map((model, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                    {model}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {stockPart.compatibleBrands && stockPart.compatibleBrands.length > 0 && (
                              <div>
                                <span className="text-gray-600">Marcas:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {stockPart.compatibleBrands.map((brand, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                      {brand}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {stockPart.location && (
                              <div>
                                <span className="text-gray-600">Local:</span>
                                <span className="ml-1 font-medium">{stockPart.location}</span>
                              </div>
                            )}
                          </div>

                          {stockPart.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">{stockPart.notes}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onEditStockPart(stockPart)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Editar peça"
                          >
                            <Pencil className="w-4 h-4 text-[#8b7355]" />
                          </button>
                          <button
                            onClick={() => onDeleteStockPart(stockPart.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Remover do estoque"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Online Parts Tab Content */}
          <TabsContent value="online" className="mt-0">
            <div className="flex-1 px-8 pb-8 overflow-y-auto max-h-[calc(100vh-380px)]">
              {onlineParts.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma peça pedida online</p>
                  <p className="text-sm mt-2">
                    Adicione peças pedidas online com link de rastreio e data prevista de entrega
                  </p>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto space-y-3">
                  {onlineParts.map((onlinePart) => {
                    const linkedOS = onlinePart.linkedServiceOrderId 
                      ? serviceOrders.find(so => so.id === onlinePart.linkedServiceOrderId)
                      : null;
                    
                    const statusIcons = {
                      "ordered": <ShoppingCart className="w-5 h-5" />,
                      "shipped": <Truck className="w-5 h-5" />,
                      "delivered": <CheckCircle className="w-5 h-5" />,
                      "cancelled": <XCircle className="w-5 h-5" />
                    };

                    const statusColors = {
                      "ordered": "bg-yellow-100 text-yellow-800 border-yellow-300",
                      "shipped": "bg-blue-100 text-blue-800 border-blue-300",
                      "delivered": "bg-green-100 text-green-800 border-green-300",
                      "cancelled": "bg-red-100 text-red-800 border-red-300"
                    };

                    const statusLabels = {
                      "ordered": "Pedido Feito",
                      "shipped": "Enviado",
                      "delivered": "Entregue",
                      "cancelled": "Cancelado"
                    };

                    return (
                      <div
                        key={onlinePart.id}
                        className="bg-white border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          {/* Online Part Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {onlinePart.name}
                              </h3>
                              <Badge className={statusColors[onlinePart.status]}>
                                {statusIcons[onlinePart.status]}
                                <span className="ml-1">{statusLabels[onlinePart.status]}</span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-3">
                              {onlinePart.expectedDeliveryDate && (
                                <div>
                                  <span className="text-gray-600 block">Previsão de Entrega:</span>
                                  <span className="font-medium">{new Date(onlinePart.expectedDeliveryDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                              {onlinePart.receivedDate && (
                                <div>
                                  <span className="text-gray-600 block">Data de Recebimento:</span>
                                  <span className="font-medium">{new Date(onlinePart.receivedDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600 block">Pedido em:</span>
                                <span className="font-medium">{new Date(onlinePart.orderDate).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>

                            {linkedOS && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                                <span className="text-xs text-blue-700">
                                  🔗 Vinculada à O.S #{linkedOS.osNumber || linkedOS.id.slice(-4)} - {linkedOS.clientName}
                                </span>
                              </div>
                            )}

                            {onlinePart.trackingLink && (
                              <a
                                href={onlinePart.trackingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Ver Rastreamento
                              </a>
                            )}

                            {onlinePart.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Observações:</span> {onlinePart.notes}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 ml-4">
                            <button
                              onClick={() => onEditOnlinePart(onlinePart)}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4 text-[#8b7355]" />
                            </button>
                            <button
                              onClick={() => onDeleteOnlinePart(onlinePart.id)}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
