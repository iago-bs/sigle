import { ArrowLeft, Search, TrendingUp, AlertCircle, Wrench, Calendar, BarChart3, Plus, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { Badge } from "./ui/badge";
import type { ServiceOrder, Equipment, Client } from "../types";
import { SellEquipmentModal } from "./SellEquipmentModal";

interface EquipmentsPageProps {
  onBack: () => void;
  serviceOrders: ServiceOrder[];
  equipments: Equipment[];
  clients: Client[];
  onViewServiceOrder: (serviceOrder: ServiceOrder) => void;
  onAddEquipment: () => void;
  onSellEquipment: (invoice: ServiceOrder, equipmentId?: string) => void;
  onCreateClient: (clientData: any) => Promise<void>;
}

// Agrupa ordens de serviço por equipamento (brand + model)
interface EquipmentStats {
  brand: string;
  model: string;
  device: string;
  totalServices: number;
  serviceOrders: ServiceOrder[];
  defects: { defect: string; count: number; percentage: number }[];
  lastServiceDate: string;
  serialNumbers: string[];
  notes?: string;
  isManual?: boolean; // Flag para equipamentos cadastrados manualmente
  equipmentId?: string; // ID do equipamento manual
  color?: string;
  serialNumber?: string;
}

function groupServiceOrdersByEquipment(
  serviceOrders: ServiceOrder[], 
  manualEquipments: Equipment[]
): EquipmentStats[] {
  const equipmentMap = new Map<string, EquipmentStats>();

  // Primeiro, adicionar equipamentos cadastrados manualmente
  manualEquipments.forEach((eq) => {
    // Skip if brand or model is missing
    if (!eq.brand || !eq.model) return;
    
    const key = `${eq.brand.toLowerCase()}_${eq.model.toLowerCase()}`;
    
    if (!equipmentMap.has(key)) {
      equipmentMap.set(key, {
        brand: eq.brand,
        model: eq.model,
        device: eq.device,
        totalServices: 0,
        serviceOrders: [],
        defects: [],
        lastServiceDate: eq.lastServiceDate || new Date().toISOString(),
        serialNumbers: eq.serialNumber ? [eq.serialNumber] : [],
        notes: eq.notes,
        isManual: true,
        equipmentId: eq.id,
        color: eq.color,
        serialNumber: eq.serialNumber,
      });
    }
  });

  // Depois, adicionar/mesclar com equipamentos das O.S
  serviceOrders.forEach((os) => {
    // Skip if brand or model is missing
    if (!os.equipment_brand || !os.equipment_model) return;
    
    // Chave única: brand + model (case insensitive)
    const key = `${os.equipment_brand.toLowerCase()}_${os.equipment_model.toLowerCase()}`;

    if (!equipmentMap.has(key)) {
      equipmentMap.set(key, {
        brand: os.equipment_brand,
        model: os.equipment_model,
        device: os.equipment_type,
        totalServices: 0,
        serviceOrders: [],
        defects: [],
        lastServiceDate: os.created_at,
        serialNumbers: [],
        isManual: false,
      });
    }

    const equipment = equipmentMap.get(key)!;
    equipment.totalServices++;
    equipment.serviceOrders.push(os);

    // Atualizar última data de serviço
    const currentDate = os.entry_date || os.created_at;
    if (currentDate && currentDate > equipment.lastServiceDate) {
      equipment.lastServiceDate = currentDate;
    }

    // Coletar números de série únicos
    if (os.serialNumber && !equipment.serialNumbers.includes(os.serialNumber)) {
      equipment.serialNumbers.push(os.serialNumber);
    }
  });

  // Calcular estatísticas de defeitos
  equipmentMap.forEach((equipment) => {
    const defectMap = new Map<string, number>();

    equipment.serviceOrders.forEach((os) => {
      const defect = os.defect.trim();
      defectMap.set(defect, (defectMap.get(defect) || 0) + 1);
    });

    equipment.defects = Array.from(defectMap.entries())
      .map(([defect, count]) => ({
        defect,
        count,
        percentage: Math.round((count / equipment.totalServices) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  });

  return Array.from(equipmentMap.values()).sort((a, b) => b.totalServices - a.totalServices);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function EquipmentsPage({ onBack, serviceOrders, equipments: manualEquipments, clients, onViewServiceOrder, onAddEquipment, onSellEquipment, onCreateClient }: EquipmentsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentStats | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [equipmentToSell, setEquipmentToSell] = useState<Equipment | null>(null);
  const [activeTab, setActiveTab] = useState<"disponiveis" | "vendidos" | "garantia">("disponiveis");

  // Agrupar equipamentos (mesclar manuais + O.S)
  const allEquipments = groupServiceOrdersByEquipment(serviceOrders, manualEquipments);

  // Filtrar por status (disponível, vendido, garantia)
  const now = new Date();
  const availableEquipments = allEquipments.filter(eq => {
    const manual = manualEquipments.find(m => m.id === eq.equipmentId);
    return !manual?.status || manual.status === "available";
  });

  const soldEquipments = allEquipments.filter(eq => {
    const manual = manualEquipments.find(m => m.id === eq.equipmentId);
    const isSold = manual?.status === "sold";
    if (isSold) {
      console.log('[EquipmentsPage] Equipamento vendido encontrado:', {
        id: manual?.id,
        device: eq.device,
        brand: eq.brand,
        model: eq.model,
        status: manual?.status,
        warrantyEndDate: manual?.warrantyEndDate
      });
    }
    return isSold;
  });

  const warrantyEquipments = allEquipments.filter(eq => {
    const manual = manualEquipments.find(m => m.id === eq.equipmentId);
    
    // Debug: Log todos os equipamentos vendidos
    if (manual?.status === "sold") {
      console.log('[EquipmentsPage] Equipamento vendido (checando garantia):', {
        id: manual.id,
        device: eq.device,
        status: manual.status,
        warrantyEndDate: manual.warrantyEndDate,
        hasWarrantyEndDate: !!manual.warrantyEndDate
      });
    }
    
    if (manual?.status === "sold" && manual.warrantyEndDate) {
      const warrantyEnd = new Date(manual.warrantyEndDate);
      const isInWarranty = warrantyEnd >= now;
      console.log('[EquipmentsPage] Verificando garantia:', {
        device: eq.device,
        warrantyEnd: warrantyEnd.toISOString(),
        now: now.toISOString(),
        isInWarranty
      });
      return isInWarranty;
    }
    return false;
  });

  // Filtrar equipamentos baseado na aba ativa
  let displayEquipments = availableEquipments;
  if (activeTab === "vendidos") {
    displayEquipments = soldEquipments;
  } else if (activeTab === "garantia") {
    displayEquipments = warrantyEquipments;
  }

  // Filtrar por busca
  const filteredEquipments = displayEquipments.filter(
    (eq) =>
      eq.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.device.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSellClick = (equipment: EquipmentStats) => {
    if (!equipment.equipmentId) return;
    
    // Encontrar o equipamento manual original
    const originalEquipment = manualEquipments.find(e => e.id === equipment.equipmentId);
    if (originalEquipment) {
      setEquipmentToSell(originalEquipment);
      setIsSellModalOpen(true);
    }
  };

  const handleSellComplete = (invoice: ServiceOrder) => {
    onSellEquipment(invoice, equipmentToSell?.id);
    setIsSellModalOpen(false);
    setEquipmentToSell(null);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
  <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setSelectedEquipment(null);
                onBack();
              }}
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-[#181717] font-['Lexend_Deca']">Equipamentos - Análise Estatística</h1>
              <p className="text-sm text-gray-600">
                {allEquipments.length} modelo{allEquipments.length !== 1 ? "s" : ""} diferente
                {allEquipments.length !== 1 ? "s" : ""} • {serviceOrders.length} O.S registrada
                {serviceOrders.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          
          {/* Add Equipment Button */}
          <Button
            onClick={onAddEquipment}
            className="bg-[#8b7355] hover:bg-[#7a6345] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Equipamento
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setActiveTab("disponiveis")}
            variant={activeTab === "disponiveis" ? "default" : "outline"}
            className={activeTab === "disponiveis" ? "bg-[#8b7355] hover:bg-[#7a6345]" : ""}
          >
            Disponíveis ({availableEquipments.length})
          </Button>
          <Button
            onClick={() => setActiveTab("vendidos")}
            variant={activeTab === "vendidos" ? "default" : "outline"}
            className={activeTab === "vendidos" ? "bg-[#8b7355] hover:bg-[#7a6345]" : ""}
          >
            Vendidos ({soldEquipments.length})
          </Button>
          {/* Botão 'Em Garantia' removido: garantias devem ser gerenciadas na página dedicada 'Garantias' */}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por marca, modelo ou tipo de aparelho..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#f5f0e8]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedEquipment ? (
          // Detalhe do Equipamento
          <div className="p-6">
            <Button
              onClick={() => setSelectedEquipment(null)}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para lista
            </Button>

            {/* Cabeçalho do Equipamento */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-['Lexend_Deca'] text-[#181717]">
                      {selectedEquipment.device}
                    </h2>
                    {selectedEquipment.isManual && selectedEquipment.totalServices === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Cadastro Manual
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{selectedEquipment.brand} {selectedEquipment.model}</p>
                  {selectedEquipment.serialNumbers.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Números de Série: {selectedEquipment.serialNumbers.join(", ")}
                    </p>
                  )}
                  {selectedEquipment.notes && (
                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                      <span className="font-medium">Observações:</span> {selectedEquipment.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#8b7355]">
                        {selectedEquipment.totalServices}
                      </div>
                      <div className="text-gray-600">Serviços</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#8b7355]">
                        {selectedEquipment.defects.length}
                      </div>
                      <div className="text-gray-600">Defeitos Únicos</div>
                    </div>
                  </div>
                  {selectedEquipment.isManual && selectedEquipment.equipmentId && (
                    <div>
                      {/* Verificar se já foi vendido */}
                      {(() => {
                        const manual = manualEquipments.find(m => m.id === selectedEquipment.equipmentId);
                        const isAlreadySold = (manual?.status === "sold") || !!manual?.soldDate || !!manual?.warrantyEndDate;
                        
                        if (isAlreadySold) {
                          return (
                            <div className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-center">
                              <span className="text-sm text-gray-600">✓ Equipamento já vendido</span>
                            </div>
                          );
                        }
                        
                        return (
                          <Button
                            onClick={() => handleSellClick(selectedEquipment)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Vender
                          </Button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Último serviço: {formatDate(selectedEquipment.lastServiceDate)}
              </div>
            </div>

            {/* Estatísticas de Defeitos */}
            {selectedEquipment.totalServices > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-[#8b7355]" />
                  <h3 className="font-['Lexend_Deca'] text-lg text-[#181717]">
                    Problemas Recorrentes
                  </h3>
                </div>

                <div className="space-y-3">
                {selectedEquipment.defects.map((defect, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{defect.defect}</span>
                        <span className="text-sm font-bold text-[#8b7355]">{defect.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#8b7355] h-2 rounded-full transition-all"
                          style={{ width: `${defect.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {defect.count} ocorrência{defect.count !== 1 ? "s" : ""} de{" "}
                        {selectedEquipment.totalServices}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

                {/* Alerta de problema crítico - só mostra se ocorreu mais de 3 vezes */}
                {selectedEquipment.defects.length > 0 &&
                  selectedEquipment.defects[0].count > 3 &&
                  selectedEquipment.defects[0].percentage >= 50 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-amber-900">Problema Crítico Identificado</div>
                        <div className="text-xs text-amber-700 mt-1">
                          Este modelo apresenta "{selectedEquipment.defects[0].defect}" em{" "}
                          {selectedEquipment.defects[0].percentage}% dos casos ({selectedEquipment.defects[0].count} vezes). Considere manter peças de
                          reposição em estoque.
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Lista de Ordens de Serviço */}
            {selectedEquipment.totalServices > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-5 h-5 text-[#8b7355]" />
                  <h3 className="font-['Lexend_Deca'] text-lg text-[#181717]">
                    Histórico de Serviços ({selectedEquipment.totalServices})
                  </h3>
                </div>

              <div className="space-y-2">
                {selectedEquipment.serviceOrders
                  .sort((a, b) => {
                    const dateA = new Date(b.entry_date || b.created_at || "");
                    const dateB = new Date(a.entry_date || a.created_at || "");
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map((os) => (
                    <button
                      key={os.id}
                      onClick={() => onViewServiceOrder(os)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">O.S #{os.osNumber}</span>
                          <Badge
                            variant={
                              os.status === "completed"
                                ? "default"
                                : os.status === "in-progress"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {os.status === "completed"
                              ? "Concluído"
                              : os.status === "in-progress"
                              ? "Em andamento"
                              : os.status === "waiting-parts"
                              ? "Aguardando peças"
                              : os.status === "cancelled"
                              ? "Cancelado"
                              : "Pendente"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Cliente:</span> {os.clientName}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Defeito:</span> {os.defect}
                        </div>
                        {os.serialNumber && (
                          <div className="text-xs text-gray-500 mt-1">S/N: {os.serialNumber}</div>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {formatDate(os.entry_date || os.created_at || "")}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
            )}
          </div>
        ) : (
          // Lista de Equipamentos
          <div className="p-6">
            {filteredEquipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-500 mb-2">
                  {searchQuery ? "Nenhum equipamento encontrado" : "Nenhum equipamento registrado"}
                </h3>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? "Tente ajustar sua busca"
                    : "Equipamentos são registrados automaticamente ao criar O.S ou podem ser cadastrados manualmente"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipments.map((equipment, index) => {
                  const topDefect = equipment.defects[0];
                  const hasRecurrentIssue = topDefect && topDefect.percentage >= 50;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedEquipment(equipment)}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#8b7355] transition-all text-left"
                    >
                      {/* Cabeçalho do Card */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-['Lexend_Deca'] font-medium text-lg text-gray-900">
                              {equipment.device}
                            </h3>
                            {equipment.isManual && equipment.totalServices === 0 && (
                              <Badge variant="outline" className="text-xs">
                                Manual
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{equipment.brand} - {equipment.model}</p>
                        </div>
                        {hasRecurrentIssue && (
                          <div className="bg-amber-100 p-1.5 rounded-full" title="Problema recorrente">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                      </div>

                      {/* Estatísticas */}
                      <div className="flex items-center gap-4 mb-3 py-2 border-t border-b border-gray-100">
                        <div className="text-center">
                          <div className="text-xl font-bold text-[#8b7355]">
                            {equipment.totalServices}
                          </div>
                          <div className="text-xs text-gray-600">
                            {equipment.totalServices === 1 ? "serviço" : "serviços"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-[#8b7355]">
                            {equipment.defects.length}
                          </div>
                          <div className="text-xs text-gray-600">
                            {equipment.defects.length === 1 ? "defeito" : "defeitos"}
                          </div>
                        </div>
                      </div>

                      {/* Problema mais comum */}
                      {equipment.isManual && equipment.totalServices === 0 ? (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 italic">
                            Equipamento sem histórico de reparo
                          </div>
                        </div>
                      ) : topDefect ? (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1">Problema mais comum:</div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate flex-1">
                              {topDefect.defect}
                            </p>
                            <Badge
                              variant={topDefect.percentage >= 50 ? "destructive" : "secondary"}
                              className="ml-2"
                            >
                              {topDefect.percentage}%
                            </Badge>
                          </div>
                        </div>
                      ) : equipment.totalServices === 0 ? (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 italic">
                            Aguardando primeira O.S para análise
                          </div>
                        </div>
                      ) : null}

                      {/* Última data de serviço ou Botão Vender */}
                      {equipment.isManual && equipment.equipmentId ? (
                        <div className="flex items-center justify-between gap-2 mt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {equipment.lastServiceDate ? formatDate(equipment.lastServiceDate) : 'Sem serviços'}
                          </div>
                          {(() => {
                            const manual = manualEquipments.find(m => m.id === equipment.equipmentId);
                            const isAlreadySold = (manual?.status === "sold") || !!manual?.soldDate || !!manual?.warrantyEndDate;
                            
                            if (isAlreadySold) {
                              return (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  ✓ Vendido
                                </span>
                              );
                            }
                            
                            return (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSellClick(equipment);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-2"
                              >
                                <DollarSign className="w-3 h-3 mr-1" />
                                Vender
                              </Button>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                          <Calendar className="w-3 h-3" />
                          Último: {formatDate(equipment.lastServiceDate)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {!selectedEquipment && filteredEquipments.length > 0 && (
        <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {filteredEquipments.length} de {displayEquipments.length} modelo
              {displayEquipments.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-4">
              <span>Total de O.S: {serviceOrders.length}</span>
              <span>
                Média de serviços por modelo:{" "}
                {allEquipments.length > 0
                  ? (serviceOrders.length / allEquipments.length).toFixed(1)
                  : "0"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Venda */}
      <SellEquipmentModal
        open={isSellModalOpen}
        onOpenChange={setIsSellModalOpen}
        equipment={equipmentToSell}
        clients={clients}
        onSell={handleSellComplete}
        onCreateClient={onCreateClient}
      />
    </div>
  );
}
