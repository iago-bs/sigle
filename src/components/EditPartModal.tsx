import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useState, useEffect } from "react";
import type { Part } from "../types";
import { PART_TYPES } from "../lib/constants";

interface EditPartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part | null;
  onEditPart: (part: Part) => void;
}

export function EditPartModal({ open, onOpenChange, part, onEditPart }: EditPartModalProps) {
  const [formData, setFormData] = useState<Part>({
    id: "",
    name: "",
    osNumber: "",
    osDescription: "",
    quantity: 1,
    status: "to-order",
    urgent: false
  });

  // Update form data when part changes
  useEffect(() => {
    if (part) {
      setFormData(part);
    }
  }, [part]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEditPart(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Peça</DialogTitle>
          <DialogDescription>
            Atualize as informações da peça
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-part-os">Número da O.S *</Label>
              <Input 
                id="edit-part-os" 
                value={formData.osNumber}
                onChange={(e) => setFormData({...formData, osNumber: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-part-os-desc">Aparelho *</Label>
              <Input 
                id="edit-part-os-desc" 
                value={formData.osDescription}
                onChange={(e) => setFormData({...formData, osDescription: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-part-name">Tipo de Peça *</Label>
              {/* TODO: MIGRAÇÃO PARA BD - Carregar de: GET /api/part-types */}
              <Select 
                value={formData.name}
                onValueChange={(value: string) => setFormData({...formData, name: value})}
                required
              >
                <SelectTrigger id="edit-part-name">
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
              <Label htmlFor="edit-part-unit">Modelo / Número de Série</Label>
              <Input 
                id="edit-part-unit" 
                placeholder="Ex: Samsung U8100F"
                value={formData.unit || ""}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-part-quantity">Quantidade *</Label>
            <Input 
              id="edit-part-quantity" 
              type="number" 
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-part-status">Status *</Label>
            <Select 
              value={formData.status}
              onValueChange={(value: string) => setFormData({...formData, status: value as Part["status"]})}
              required
            >
              <SelectTrigger id="edit-part-status">
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
              id="edit-urgent"
              checked={formData.urgent}
              onCheckedChange={(checked: boolean) => setFormData({...formData, urgent: checked})}
            />
            <label
              htmlFor="edit-urgent"
              className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Marcar como URGENTE
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-part-price">Preço (opcional)</Label>
            <Input 
              id="edit-part-price" 
              type="text" 
              placeholder="R$ 0,00"
              value={formData.price || ""}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          {formData.status !== "to-order" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-order-date">Data do Pedido</Label>
                <Input 
                  id="edit-order-date" 
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.orderDate || ""}
                  onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expected-date">Data Prevista</Label>
                <Input 
                  id="edit-expected-date" 
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.expectedDate || ""}
                  onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" className="bg-[#8b7355] hover:bg-[#7a6345]">
              Salvar Alterações
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