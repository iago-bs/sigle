import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { Package } from "lucide-react";
import type { ServiceOrder } from "../types";

interface SelectPartForWaitingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrder: ServiceOrder | null;
  onConfirm: (partName: string) => void;
}

export function SelectPartForWaitingModal({
  open,
  onOpenChange,
  serviceOrder,
  onConfirm
}: SelectPartForWaitingModalProps) {
  const [partName, setPartName] = useState("");

  if (!serviceOrder) return null;

  const handleConfirm = () => {
    if (partName.trim()) {
      onConfirm(partName.trim());
      setPartName("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setPartName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Aguardando Peça
          </DialogTitle>
          <DialogDescription>
            O.S #{serviceOrder.osNumber || serviceOrder.id.slice(-4)} - {serviceOrder.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="part-name">Qual peça está aguardando? *</Label>
            <Input
              id="part-name"
              placeholder="Ex: Placa principal Samsung UN50..."
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Esta informação será adicionada às observações da O.S
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Após confirmar, você pode ir à página de <strong>Peças</strong> para adicionar esta peça na seção "Peças Pedidas Online" com link de rastreio e data de entrega.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={!partName.trim()} className="bg-[#8b7355] hover:bg-[#7a6345]">
            Confirmar
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
