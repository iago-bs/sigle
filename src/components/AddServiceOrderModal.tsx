import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { DEVICE_TYPES, BRANDS, PRODUCT_COLORS } from "../lib/constants";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useClients, type Client as DBClient } from "../hooks/useClients";
import { useServiceOrders } from "../hooks/useServiceOrders";
import type { Technician, StockPart } from "../types";
import { sendServiceOrderCreatedEmail } from "../lib/email-service";

interface AddServiceOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technicians: Technician[];
  stockParts: StockPart[];
  activeTechnicianId?: string | null;
  activeTechnicianName?: string | null;
  preSelectedClient?: DBClient | null;
  onSuccess?: () => void;
}

export function AddServiceOrderModal({ 
  open, 
  onOpenChange, 
  technicians, 
  stockParts, 
  activeTechnicianId, 
  activeTechnicianName, 
  preSelectedClient,
  onSuccess 
}: AddServiceOrderModalProps) {
  const { clients, loading: clientsLoading } = useClients();
  const { createServiceOrder } = useServiceOrders();
  
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<DBClient | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const lastCheckedModel = useRef("");
  const [stockPartsAvailable, setStockPartsAvailable] = useState<StockPart[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States for custom inputs
  const [showCustomDevice, setShowCustomDevice] = useState(false);
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);
  
  const [formData, setFormData] = useState({
    device: "",
    customDevice: "",
    brand: "",
    customBrand: "",
    model: "",
    serialNumber: "",
    color: "",
    customColor: "",
    accessories: "",
    technician: "",
    entryDate: "",
    problem: "",
    estimate: "",
    priority: "normal" as "normal" | "urgent" | "low"
  });

  // Effect to set pre-selected client and technician
  useEffect(() => {
    if (preSelectedClient) {
      setSelectedClient(preSelectedClient);
      setClientSearch(preSelectedClient.name);
    }
  }, [preSelectedClient]);

  // Effect to set active technician on modal open
  useEffect(() => {
    if (open && activeTechnicianName) {
      setFormData(prev => ({ ...prev, technician: activeTechnicianName }));
    }
  }, [open, activeTechnicianName]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      lastCheckedModel.current = "";
      setStockPartsAvailable([]);
    }
  }, [open]);

  // Effect to check for stock parts when model changes
  useEffect(() => {
    if (formData.model && formData.model.length >= 3) {
      const modelLower = formData.model.toLowerCase();
      const brandValue = formData.brand === "Outro" ? formData.customBrand : formData.brand;
      const brandLower = brandValue.toLowerCase();
      
      // Find matching stock parts
      const matchingParts = stockParts.filter(sp => {
        const modelMatch = sp.compatibleModels.some(m => 
          m.toLowerCase().includes(modelLower) || modelLower.includes(m.toLowerCase())
        );
        const brandMatch = !sp.compatibleBrands || sp.compatibleBrands.length === 0 || 
          sp.compatibleBrands.some(b => brandLower.includes(b.toLowerCase()));
        
        return modelMatch && brandMatch && sp.quantity > 0;
      });

      setStockPartsAvailable(matchingParts);
    } else {
      setStockPartsAvailable([]);
    }
  }, [formData.model, formData.brand, formData.customBrand, stockParts]);

  // Handle device selection
  const handleDeviceChange = (value: string) => {
    setFormData({ ...formData, device: value, customDevice: "" });
    setShowCustomDevice(value === "Outro");
  };

  // Handle brand selection
  const handleBrandChange = (value: string) => {
    setFormData({ ...formData, brand: value, customBrand: "" });
    setShowCustomBrand(value === "Outro");
  };

  // Handle color selection
  const handleColorChange = (value: string) => {
    setFormData({ ...formData, color: value, customColor: "" });
    setShowCustomColor(value === "Outro");
  };

  // Filter clients based on search (only active clients)
  const filteredClients = clients.filter(client =>
    client.is_active && (
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phone.includes(clientSearch)
    )
  );

  // Debug: Log clients info when modal opens
  useEffect(() => {
    if (open) {
      console.log('='.repeat(80));
      console.log('📋 [AddServiceOrderModal] DIAGNÓSTICO DE CLIENTES');
      console.log('📋 Total de clientes carregados:', clients.length);
      console.log('📋 Clientes ativos:', clients.filter(c => c.is_active).length);
      console.log('📋 Clientes inativos:', clients.filter(c => !c.is_active).length);
      console.log('📋 Status de carregamento:', clientsLoading ? 'CARREGANDO' : 'COMPLETO');
      console.log('📋 Busca atual:', clientSearch);
      console.log('📋 Cliente selecionado:', selectedClient ? selectedClient.name : 'NENHUM');
      console.log('📋 Cliente pré-selecionado:', preSelectedClient ? preSelectedClient.name : 'NENHUM');
      console.log('📋 Lista completa de clientes:', JSON.stringify(clients.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        is_active: c.is_active,
        shop_token: c.shop_token?.substring(0, 8) + '...'
      })), null, 2));
      console.log('='.repeat(80));
    }
  }, [open, clients, clientsLoading, clientSearch, selectedClient, preSelectedClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      toast.error("Por favor, selecione um cliente");
      return;
    }

    if (!formData.technician) {
      toast.error("Por favor, selecione um técnico");
      return;
    }

    // Get final values (use custom if "Outro" is selected)
    const finalDevice = formData.device === "Outro" ? formData.customDevice : formData.device;
    const finalBrand = formData.brand === "Outro" ? formData.customBrand : formData.brand;
    const finalColor = formData.color === "Outro" ? formData.customColor : formData.color;

    // Validate custom inputs if "Outro" was selected
    if (formData.device === "Outro" && !formData.customDevice.trim()) {
      toast.error("Por favor, especifique o tipo de aparelho");
      return;
    }

    if (formData.brand === "Outro" && !formData.customBrand.trim()) {
      toast.error("Por favor, especifique a marca");
      return;
    }

    try {
      setIsSubmitting(true);

      // Get technician ID
      const technicianId = technicians.find(t => t.name === formData.technician)?.id;

      const newServiceOrder = await createServiceOrder({
        client_id: selectedClient.id,
        client_name: selectedClient.name,
        client_phone: selectedClient.phone,
        client_whatsapp: selectedClient.whatsapp,
        equipment_type: finalDevice,
        equipment_brand: finalBrand || undefined,
        equipment_model: formData.model,
        defect: formData.problem,
        observations: formData.estimate || undefined,
        technician_id: technicianId || undefined,
        technician_name: formData.technician,
        priority: formData.priority,
        estimated_delivery_date: undefined,
      });

      toast.success("Ordem de serviço criada com sucesso!");

      // Enviar email de confirmação se o cliente tiver email
      if (selectedClient.email) {
        try {
          await sendServiceOrderCreatedEmail({
            to: selectedClient.email,
            clientName: selectedClient.name,
            osNumber: newServiceOrder.os_number,
            equipmentType: finalDevice,
            equipmentBrand: finalBrand,
            equipmentModel: formData.model,
            defect: formData.problem,
            technicianName: formData.technician,
            estimatedDeliveryDate: undefined,
          });
          console.log('✅ Email de confirmação de O.S enviado para:', selectedClient.email);
        } catch (emailError) {
          // Não falhar a criação da O.S se o email falhar
          console.error('⚠️ Erro ao enviar email de confirmação (não crítico):', emailError);
        }
      }
      
      // Reset all states
      resetForm();
      
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating service order:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar ordem de serviço");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setClientSearch("");
    setSelectedClient(null);
    lastCheckedModel.current = "";
    setShowCustomDevice(false);
    setShowCustomBrand(false);
    setShowCustomColor(false);
    setFormData({
      device: "",
      customDevice: "",
      brand: "",
      customBrand: "",
      model: "",
      serialNumber: "",
      color: "",
      customColor: "",
      accessories: "",
      technician: "",
      entryDate: "",
      problem: "",
      estimate: "",
      priority: "normal"
    });
  };

  const handleClientSelect = (client: DBClient) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  // Reset form when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>
            {preSelectedClient ? (
              <span>Criando O.S para <strong>{preSelectedClient.name}</strong></span>
            ) : (
              "Preencha os dados para criar uma nova ordem de serviço"
            )}
          </DialogDescription>
        </DialogHeader>
        <form id="create-os-form" onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-search">Cliente *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <Input
                  id="client-search"
                  placeholder="Pesquisar cliente..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientDropdown(true);
                    setSelectedClient(null);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  className={`pl-10 ${preSelectedClient ? 'bg-green-50 border-green-300' : ''}`}
                  disabled={isSubmitting}
                  required
                />
                {showClientDropdown && clientSearch && !selectedClient && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {clientsLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Carregando clientes...
                      </div>
                    ) : filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleClientSelect(client)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="text-sm">{client.name}</div>
                          <div className="text-xs text-gray-500">{client.phone}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {preSelectedClient && selectedClient && (
                <p className="text-xs text-green-600">✓ Cliente recém-cadastrado selecionado</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device">Aparelho *</Label>
              <Select 
                value={formData.device}
                onValueChange={handleDeviceChange}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger id="device">
                  <SelectValue placeholder="Selecione o aparelho" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map((device) => (
                    <SelectItem key={device} value={device}>
                      {device}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showCustomDevice && (
                <Input 
                  placeholder="Digite o tipo de aparelho"
                  value={formData.customDevice}
                  onChange={(e) => setFormData({...formData, customDevice: e.target.value})}
                  disabled={isSubmitting}
                  required
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Select 
                value={formData.brand}
                onValueChange={handleBrandChange}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showCustomBrand && (
                <Input 
                  placeholder="Digite a marca"
                  value={formData.customBrand}
                  onChange={(e) => setFormData({...formData, customBrand: e.target.value})}
                  disabled={isSubmitting}
                  required
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input 
                id="model" 
                placeholder="Ex: UN55TU8000"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                disabled={isSubmitting}
                required 
              />
              {stockPartsAvailable.length > 0 && (
                <div className="mt-2 relative">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-green-800 mb-1">
                          <span className="font-medium">Peças disponíveis em estoque!</span>
                        </p>
                        <div className="text-xs text-green-700 space-y-1">
                          {stockPartsAvailable.map((part, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <span>•</span>
                              <span>{part.name}</span>
                              <span className="font-medium">({part.quantity}x)</span>
                              {part.location && <span className="text-green-600">- {part.location}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-green-50 border-l border-t border-green-200 transform rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número de Série</Label>
              <Input 
                id="serialNumber" 
                placeholder="Ex: SN123456789"
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor do Produto</Label>
              <Select 
                value={formData.color}
                onValueChange={handleColorChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showCustomColor && (
                <Input 
                  placeholder="Digite a cor"
                  value={formData.customColor}
                  onChange={(e) => setFormData({...formData, customColor: e.target.value})}
                  disabled={isSubmitting}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessories">Acessórios que vieram com o produto</Label>
            <Input 
              id="accessories" 
              placeholder="Ex: Cabo de alimentação, Caixa, Controle remoto, Manual"
              value={formData.accessories}
              onChange={(e) => setFormData({...formData, accessories: e.target.value})}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technician">Técnico Responsável *</Label>
              <Select 
                value={formData.technician}
                onValueChange={(value: string) => setFormData({...formData, technician: value})}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger id="technician">
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.name}>
                      {tech.name}
                      {tech.name === activeTechnicianName && " (Você)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data de Entrada *</Label>
              <Input 
                id="date" 
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
                disabled={isSubmitting}
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Problema Relatado *</Label>
            <Textarea 
              id="problem" 
              placeholder="Descreva o problema..." 
              rows={3}
              value={formData.problem}
              onChange={(e) => setFormData({...formData, problem: e.target.value})}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimate">Orçamento Estimado</Label>
              <Input 
                id="estimate" 
                type="text" 
                placeholder="R$ 0,00"
                value={formData.estimate}
                onChange={(e) => setFormData({...formData, estimate: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "normal" | "urgent" | "low") => setFormData({...formData, priority: value})}
                disabled={isSubmitting}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button 
            type="submit" 
            form="create-os-form" 
            className="bg-[#8b7355] hover:bg-[#7a6345]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando..." : "Criar O.S"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
