import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import type { Equipment } from "../types";
import { useState } from "react";
import { toast } from "sonner";

interface AddEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEquipment: (equipment: Equipment) => void;
}

export function AddEquipmentModal({ open, onOpenChange, onCreateEquipment }: AddEquipmentModalProps) {
  const [formData, setFormData] = useState({
    device: "",
    brand: "",
    model: "",
    color: "",
    serialNumber: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEquipment: Equipment = {
      id: Date.now().toString(),
      device: formData.device,
      brand: formData.brand,
      model: formData.model,
      color: formData.color || undefined,
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
      brand: "",
      model: "",
      color: "",
      serialNumber: "",
      notes: "",
    });
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
              <Input 
                id="device" 
                placeholder="Ex: Smart TV, Notebook, Celular"
                value={formData.device}
                onChange={(e) => setFormData({...formData, device: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input 
                id="brand" 
                placeholder="Ex: Samsung, LG, Apple"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                required 
              />
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
              <Input 
                id="color" 
                placeholder="Ex: Preto, Branco, Cinza"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              />
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
