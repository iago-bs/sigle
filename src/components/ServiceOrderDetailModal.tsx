import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Calendar, User, Wrench, Package, AlertCircle, CheckCircle2, Clock, Printer, RefreshCw } from "lucide-react";
import type { ServiceOrder, Client, Technician } from "../types";
import { useState, useEffect } from "react";
import { formatDateBR, calculateWarrantyEndDate } from "../lib/date-utils";
import { ServiceOrderReceiptPrint } from "./ServiceOrderReceiptPrint";
import { InvoiceDocument } from "./InvoiceDocument";
import { CompleteServiceOrderTypeModal } from "./CompleteServiceOrderTypeModal";
import { ChangeStatusModal } from "./ChangeStatusModal";

interface ServiceOrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrder: ServiceOrder | null;
  clients: Client[];
  technicians: Technician[];
  onUpdateServiceOrder: (serviceOrder: ServiceOrder) => void;
  onMarkAsReady: (serviceOrder: ServiceOrder) => void;
  onCompleteWithoutRepair?: (serviceOrder: ServiceOrder, reason: "refused" | "no-repair") => void;
  onNavigate?: (page: string) => void;
  isFromHistory?: boolean;
}

export function ServiceOrderDetailModal({ 
  open, 
  onOpenChange, 
  serviceOrder,
  clients,
  technicians,
  onUpdateServiceOrder,
  onMarkAsReady,
  onCompleteWithoutRepair,
  onNavigate,
  isFromHistory = false
}: ServiceOrderDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCompleteTypeModalOpen, setIsCompleteTypeModalOpen] = useState(false);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    device: "",
    brand: "",
    model: "",
    serialNumber: "",
    color: "",
    accessories: "",
    defect: "",
    observations: "",
    status: "pending" as ServiceOrder["status"],
    technicianId: "",
    priority: "normal" as "normal" | "urgent" | "low"
  });

  // Update form when serviceOrder changes
  useEffect(() => {
    if (serviceOrder) {
      setFormData({
        device: serviceOrder.device || "",
        brand: serviceOrder.brand || "",
        model: serviceOrder.model || "",
        serialNumber: serviceOrder.serialNumber || "",
        color: serviceOrder.color || "",
        accessories: serviceOrder.accessories || "",
        defect: serviceOrder.defect || "",
        observations: serviceOrder.observations || "",
        status: serviceOrder.status,
        technicianId: serviceOrder.technicianId || "",
        priority: ((["normal","urgent","low"] as const).includes(serviceOrder.priority as any)
          ? (serviceOrder.priority as "normal"|"urgent"|"low")
          : "normal")
      });
    }
  }, [serviceOrder]);

  if (!serviceOrder) return null;

  // Identifica se esta O.S representa uma VENDA (nota fiscal) e não um serviço
  const isSale = (order: ServiceOrder): boolean => {
    return (
      order.defect === "Venda de equipamento" ||
      order.osNumber?.startsWith("VE-") ||
      order.os_number?.startsWith("VE-")
    );
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return new Date().toLocaleDateString("pt-BR");
    const date = new Date(isoDate);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleSave = () => {
    const selectedTechnician = technicians.find(t => t.id === formData.technicianId);
    
    const updatedServiceOrder: ServiceOrder = {
      ...serviceOrder,
      device: formData.device,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber || undefined,
      color: formData.color || undefined,
      accessories: formData.accessories || undefined,
      defect: formData.defect,
      observations: formData.observations,
      status: formData.status,
      technicianId: formData.technicianId,
      technicianName: selectedTechnician?.name || serviceOrder.technicianName,
      priority: formData.priority,
      updatedAt: new Date().toISOString()
    };

    onUpdateServiceOrder(updatedServiceOrder);
    setIsEditing(false);
  };

  const handleMarkAsComplete = () => {
    setIsCompleteTypeModalOpen(true);
  };

  const handleSelectCompleteType = (type: "repaired" | "refused" | "no-repair") => {
    setIsCompleteTypeModalOpen(false);
    
    if (type === "repaired") {
      // Cliente autorizou - vai para o fluxo normal de conclusão com orçamento
      onMarkAsReady(serviceOrder);
    } else if (onCompleteWithoutRepair) {
      // Cliente não autorizou ou não tem conserto - inativa a O.S
      const reason = type === "refused" ? "refused" : "no-repair";
      onCompleteWithoutRepair(serviceOrder, reason);
      onOpenChange(false);
    }
  };

  const handleChangeStatus = () => {
    setIsChangeStatusModalOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: ServiceOrder["status"], waitingParts?: string[]) => {
    const nowIso = new Date().toISOString();
    const updatedOrder: ServiceOrder = {
      ...serviceOrder,
      status: newStatus,
      waitingParts: newStatus === "waiting-parts" ? waitingParts : undefined,
      updatedAt: nowIso,
    };

    // If marking as completed from this modal, set warranty fields when missing
    if (newStatus === "completed") {
      const warrantyMonths = updatedOrder.warrantyMonths || 3;
      const start = updatedOrder.warrantyStartDate || nowIso;
      const end = updatedOrder.warrantyEndDate || calculateWarrantyEndDate(start, warrantyMonths);
      updatedOrder.warrantyMonths = warrantyMonths;
      updatedOrder.warrantyStartDate = start;
      updatedOrder.warrantyEndDate = end;
      updatedOrder.completionDate = updatedOrder.completionDate || nowIso;
      updatedOrder.deliveryDate = updatedOrder.deliveryDate || nowIso;
    }

    onUpdateServiceOrder(updatedOrder);
    setIsChangeStatusModalOpen(false);

    // Se o status for "waiting-parts" e temos navegação, redirecionar para peças
    if (newStatus === "waiting-parts" && onNavigate) {
      onOpenChange(false);
      onNavigate("parts");
    }
  };

  const getStatusBadge = (status: ServiceOrder["status"]) => {
    const statusConfig = {
      "pending": { label: "Pendente", variant: "secondary" as const },
      "in-progress": { label: "Em Andamento", variant: "default" as const },
      "waiting-parts": { label: "Aguardando Peças", variant: "outline" as const },
      "under-observation": { label: "Em Observação", variant: "outline" as const },
      "waiting-client-response": { label: "Aguardando Cliente", variant: "outline" as const },
      "abandoned": { label: "Abandonado", variant: "destructive" as const },
      "completed": { label: "Concluído", variant: "default" as const },
      "cancelled": { label: "Cancelado", variant: "destructive" as const }
    };
    
    const config = statusConfig[status] || statusConfig["pending"];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === "normal") return null;
    
    const priorityConfig = {
      "urgent": { label: "URGENTE", className: "bg-red-100 text-red-700 border-red-300" },
      "low": { label: "Baixa", className: "bg-gray-100 text-gray-700 border-gray-300" }
    };
    
    const config = priorityConfig[priority as "urgent" | "low"];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                O.S #{serviceOrder.osNumber || serviceOrder.id.slice(-4)}
              </DialogTitle>
              <DialogDescription>
                Criada em {formatDateBR(serviceOrder.createdAt)}
                {serviceOrder.updatedAt && ` • Atualizada em ${formatDateBR(serviceOrder.updatedAt)}`}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(serviceOrder.status)}
              {getPriorityBadge(serviceOrder.priority)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              <span>Informações do Cliente</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Nome</Label>
                  <p className="font-medium">{serviceOrder.clientName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Telefone</Label>
                  <p className="font-medium">
                    {clients.find(c => c.id === serviceOrder.clientId)?.phone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Equipment Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4" />
              <span>Equipamento</span>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="device">Aparelho *</Label>
                    <Input
                      id="device"
                      value={formData.device}
                      onChange={(e) => setFormData({...formData, device: e.target.value})}
                      placeholder="Ex: TV"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="Ex: Samsung"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="Ex: UN55TU8000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serialNumber">Número de Série</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                      placeholder="Ex: SN123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="Ex: Preto"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accessories">Acessórios</Label>
                  <Input
                    id="accessories"
                    value={formData.accessories}
                    onChange={(e) => setFormData({...formData, accessories: e.target.value})}
                    placeholder="Ex: Cabo, Caixa, Controle"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-medium">
                  {serviceOrder.device} {serviceOrder.brand} {serviceOrder.model}
                </p>
                {(serviceOrder.serialNumber || serviceOrder.color || serviceOrder.accessories) && (
                  <div className="text-sm text-gray-700 space-y-1 pt-2 border-t border-gray-200">
                    {serviceOrder.serialNumber && (
                      <p><span className="text-gray-600">N° Série:</span> {serviceOrder.serialNumber}</p>
                    )}
                    {serviceOrder.color && (
                      <p><span className="text-gray-600">Cor:</span> {serviceOrder.color}</p>
                    )}
                    {serviceOrder.accessories && (
                      <p><span className="text-gray-600">Acessórios:</span> {serviceOrder.accessories}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Service Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Wrench className="w-4 h-4" />
              <span>Informações do Serviço</span>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="technician">Técnico Responsável *</Label>
                  <Select 
                    value={formData.technicianId}
                    onValueChange={(value: string) => setFormData({...formData, technicianId: value})}
                  >
                    <SelectTrigger id="technician">
                      <SelectValue placeholder="Selecione o técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="defect">Defeito Relatado *</Label>
                  <Textarea
                    id="defect"
                    value={formData.defect}
                    onChange={(e) => setFormData({...formData, defect: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status}
                      onValueChange={(value: ServiceOrder["status"]) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in-progress">Em Andamento</SelectItem>
                        <SelectItem value="waiting-parts">Aguardando Peças</SelectItem>
                        <SelectItem value="under-observation">Em Observação</SelectItem>
                        <SelectItem value="waiting-client-response">Aguardando Cliente</SelectItem>
                        <SelectItem value="abandoned">Abandonado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select 
                      value={formData.priority}
                      onValueChange={(value: "normal" | "urgent" | "low") => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Técnico Responsável</Label>
                  <p className="font-medium">{serviceOrder.technicianName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Defeito Relatado</Label>
                  <p>{serviceOrder.defect}</p>
                </div>
                {serviceOrder.observations && (
                  <div>
                    <Label className="text-xs text-gray-600">Observações</Label>
                    <p className="text-sm text-gray-700">{serviceOrder.observations}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Entry Date */}
          {serviceOrder.entryDate && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">Data de Entrada:</span>
                <span className="font-medium">{formatDateBR(serviceOrder.entryDate)}</span>
              </div>
            </>
          )}

          {/* Warranty Information (if completed) */}
          {serviceOrder.status === "completed" && serviceOrder.warrantyEndDate && (
            <>
              <Separator />
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-800 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Garantia Ativa</span>
                </div>
                <div className="text-sm text-green-700">
                  <p>Válida até: <strong>{formatDateBR(serviceOrder.warrantyEndDate)}</strong></p>
                  {serviceOrder.paymentMethod && (
                    <p>Pagamento: <strong>{serviceOrder.paymentMethod.toUpperCase()}</strong></p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-end items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="bg-[#8b7355] hover:bg-[#7a6345]">
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </>
          ) : (
            <>
              {isSale(serviceOrder) ? (
                <Button 
                  variant="outline" 
                  onClick={() => setIsInvoiceOpen(true)}
                  className="border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355]/10"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Nota Fiscal
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setIsReceiptOpen(true)}
                  className="border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355]/10"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Recibo
                </Button>
              )}
              
              {/* Botão de Editar O.S - disponível para todos os status exceto completed e cancelled */}
              {serviceOrder.status !== "completed" && serviceOrder.status !== "cancelled" && (
                <Button onClick={() => setIsEditing(true)} className="bg-[#8b7355] hover:bg-[#7a6345]">
                  Editar O.S
                </Button>
              )}
              
              {/* Botão "Marcar como Completo" - só aparece quando O.S estiver ativa (não desativada) */}
              {serviceOrder.status !== "completed" && serviceOrder.status !== "cancelled" && (
                <Button 
                  onClick={handleMarkAsComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como Completo
                </Button>
              )}
              
              {/* Botão "Status" - aparece em QUALQUER status (exceto completed e cancelled) */}
              {serviceOrder.status !== "completed" && serviceOrder.status !== "cancelled" && (
                <Button 
                  onClick={handleChangeStatus}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Status
                </Button>
              )}
              
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
      
      {/* Receipt Print Modal */}
      {isReceiptOpen && (
        <ServiceOrderReceiptPrint
          serviceOrder={serviceOrder}
          client={clients.find(c => c.id === serviceOrder.clientId) || {
            id: serviceOrder.clientId || '',
            name: serviceOrder.clientName || 'Cliente não encontrado',
            phone: '',
            isActive: true
          }}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}

      {/* Nota Fiscal (para vendas) */}
      {isInvoiceOpen && isSale(serviceOrder) && (() => {
        const invoiceData = {
          id: `INV-${serviceOrder.id}`,
          osNumber: serviceOrder.osNumber || serviceOrder.os_number || serviceOrder.id,
          clientName: serviceOrder.clientName || serviceOrder.client_name || "Cliente",
          clientPhone: serviceOrder.client_phone || "",
          device: `${serviceOrder.device || serviceOrder.equipment_type} - ${serviceOrder.brand || serviceOrder.equipment_brand || ""} ${serviceOrder.model || serviceOrder.equipment_model || ""}`.trim(),
          items: [
            {
              description: serviceOrder.defect || "Venda de equipamento",
              quantity: 1,
              unitPrice: serviceOrder.paymentAmount || "R$ 0,00",
              total: serviceOrder.paymentAmount || "R$ 0,00",
            },
          ],
          totalValue: serviceOrder.paymentAmount || "R$ 0,00",
          issueDate: formatDate(serviceOrder.completionDate || serviceOrder.completion_date || serviceOrder.deliveryDate || serviceOrder.delivery_date),
          warrantyEndDate: formatDate(serviceOrder.warrantyEndDate),
          technicianName: serviceOrder.technicianName || serviceOrder.technician_name || "Técnico Responsável",
        };

        return (
          <InvoiceDocument
            invoice={invoiceData}
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
          />
        );
      })()}

      {/* Complete Type Selection Modal */}
      <CompleteServiceOrderTypeModal
        open={isCompleteTypeModalOpen}
        onOpenChange={setIsCompleteTypeModalOpen}
        serviceOrder={serviceOrder}
        onSelectType={handleSelectCompleteType}
      />

      {/* Change Status Modal */}
      <ChangeStatusModal
        isOpen={isChangeStatusModalOpen}
        onClose={() => setIsChangeStatusModalOpen(false)}
        serviceOrder={serviceOrder}
        onStatusChange={handleStatusChange}
      />
    </Dialog>
  );
}
