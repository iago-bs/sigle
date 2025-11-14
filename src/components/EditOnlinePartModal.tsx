import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState, useEffect } from "react";
import { Package, Calendar as CalendarIcon, Link as LinkIcon } from "lucide-react";
import { formatDateBR } from "../lib/date-utils";
import type { OnlinePart, ServiceOrder } from "../types";

interface EditOnlinePartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onlinePart: OnlinePart | null;
  serviceOrders: ServiceOrder[];
  onUpdate: (onlinePart: OnlinePart) => void;
}

export function EditOnlinePartModal({
  open,
  onOpenChange,
  onlinePart,
  serviceOrders,
  onUpdate
}: EditOnlinePartModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    trackingLink: "",
    linkedServiceOrderId: "",
    status: "ordered" as OnlinePart["status"],
    notes: ""
  });
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(undefined);
  const [receivedDate, setReceivedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (onlinePart) {
      setFormData({
        name: onlinePart.name,
        trackingLink: onlinePart.trackingLink || "",
        linkedServiceOrderId: onlinePart.linkedServiceOrderId || "",
        status: onlinePart.status,
        notes: onlinePart.notes || ""
      });
      setExpectedDate(onlinePart.expectedDeliveryDate ? new Date(onlinePart.expectedDeliveryDate) : undefined);
      setReceivedDate(onlinePart.receivedDate ? new Date(onlinePart.receivedDate) : undefined);
    }
  }, [onlinePart]);

  if (!onlinePart) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const updatedOnlinePart: OnlinePart = {
      ...onlinePart,
      name: formData.name.trim(),
      trackingLink: formData.trackingLink.trim() || undefined,
      expectedDeliveryDate: expectedDate?.toISOString(),
      linkedServiceOrderId: formData.linkedServiceOrderId || undefined,
      status: formData.status,
      receivedDate: receivedDate?.toISOString(),
      notes: formData.notes.trim() || undefined
    };

    onUpdate(updatedOnlinePart);
    onOpenChange(false);
  };

  // Filtrar apenas O.S que estão em andamento ou pendentes
  const availableServiceOrders = serviceOrders.filter(
    so => so.status === "in-progress" || so.status === "pending" || so.status === "waiting-parts"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8b7355]" />
            Editar Peça Online
          </DialogTitle>
          <DialogDescription>
            Atualize informações de rastreio e status da peça
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

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: OnlinePart["status"]) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordered">Pedido Feito</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
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
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data de Recebimento (se entregue) */}
          {formData.status === "delivered" && (
            <div className="space-y-2">
              <Label>Data de Recebimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {receivedDate ? formatDateBR(receivedDate.toISOString()) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={receivedDate}
                    onSelect={setReceivedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

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
