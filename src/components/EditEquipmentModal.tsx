import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import type { Equipment } from "../types";
import { useState, useEffect } from "react";

interface EditEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onUpdateEquipment: (equipment: Equipment) => void;
}

export function EditEquipmentModal({ open, onOpenChange, equipment, onUpdateEquipment }: EditEquipmentModalProps) {
  const [formData, setFormData] = useState({
    device: "",
    brand: "",
    model: "",
    color: "",
    serialNumber: "",
    notes: "",
  });

  // Populate form when equipment changes
  useEffect(() => {
    if (equipment) {
      setFormData({
        device: equipment.device || "",
        brand: equipment.brand || "",
        model: equipment.model || "",
        color: equipment.color || "",
        serialNumber: equipment.serialNumber || "",
        notes: equipment.notes || "",
      });
    }
  }, [equipment?.id]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment) return;

    const updatedEquipment: Equipment = {
      ...equipment,
      device: formData.device,
      brand: formData.brand,
      model: formData.model,
      color: formData.color || undefined,
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
