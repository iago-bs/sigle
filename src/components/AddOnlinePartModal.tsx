import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import { Package, Calendar as CalendarIcon, Link as LinkIcon } from "lucide-react";
import { formatDateBR } from "../lib/date-utils";
import type { OnlinePart, ServiceOrder } from "../types";

interface AddOnlinePartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrders: ServiceOrder[];
  onAdd: (onlinePart: OnlinePart) => void;
}

export function AddOnlinePartModal({
  open,
  onOpenChange,
  serviceOrders,
  onAdd
}: AddOnlinePartModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    trackingLink: "",
    linkedServiceOrderId: "",
    notes: ""
  });
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const newOnlinePart: OnlinePart = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      trackingLink: formData.trackingLink.trim() || undefined,
      expectedDeliveryDate: expectedDate?.toISOString(),
      linkedServiceOrderId: formData.linkedServiceOrderId || undefined,
      status: "ordered",
      orderDate: new Date().toISOString(),
      notes: formData.notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onAdd(newOnlinePart);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      trackingLink: "",
      linkedServiceOrderId: "",
      notes: ""
    });
    setExpectedDate(undefined);
    onOpenChange(false);
  };

  // Filtrar apenas O.S que estão em andamento ou pendentes
  const availableServiceOrders = serviceOrders.filter(
    so => so.status === "in-progress" || so.status === "pending"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8b7355]" />
            Nova Peça Pedida Online
          </DialogTitle>
          <DialogDescription>
            Adicione peças pedidas online com rastreio e previsão de entrega
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Nome da Peça */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Peça *</Label>
            <Input
              id="name"
              placeholder="Ex: Placa Principal LG 50..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Link de Rastreio */}
          <div className="space-y-2">
            <Label htmlFor="tracking-link">Link de Rastreio</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="tracking-link"
                type="url"
                placeholder="https://rastreamento.com/..."
                value={formData.trackingLink}
                onChange={(e) => setFormData({ ...formData, trackingLink: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Data de Entrega Prevista */}
          <div className="space-y-2">
            <Label>Data de Entrega Prevista</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedDate ? formatDateBR(expectedDate.toISOString()) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expectedDate}
                  onSelect={setExpectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Vincular a uma O.S */}
          <div className="space-y-2">
            <Label htmlFor="linked-os">Vincular a uma O.S (opcional)</Label>
            <Select
              value={formData.linkedServiceOrderId}
              onValueChange={(value) => setFormData({ ...formData, linkedServiceOrderId: value })}
            >
              <SelectTrigger id="linked-os">
                <SelectValue placeholder="Selecione uma O.S..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma O.S</SelectItem>
                {availableServiceOrders.map(so => (
                  <SelectItem key={so.id} value={so.id}>
                    O.S #{so.osNumber || so.id.slice(-4)} - {so.clientName} ({so.device})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.linkedServiceOrderId && (
              <p className="text-xs text-blue-600">
                ℹ️ O status da O.S será alterado automaticamente para "Aguardando Peça"
              </p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-[#8b7355] hover:bg-[#7a6345]">
              Adicionar Peça
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
