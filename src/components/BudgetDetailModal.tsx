import { X, Calendar, User, Package, FileText, Printer, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

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

interface BudgetDetailModalProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (budgetId: string) => void;
  onReject?: (budgetId: string) => void;
  onPrint?: (budget: Budget) => void;
  onEdit?: (budget: Budget) => void;
}

export function BudgetDetailModal({
  budget,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onPrint,
  onEdit,
}: BudgetDetailModalProps) {
  if (!budget) return null;

  const getStatusBadge = (status: Budget["status"]) => {
    const variants = {
      pending: { label: "⏳ Pendente", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      approved: { label: "✅ Aprovado", className: "bg-green-100 text-green-800 border-green-300" },
      rejected: { label: "❌ Rejeitado", className: "bg-red-100 text-red-800 border-red-300" },
      expired: { label: "⌛ Expirado", className: "bg-gray-100 text-gray-800 border-gray-300" }
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>Detalhes do Orçamento</span>
            {getStatusBadge(budget.status)}
          </DialogTitle>
          <DialogDescription>
            Visualize todos os detalhes, itens e informações do orçamento #{budget.osNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Info Principal */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <FileText className="w-4 h-4" />
                <span>Número da O.S</span>
              </div>
              <p className="font-semibold">#{budget.osNumber}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span>Cliente</span>
              </div>
              <p className="font-semibold">{budget.clientName}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Package className="w-4 h-4" />
                <span>Aparelho</span>
              </div>
              <p className="font-semibold">{budget.device}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Data de Emissão</span>
              </div>
              <p className="font-semibold">{budget.date}</p>
            </div>
          </div>

          {/* Data de Validade */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-700" />
              <span className="text-sm text-yellow-700">
                Válido até: <strong>{budget.expiryDate}</strong>
              </span>
            </div>
          </div>

          {/* Itens do Orçamento */}
          <div>
            <h3 className="font-semibold mb-3">Itens do Orçamento</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">Descrição</th>
                    <th className="text-center p-3 text-sm font-semibold">Qtd</th>
                    <th className="text-right p-3 text-sm font-semibold">Valor Unit.</th>
                    <th className="text-right p-3 text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {budget.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{item.unitPrice}</td>
                      <td className="p-3 text-right font-semibold">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-semibold">
                      Valor Total:
                    </td>
                    <td className="p-3 text-right text-xl font-bold text-[#8b7355]">
                      {budget.totalValue}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            {budget.status === "pending" && onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(budget);
                  onClose();
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onPrint?.(budget);
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            
            {budget.status === "pending" && onApprove && onReject && (
              <>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    onApprove(budget.id);
                    onClose();
                  }}
                >
                  <span className="mr-2">✅</span>
                  Aprovar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    onReject(budget.id);
                    onClose();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              </>
            )}
            
            {budget.status !== "pending" && (
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
