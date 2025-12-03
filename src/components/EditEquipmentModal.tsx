import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import type { Equipment } from "../types";
import { useState, useEffect } from "react";
import { useSystemVariables } from "../hooks/useSystemVariables";
import { toast } from "sonner";

interface EditEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onUpdateEquipment: (equipment: Equipment) => void;
}

export function EditEquipmentModal({ open, onOpenChange, equipment, onUpdateEquipment }: EditEquipmentModalProps) {
  const { addVariable, refresh, variables } = useSystemVariables();
  
  // Recarregar variáveis quando o modal abrir
  useEffect(() => {
    if (open) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  
  // Calcular as listas dinamicamente baseado nas variáveis
  const deviceTypes = variables
    .filter(v => v.category === 'device_types')
    .map(v => v.value)
    .sort();
  
  const brands = variables
    .filter(v => v.category === 'brands')
    .map(v => v.value)
    .sort();
  
  const productColors = variables
    .filter(v => v.category === 'product_colors')
    .map(v => v.value)
    .sort();
  
  const [formData, setFormData] = useState({
    device: "",
    customDevice: "",
    brand: "",
    customBrand: "",
    model: "",
    color: "",
    customColor: "",
    serialNumber: "",
    notes: "",
  });

  // States for custom inputs
  const [showCustomDevice, setShowCustomDevice] = useState(false);
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);

  // Populate form when equipment changes
  useEffect(() => {
    if (equipment) {
      const isCustomDevice = equipment.device && !deviceTypes.includes(equipment.device);
      const isCustomBrand = equipment.brand && !brands.includes(equipment.brand);
      const isCustomColor = equipment.color && !productColors.includes(equipment.color);

      setFormData({
        device: isCustomDevice ? "Outro" : equipment.device || "",
        customDevice: isCustomDevice ? equipment.device || "" : "",
        brand: isCustomBrand ? "Outro" : equipment.brand || "",
        customBrand: isCustomBrand ? equipment.brand || "" : "",
        model: equipment.model || "",
        color: isCustomColor ? "Outro" : (equipment.color || ""),
        customColor: isCustomColor ? (equipment.color || "") : "",
        serialNumber: equipment.serialNumber || "",
        notes: equipment.notes || "",
      });

      setShowCustomDevice(isCustomDevice);
      setShowCustomBrand(isCustomBrand);
      setShowCustomColor(isCustomColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment?.id]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment) return;
    
    // Get final values (use custom if "Outro" is selected)
    const finalDevice = formData.device === "Outro" ? formData.customDevice : formData.device;
    const finalBrand = formData.brand === "Outro" ? formData.customBrand : formData.brand;
    const finalColor = formData.color === "Outro" ? formData.customColor : formData.color;

    // Save custom values to system variables
    if (formData.device === "Outro" && formData.customDevice.trim()) {
      const added = addVariable('device_types', formData.customDevice);
      if (added) {
        toast.success(`Tipo "${formData.customDevice}" adicionado à lista!`);
      }
    }
    
    if (formData.brand === "Outro" && formData.customBrand.trim()) {
      const added = addVariable('brands', formData.customBrand);
      if (added) {
        toast.success(`Marca "${formData.customBrand}" adicionada à lista!`);
      }
    }
    
    if (formData.color === "Outro" && formData.customColor.trim()) {
      const added = addVariable('product_colors', formData.customColor);
      if (added) {
        toast.success(`Cor "${formData.customColor}" adicionada à lista!`);
      }
    }

    const updatedEquipment: Equipment = {
      ...equipment,
      device: finalDevice,
      brand: finalBrand,
      model: formData.model,
      color: finalColor || undefined,
      serialNumber: formData.serialNumber || undefined,
      notes: formData.notes || undefined,
    };

    onUpdateEquipment(updatedEquipment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Equipamento</DialogTitle>
          <DialogDescription>
            Atualize as informações do equipamento
          </DialogDescription>
        </DialogHeader>
        <form id="edit-equipment-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device">Tipo de Aparelho *</Label>
              <Select 
                value={formData.device}
                onValueChange={handleDeviceChange}
                required
              >
                <SelectTrigger id="device">
                  <SelectValue placeholder="Selecione o aparelho" />
                </SelectTrigger>
                <SelectContent>
                  {[...deviceTypes.filter(d => d !== "Outro"), "Outro"].map((device) => (
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
                  required
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Select 
                value={formData.brand}
                onValueChange={handleBrandChange}
                required
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  {[...brands.filter(b => b !== "Outro"), "Outro"].map((brand) => (
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
                  required
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input 
                id="model" 
                placeholder="Ex: UN55TU8000"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor do Produto</Label>
              <Select 
                value={formData.color}
                onValueChange={handleColorChange}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  {[...productColors.filter(c => c !== "Outro"), "Outro"].map((color) => (
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
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Número de Série</Label>
            <Input 
              id="serialNumber" 
              placeholder="Ex: SN123456789"
              value={formData.serialNumber}
              onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              placeholder="Informações adicionais sobre o equipamento..." 
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </form>

        <DialogFooter>
          <Button 
            type="submit" 
            form="edit-equipment-form" 
            className="bg-[#8b7355] hover:bg-[#7a6345]"
            disabled={!formData.device || !formData.brand || !formData.model}
          >
            Salvar Alterações
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
