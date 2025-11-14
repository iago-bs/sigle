import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { DEVICE_TYPES, BRANDS, PRODUCT_COLORS } from "../lib/constants";
import type { Equipment } from "../types";
import { useState } from "react";

interface AddEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEquipment: (equipment: Equipment) => void;
}

export function AddEquipmentModal({ open, onOpenChange, onCreateEquipment }: AddEquipmentModalProps) {
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
    
    // Get final values (use custom if "Outro" is selected)
    const finalDevice = formData.device === "Outro" ? formData.customDevice : formData.device;
    const finalBrand = formData.brand === "Outro" ? formData.customBrand : formData.brand;
    const finalColor = formData.color === "Outro" ? formData.customColor : formData.color;

    const newEquipment: Equipment = {
      id: Date.now().toString(),
      device: finalDevice,
      brand: finalBrand,
      model: formData.model,
      color: finalColor || undefined,
      serialNumber: formData.serialNumber || undefined,
      notes: formData.notes || undefined,
      lastServiceDate: new Date().toISOString(),
      totalServices: 0,
    };

    onCreateEquipment(newEquipment);
    
    // Reset form
    resetForm();
    
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
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
    setShowCustomDevice(false);
    setShowCustomBrand(false);
    setShowCustomColor(false);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Equipamento</DialogTitle>
          <DialogDescription>
            Cadastre um novo equipamento manualmente para rastreamento
          </DialogDescription>
        </DialogHeader>
        <form id="create-equipment-form" onSubmit={handleSubmit} className="space-y-4">
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
            form="create-equipment-form" 
            className="bg-[#8b7355] hover:bg-[#7a6345]"
            disabled={!formData.device || !formData.brand || !formData.model}
          >
            Adicionar Equipamento
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
