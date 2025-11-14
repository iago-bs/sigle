import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Printer, Download, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PRINT_STYLES } from "../lib/print-styles";

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
  clientPhone: string;
  device: string;
  items: BudgetItem[];
  totalValue: string;
  date: string;
  expiryDate: string;
  status: "pending" | "approved" | "rejected" | "expired";
}

interface BudgetPrintDocumentProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetPrintDocument({ budget, isOpen, onClose }: BudgetPrintDocumentProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && budget) {
      document.body.classList.add("print-mode");
    } else {
      document.body.classList.remove("print-mode");
    }

    return () => {
      document.body.classList.remove("print-mode");
    };
  }, [isOpen, budget]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const target = document.getElementById('budget-print-content');
    if (typeof window !== 'undefined' && window.electronAPI?.printToPdf && target && budget) {
      const clientName = budget.clientName?.replace(/[^\w\s]/g, '') || 'Cliente';
      const fileName = `${clientName} - ORCAMENTO.pdf`;
      const html = PRINT_STYLES + (target as HTMLElement).outerHTML;
      const result = await window.electronAPI.printToPdf({ suggestedFileName: fileName, html });
      if (result.ok && !result.canceled) {
        // noop UI; could show toast if desired
      }
    } else {
      window.print();
    }
  };

  const handleSendWhatsApp = () => {
    if (!budget) return;
    
    const message = `Olá ${budget.clientName}! Segue o orçamento da O.S #${budget.osNumber}:\n\nAparelho: ${budget.device}\nValor Total: ${budget.totalValue}\nValidade: ${budget.expiryDate}\n\nQualquer dúvida, estamos à disposição!`;
    const phoneNumber = budget.clientPhone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!budget) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0" aria-describedby={undefined}>
        {/* Action Buttons - Hidden on print */}
        <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center justify-between print:hidden">
          <h2 className="text-lg font-semibold">Orçamento - O.S #{budget.osNumber}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSendWhatsApp}>
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-[#8b7355] hover:bg-[#7a6345]">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 bg-white print-budget" id="budget-print-content">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-[#8b7355] pb-6">
            <h1 className="text-3xl font-bold text-[#8b7355] mb-2">
              {user?.storeName || "SIGLE Systems"}
            </h1>
            <p className="text-sm text-gray-600">{user?.storeAddress || ""}</p>
            <p className="text-sm text-gray-600">{user?.storePhone || ""}</p>
            <div className="mt-4">
              <h2 className="text-xl font-semibold">ORÇAMENTO DE SERVIÇO</h2>
              <p className="text-sm text-gray-600">Ordem de Serviço #{budget.osNumber}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">DADOS DO CLIENTE</h3>
              <div className="space-y-1">
                <p><strong>Nome:</strong> {budget.clientName}</p>
                <p><strong>Telefone:</strong> {budget.clientPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">DADOS DO ORÇAMENTO</h3>
              <div className="space-y-1">
                <p><strong>Data de Emissão:</strong> {budget.date}</p>
                <p><strong>Válido até:</strong> {budget.expiryDate}</p>
                <p><strong>Aparelho:</strong> {budget.device}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-600 mb-3">ITENS DO ORÇAMENTO</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Descrição</th>
                  <th className="border border-gray-300 p-2 text-center w-20">Qtd</th>
                  <th className="border border-gray-300 p-2 text-right w-32">Valor Unit.</th>
                  <th className="border border-gray-300 p-2 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {budget.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{item.description}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-right">{item.unitPrice}</td>
                    <td className="border border-gray-300 p-2 text-right font-semibold">{item.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan={3} className="border border-gray-300 p-2 text-right font-bold">
                    VALOR TOTAL:
                  </td>
                  <td className="border border-gray-300 p-2 text-right text-lg font-bold text-[#8b7355]">
                    {budget.totalValue}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6 text-sm border-t pt-4">
            <h3 className="font-semibold mb-2">CONDIÇÕES GERAIS:</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
              <li>Este orçamento é válido até {budget.expiryDate}</li>
              <li>Os valores podem sofrer alterações caso novas peças ou serviços sejam necessários</li>
              <li>Após aprovação, o serviço será iniciado conforme disponibilidade de peças</li>
              <li>O pagamento deve ser efetuado na retirada do equipamento</li>
              <li>Garantia de 3 meses para os serviços realizados</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 mt-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-12">
                  <p className="text-sm">Assinatura do Cliente</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-12">
                  <p className="text-sm">Assinatura do Técnico</p>
                </div>
              </div>
            </div>
          </div>

          {/* Print Info */}
          <div className="text-center text-xs text-gray-500 mt-6">
            <p>Documento emitido em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}</p>
          </div>
        </div>
      </DialogContent>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Configuração da página */
          @page {
            size: A4;
            margin: 10mm;
          }
          
          /* Ocultar tudo exceto o conteúdo de impressão */
          body * {
            visibility: hidden;
          }
          
          /* Mostrar apenas o conteúdo do orçamento */
          body.print-mode #budget-print-content,
          body.print-mode #budget-print-content * {
            visibility: visible !important;
          }
          
          body.print-mode #budget-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          
          /* Forçar cores e backgrounds */
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          /* Garantir bordas */
          .border-2,
          .border-b-2,
          .border-\\[\\#8b7355\\] {
            border-color: #8b7355 !important;
            border-style: solid !important;
          }
          
          /* Backgrounds */
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .bg-\\[\\#8b7355\\] {
            background-color: #8b7355 !important;
          }
          
          /* Garantir visibilidade de tabelas */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          table td,
          table th {
            border: 1px solid #ccc !important;
            padding: 8px !important;
          }
          
          /* Ocultar elementos específicos */
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </Dialog>
  );
}
