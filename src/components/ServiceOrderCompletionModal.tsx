import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { CreditCard, Banknote, Smartphone, Building2, CheckCircle2, Printer, AlertCircle, Plus, Trash2, Package } from "lucide-react";
import type { ServiceOrder, StockPart } from "../types";
import { useState } from "react";
import { calculateWarrantyEndDate, formatDateBR } from "../lib/date-utils";
import { Textarea } from "./ui/textarea";

interface ServiceOrderCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrder: ServiceOrder | null;
  stockParts: StockPart[];
  onComplete: (serviceOrder: ServiceOrder, usedParts: Array<{partId?: string; partName: string; quantity: number}>) => void;
  onPrintAndComplete: (serviceOrder: ServiceOrder, usedParts: Array<{partId?: string; partName: string; quantity: number}>) => void;
}

export function ServiceOrderCompletionModal({ 
  open, 
  onOpenChange, 
  serviceOrder,
  stockParts,
  onComplete,
  onPrintAndComplete
}: ServiceOrderCompletionModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "pix" | "transfer">("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState(3);
  const [usedParts, setUsedParts] = useState<Array<{partId?: string; partName: string; quantity: number}>>([]);
  const [serviceDescription, setServiceDescription] = useState("");

  if (!serviceOrder) return null;

  const handleComplete = (shouldPrint: boolean) => {
    const completionDate = new Date().toISOString();
    const warrantyStartDate = completionDate;
    const warrantyEndDate = calculateWarrantyEndDate(warrantyStartDate, warrantyMonths);

    // Construir observações com serviço realizado e peças usadas
    let finalObservations = serviceOrder.observations || "";
    if (serviceDescription) {
      finalObservations = serviceDescription;
    }
    if (usedParts.length > 0) {
      const partsText = usedParts.map(p => `${p.partName} (${p.quantity}x)`).join(", ");
      finalObservations += (finalObservations ? "\n" : "") + `Peças utilizadas: ${partsText}`;
    }

    const completedServiceOrder: ServiceOrder = {
      ...serviceOrder,
      status: "completed",
      paymentMethod,
      paymentAmount,
      completionDate,
      deliveryDate: completionDate,
      warrantyStartDate,
      warrantyEndDate,
      warrantyMonths,
      observations: finalObservations,
      updatedAt: completionDate
    };

    if (shouldPrint) {
      onPrintAndComplete(completedServiceOrder, usedParts);
    } else {
      onComplete(completedServiceOrder, usedParts);
    }

    // Reset form
    setPaymentAmount("");
    setPaymentMethod("cash");
    setWarrantyMonths(3);
    setUsedParts([]);
    setServiceDescription("");
  };

  const addUsedPart = () => {
    setUsedParts([...usedParts, { partName: "", quantity: 1 }]);
  };

  const removeUsedPart = (index: number) => {
    setUsedParts(usedParts.filter((_, i) => i !== index));
  };

  const updateUsedPart = (index: number, field: "partName" | "partId" | "quantity", value: string | number) => {
    const newParts = [...usedParts];
    if (field === "partName") {
      // Se selecionou uma peça do estoque, pegar o ID
      const stockPart = stockParts.find(sp => sp.name === value);
      newParts[index] = {
        ...newParts[index],
        partName: value as string,
        partId: stockPart?.id
      };
    } else if (field === "quantity") {
      newParts[index] = {
        ...newParts[index],
        quantity: value as number
      };
    }
    setUsedParts(newParts);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash": return <Banknote className="w-5 h-5" />;
      case "card": return <CreditCard className="w-5 h-5" />;
      case "pix": return <Smartphone className="w-5 h-5" />;
      case "transfer": return <Building2 className="w-5 h-5" />;
      default: return <Banknote className="w-5 h-5" />;
    }
  };

  const warrantyEndDate = calculateWarrantyEndDate(new Date(), warrantyMonths);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Finalizar Ordem de Serviço
          </DialogTitle>
          <DialogDescription>
            O.S #{serviceOrder.osNumber || serviceOrder.id.slice(-4)} - {serviceOrder.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Equipment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Equipamento</p>
            <p className="font-medium">
              {serviceOrder.device} {serviceOrder.brand} {serviceOrder.model}
            </p>
            <p className="text-sm text-gray-600 mt-2">{serviceOrder.defect}</p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <div className="col-start-1 col-span-2 flex items-center justify-center gap-2 text-center">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-blue-800">
                Ao finalizar, esta O.S será marcada como <strong>concluída</strong> e entrará 
                automaticamente em <strong>garantia de {warrantyMonths} meses</strong>.
              </span>
            </div>
          </Alert>

          {/* Service Description */}
          <div>
            <Label htmlFor="service-description" className="text-base">
              Serviço Realizado
            </Label>
            <Textarea
              id="service-description"
              placeholder="Descreva o serviço realizado..."
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className="mt-2"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Opcional - será incluído nas observações</p>
          </div>

          {/* Used Parts Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Peças Utilizadas</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addUsedPart}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Peça
              </Button>
            </div>

            {usedParts.length > 0 ? (
              <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                {usedParts.map((part, index) => (
                  <div key={index} className="flex gap-2 items-start bg-white p-2 rounded border">
                    <div className="flex-1">
                      <Select
                        value={part.partName}
                        onValueChange={(value) => updateUsedPart(index, "partName", value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione a peça..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">📝 Digitar manualmente</SelectItem>
                          {stockParts.filter(sp => sp.quantity > 0).map((stockPart) => (
                            <SelectItem key={stockPart.id} value={stockPart.name}>
                              <div className="flex items-center gap-2">
                                <Package className="w-3 h-3" />
                                {stockPart.name} ({stockPart.quantity} em estoque)
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {part.partName === "custom" && (
                        <Input
                          placeholder="Digite o nome da peça..."
                          value=""
                          onChange={(e) => {
                            const newParts = [...usedParts];
                            newParts[index] = { ...newParts[index], partName: e.target.value, partId: undefined };
                            setUsedParts(newParts);
                          }}
                          className="mt-2 h-9"
                        />
                      )}
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={part.quantity}
                      onChange={(e) => updateUsedPart(index, "quantity", parseInt(e.target.value) || 1)}
                      className="w-20 h-9"
                      placeholder="Qtd"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUsedPart(index)}
                      className="h-9 px-2 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Nenhuma peça adicionada. Peças do estoque serão automaticamente deduzidas.
              </p>
            )}
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-method" className="text-base">
                Forma de Pagamento *
              </Label>
              <Select 
                value={paymentMethod}
                onValueChange={(value: "cash" | "card" | "pix" | "transfer") => setPaymentMethod(value)}
              >
                <SelectTrigger id="payment-method" className="mt-2">
                  <div className="flex items-center gap-2">
                    {getPaymentIcon(paymentMethod)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      <span>Dinheiro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Cartão</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pix">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span>PIX</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>Transferência</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-amount" className="text-base">
                Valor do Serviço
              </Label>
              <Input
                id="payment-amount"
                type="text"
                placeholder="R$ 0,00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional - será exibido na impressão</p>
            </div>

            <div>
              <Label htmlFor="warranty-months" className="text-base">
                Período de Garantia
              </Label>
              <Select 
                value={warrantyMonths.toString()}
                onValueChange={(value: string) => setWarrantyMonths(parseInt(value))}
              >
                <SelectTrigger id="warranty-months" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mês</SelectItem>
                  <SelectItem value="2">2 meses</SelectItem>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Garantia válida até: <strong>{formatDateBR(warrantyEndDate)}</strong>
              </p>
            </div>
          </div>

          {/* Warranty Preview */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Garantia Ativada</p>
                <p className="text-green-700 mt-1">
                  O cliente terá garantia de <strong>{warrantyMonths} {warrantyMonths === 1 ? 'mês' : 'meses'}</strong> para este serviço, 
                  válida até <strong>{formatDateBR(warrantyEndDate)}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button 
            onClick={() => handleComplete(false)}
            className="bg-[#8b7355] hover:bg-[#7a6345] flex-1 sm:flex-initial"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Finalizar
          </Button>
          <Button 
            onClick={() => handleComplete(true)}
            className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
          >
            <Printer className="w-4 h-4 mr-2" />
            Finalizar e Imprimir
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}