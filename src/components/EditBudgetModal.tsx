import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface BudgetItem {
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

interface Budget {
  id: string;
  osNumber: string;
  clientName: string;
  device: string;
  items: BudgetItem[];
  totalValue: string;
  date: string;
  expiryDate: string;
  status: "pending" | "approved" | "rejected" | "expired";
}

interface EditBudgetModalProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBudget: Budget) => void;
}

export function EditBudgetModal({ budget, isOpen, onClose, onSave }: EditBudgetModalProps) {
  const [items, setItems] = useState<BudgetItem[]>(budget?.items || []);

  // Atualiza os items quando o budget muda
  useEffect(() => {
    if (budget) {
      setItems(budget.items);
    }
  }, [budget]);

  if (!budget) return null;

  const parsePrice = (price: string): number => {
    return parseFloat(price.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
  };

  const formatPrice = (value: number): string => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalcula o total do item
    if (field === "quantity" || field === "unitPrice") {
      const quantity = typeof newItems[index].quantity === "number" 
        ? newItems[index].quantity 
        : parseInt(newItems[index].quantity as unknown as string) || 0;
      const unitPrice = parsePrice(newItems[index].unitPrice);
      newItems[index].total = formatPrice(quantity * unitPrice);
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unitPrice: "R$ 0,00",
        total: "R$ 0,00",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error("O orçamento deve ter pelo menos um item");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const total = items.reduce((sum, item) => sum + parsePrice(item.total), 0);
    return formatPrice(total);
  };

  const handleSave = () => {
    // Validação
    const hasEmptyDescription = items.some(item => !item.description.trim());
    if (hasEmptyDescription) {
      toast.error("Todos os itens devem ter uma descrição");
      return;
    }

    const updatedBudget: Budget = {
      ...budget,
      items,
      totalValue: calculateTotal(),
    };

    onSave(updatedBudget);
    toast.success("Orçamento atualizado com sucesso!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Orçamento</DialogTitle>
          <DialogDescription>
            O.S #{budget.osNumber} - {budget.clientName} ({budget.device})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Itens do Orçamento */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Itens do Orçamento</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 p-3 border rounded-lg bg-gray-50"
                >
                  {/* Descrição */}
                  <div className="col-span-5">
                    <Label className="text-xs">Descrição</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      placeholder="Ex: Placa T-CON"
                    />
                  </div>

                  {/* Quantidade */}
                  <div className="col-span-2">
                    <Label className="text-xs">Qtd</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", parseInt(e.target.value) || 1)
                      }
                    />
                  </div>

                  {/* Preço Unitário */}
                  <div className="col-span-2">
                    <Label className="text-xs">Valor Unit.</Label>
                    <Input
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      placeholder="R$ 0,00"
                    />
                  </div>

                  {/* Total */}
                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <Input value={item.total} disabled className="bg-gray-200" />
                  </div>

                  {/* Botão Remover */}
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Geral */}
          <div className="flex justify-end items-center p-4 bg-gray-100 rounded-lg">
            <div className="text-right">
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-3xl font-bold text-[#8b7355]">{calculateTotal()}</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#8b7355] hover:bg-[#7a6345]"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
