import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import type { ServiceOrder } from "../types";
import { X, Plus, Trash2, Package, Eye, MessageCircle, Archive } from "lucide-react";
import { Input } from "./ui/input";

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrder: ServiceOrder | null;
  onStatusChange: (orderId: string, newStatus: ServiceOrder["status"], waitingParts?: string[]) => void;
}

export function ChangeStatusModal({
  isOpen,
  onClose,
  serviceOrder,
  onStatusChange,
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<ServiceOrder["status"]>(serviceOrder?.status || "pending");
  const [notes, setNotes] = useState("");
  const [waitingParts, setWaitingParts] = useState<string[]>([""]);

  const handleClose = () => {
    setNewStatus(serviceOrder?.status || "pending");
    setNotes("");
    setWaitingParts([""]);
    onClose();
  };

  const handleSubmit = () => {
    if (!serviceOrder) return;

    // Se o status for "aguardando peças", enviar a lista de peças
    if (newStatus === "waiting-parts") {
      const filteredParts = waitingParts.filter(part => part.trim() !== "");
      if (filteredParts.length === 0) {
        alert("Por favor, informe pelo menos uma peça necessária.");
        return;
      }
      onStatusChange(serviceOrder.id, newStatus, filteredParts);
    } else {
      onStatusChange(serviceOrder.id, newStatus);
    }

    handleClose();
  };

  const addPartField = () => {
    setWaitingParts([...waitingParts, ""]);
  };

  const removePartField = (index: number) => {
    const newParts = waitingParts.filter((_, i) => i !== index);
    setWaitingParts(newParts.length > 0 ? newParts : [""]);
  };

  const updatePartField = (index: number, value: string) => {
    const newParts = [...waitingParts];
    newParts[index] = value;
    setWaitingParts(newParts);
  };

  if (!serviceOrder) return null;

  const getStatusColor = (status: ServiceOrder["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 border-yellow-300 text-yellow-900";
      case "in-progress":
        return "bg-blue-100 border-blue-300 text-blue-900";
      case "waiting-parts":
        return "bg-orange-100 border-orange-300 text-orange-900";
      case "under-observation":
        return "bg-purple-100 border-purple-300 text-purple-900";
      case "waiting-client-response":
        return "bg-indigo-100 border-indigo-300 text-indigo-900";
      case "abandoned":
        return "bg-gray-100 border-gray-400 text-gray-900";
      case "completed":
        return "bg-green-100 border-green-300 text-green-900";
      case "cancelled":
        return "bg-red-100 border-red-300 text-red-900";
      default:
        return "bg-gray-100 border-gray-300 text-gray-900";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Alterar Status da O.S</DialogTitle>
          <DialogDescription>
            O.S #{serviceOrder.osNumber} - {serviceOrder.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Atual */}
          <div className="space-y-2">
            <Label>Status Atual</Label>
            <div className={`p-3 rounded-lg border-2 ${getStatusColor(serviceOrder.status)}`}>
              <p className="font-semibold">{getStatusLabel(serviceOrder.status)}</p>
            </div>
          </div>

          {/* Novo Status */}
          <div className="space-y-2">
            <Label htmlFor="new-status">Novo Status *</Label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ServiceOrder["status"])}>
              <SelectTrigger id="new-status">
                <SelectValue placeholder="Selecione o novo status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">⏳ Pendente</SelectItem>
                <SelectItem value="in-progress">🔧 Em Andamento</SelectItem>
                <SelectItem value="waiting-parts">
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Aguardando Peças
                  </span>
                </SelectItem>
                <SelectItem value="under-observation">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Em Observação
                  </span>
                </SelectItem>
                <SelectItem value="waiting-client-response">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Aguardando Resposta do Cliente
                  </span>
                </SelectItem>
                <SelectItem value="abandoned">
                  <span className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    Abandonado
                  </span>
                </SelectItem>
                <SelectItem value="cancelled">❌ Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Informação sobre o status de Peça */}
          {newStatus === "waiting-parts" && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                <strong>📦 Redirecionamento:</strong> Após salvar, você será redirecionado para a página de Peças para gerenciar os itens necessários.
              </p>
            </div>
          )}

          {/* Se status for "aguardando peças", mostrar campos para informar as peças */}
          {newStatus === "waiting-parts" && (
            <div className="space-y-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-orange-900">Peças Necessárias *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addPartField}
                  className="h-7 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-orange-800">
                Informe quais peças são necessárias para concluir este serviço
              </p>
              
              <div className="space-y-2">
                {waitingParts.map((part, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={part}
                      onChange={(e) => updatePartField(index, e.target.value)}
                      placeholder={`Peça ${index + 1} (ex: BARRA LED 32", Placa T-CON, etc)`}
                      className="flex-1"
                    />
                    {waitingParts.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removePartField(index)}
                        className="h-10 px-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informação sobre status Abandonado */}
          {newStatus === "abandoned" && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>📁 Abandonado:</strong> Esta O.S será movida para a aba de "Abandonados" e pode ser recuperada posteriormente se necessário.
              </p>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a alteração de status..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-[#8b7355] hover:bg-[#7a6345]">
            Confirmar Alteração
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStatusLabel(status: ServiceOrder["status"]) {
  switch (status) {
    case "completed":
      return "✅ Concluído";
    case "pending":
      return "⏳ Pendente";
    case "in-progress":
      return "🔧 Em Andamento";
    case "waiting-parts":
      return "📦 Aguardando Peças";
    case "under-observation":
      return "👁️ Em Observação";
    case "waiting-client-response":
      return "💬 Aguardando Resposta do Cliente";
    case "abandoned":
      return "📁 Abandonado";
    case "cancelled":
      return "❌ Cancelado";
    default:
      return "";
  }
}
