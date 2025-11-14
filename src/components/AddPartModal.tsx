import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useState, useEffect } from "react";
import { Search, Package } from "lucide-react";
import { toast } from "sonner";
import type { Part, ServiceOrder } from "../types";
import { PART_TYPES } from "../lib/constants";

interface AddPartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPart: (part: Part) => void;
  serviceOrders?: ServiceOrder[];
}

export function AddPartModal({ open, onOpenChange, onAddPart, serviceOrders = [] }: AddPartModalProps) {
  const [mode, setMode] = useState<'os' | 'avulsa'>('os');
  const [selectedOsId, setSelectedOsId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    osNumber: "",
    osDescription: "",
    name: "",
    quantity: "1",
    unit: "",
    status: "to-order" as Part["status"],
    urgent: false,
    price: "",
    orderDate: "",
    expectedDate: ""
  });

  // Filter active service orders (not completed or cancelled)
  const activeServiceOrders = serviceOrders.filter(
    so => so.status !== "completed" && so.status !== "cancelled"
  );

  // Filter service orders based on search
  const filteredServiceOrders = activeServiceOrders.filter(so => {
    const query = searchQuery.toLowerCase();
    return (
      so.osNumber?.toLowerCase().includes(query) ||
      so.clientName?.toLowerCase().includes(query) ||
      so.device?.toLowerCase().includes(query) ||
      so.brand?.toLowerCase().includes(query) ||
      so.model?.toLowerCase().includes(query)
    );
  });

  // Auto-complete form when O.S is selected
  useEffect(() => {
    if (selectedOsId && mode === 'os') {
      const selectedOs = serviceOrders.find(so => so.id === selectedOsId);
      if (selectedOs) {
        setFormData(prev => ({
          ...prev,
          osNumber: selectedOs.osNumber || selectedOs.id.slice(-4),
          osDescription: `${selectedOs.device} ${selectedOs.brand} ${selectedOs.model}`.trim()
        }));
      }
    }
  }, [selectedOsId, mode, serviceOrders]);

  // Reset form when mode changes
  useEffect(() => {
    if (mode === 'avulsa') {
      setSelectedOsId("");
      setFormData(prev => ({
        ...prev,
        osNumber: "AVULSA",
        osDescription: "Peça Avulsa - Estoque"
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        osNumber: "",
        osDescription: ""
      }));
    }
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for O.S mode
    if (mode === 'os' && !selectedOsId) {
      toast.error("Selecione uma O.S", {
        description: "Por favor, selecione uma O.S antes de continuar"
      });
      return;
    }

    // Validation for part name
    if (!formData.name) {
      toast.error("Tipo de peça obrigatório", {
        description: "Por favor, selecione o tipo de peça"
      });
      return;
    }
    
    const newPart: Part = {
      id: Date.now().toString(),
      name: formData.name,
      osNumber: formData.osNumber,
      osDescription: formData.osDescription,
      quantity: parseInt(formData.quantity),
      unit: formData.unit || "",
      status: formData.status,
      urgent: formData.urgent,
      price: formData.price || undefined,
      orderDate: formData.orderDate || undefined,
      expectedDate: formData.expectedDate || undefined
    };

    onAddPart(newPart);
    
    // Show success message
    if (mode === 'avulsa') {
      toast.success("Peça avulsa adicionada!", {
        description: `${formData.name} adicionada com sucesso`
      });
    } else {
      const selectedOs = serviceOrders.find(so => so.id === selectedOsId);
      toast.success("Peça vinculada à O.S!", {
        description: `${formData.name} vinculada à O.S #${selectedOs?.osNumber || selectedOs?.id.slice(-4)}`
      });
    }
    
    // Reset form
    setMode('os');
    setSelectedOsId("");
    setSearchQuery("");
    setFormData({
      osNumber: "",
      osDescription: "",
      name: "",
      quantity: "1",
      unit: "",
      status: "to-order",
      urgent: false,
      price: "",
      orderDate: "",
      expectedDate: ""
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Peça</DialogTitle>
          <DialogDescription>
            Adicione uma peça vinculada a uma O.S ou peça avulsa para estoque
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label>Tipo de Peça</Label>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'os' | 'avulsa')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="os" id="mode-os" />
                <label htmlFor="mode-os" className="text-sm cursor-pointer flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Vincular a uma O.S existente
                  {activeServiceOrders.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {activeServiceOrders.length} disponível{activeServiceOrders.length !== 1 ? 'is' : ''}
                    </span>
                  )}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avulsa" id="mode-avulsa" />
                <label htmlFor="mode-avulsa" className="text-sm cursor-pointer flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Peça Avulsa (sem vínculo com O.S)
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* O.S Selection (only shown when mode is 'os') */}
          {mode === 'os' && (
            <div className="space-y-2">
              <Label htmlFor="os-search">Buscar O.S *</Label>
              {activeServiceOrders.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Não há O.S ativas disponíveis no momento. Crie uma O.S primeiro ou adicione uma peça avulsa.
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="os-search"
                      placeholder="Buscar por número, cliente, aparelho..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  {/* Service Orders List */}
                  {searchQuery && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {filteredServiceOrders.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Nenhuma O.S encontrada
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredServiceOrders.map((so) => (
                        <button
                          key={so.id}
                          type="button"
                          onClick={() => {
                            setSelectedOsId(so.id);
                            setSearchQuery("");
                          }}
                          className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                            selectedOsId === so.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                O.S #{so.osNumber || so.id.slice(-4)} - {so.clientName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {so.device} {so.brand} {so.model}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {so.defect}
                              </p>
                            </div>
                            <div className="text-xs">
                              <span className={`px-2 py-1 rounded text-white ${
                                so.status === 'pending' ? 'bg-yellow-500' :
                                so.status === 'in-progress' ? 'bg-blue-500' :
                                so.status === 'waiting-parts' ? 'bg-orange-500' :
                                so.status === 'under-observation' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}>
                                {so.status === 'pending' ? 'Pendente' :
                                 so.status === 'in-progress' ? 'Em Andamento' :
                                 so.status === 'waiting-parts' ? 'Aguardando Peças' :
                                 so.status === 'under-observation' ? 'Em Observação' :
                                 'Outro'}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

                  {/* Selected O.S Display */}
                  {selectedOsId && !searchQuery && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {(() => {
                        const selectedOs = serviceOrders.find(so => so.id === selectedOsId);
                        if (!selectedOs) return null;
                        return (
                          <>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm text-blue-900">
                                  ✓ O.S Selecionada: #{selectedOs.osNumber || selectedOs.id.slice(-4)}
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                  Cliente: {selectedOs.clientName}
                                </p>
                                <p className="text-xs text-blue-700">
                                  Aparelho: {selectedOs.device} {selectedOs.brand} {selectedOs.model}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedOsId("")}
                                className="text-blue-700 hover:text-blue-900"
                              >
                                Alterar
                              </Button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* O.S Information (read-only when linked to O.S) */}
          {mode === 'os' && selectedOsId && (
            <div className="grid grid-cols-2 gap-4 opacity-60">
              <div className="space-y-2">
                <Label>Número da O.S</Label>
                <Input 
                  value={formData.osNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Aparelho</Label>
                <Input 
                  value={formData.osDescription}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Avulsa Info (shown when mode is avulsa) */}
          {mode === 'avulsa' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                📦 Esta peça será adicionada sem vínculo a uma O.S específica
              </p>
            </div>
          )}

          {/* Part Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="part-name">Tipo de Peça *</Label>
              <Select 
                value={formData.name}
                onValueChange={(value) => setFormData({...formData, name: value})}
                required
              >
                <SelectTrigger id="part-name">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PART_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="part-unit">Modelo / Número de Série</Label>
              <Input 
                id="part-unit" 
                placeholder="Ex: Samsung U8100F"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="part-quantity">Quantidade *</Label>
            <Input 
              id="part-quantity" 
              type="number" 
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="part-status">Status *</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => setFormData({...formData, status: value as Part["status"]})}
              required
            >
              <SelectTrigger id="part-status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="to-order">À Pedir</SelectItem>
                <SelectItem value="ordered">Pedido Realizado</SelectItem>
                <SelectItem value="arriving">À Chegar</SelectItem>
                <SelectItem value="received">Recebido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="urgent"
              checked={formData.urgent}
              onCheckedChange={(checked) => setFormData({...formData, urgent: checked as boolean})}
            />
            <label
              htmlFor="urgent"
              className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Marcar como URGENTE
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="part-price">Preço (opcional)</Label>
            <Input 
              id="part-price" 
              type="text" 
              placeholder="R$ 0,00"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          {formData.status !== "to-order" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-date">Data do Pedido</Label>
                <Input 
                  id="order-date" 
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-date">Data Prevista</Label>
                <Input 
                  id="expected-date" 
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" className="bg-[#8b7355] hover:bg-[#7a6345]">
              Adicionar Peça
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
