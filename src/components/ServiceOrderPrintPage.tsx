import { ArrowLeft, Printer, Send, Mail, Phone, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import type { ServiceOrder } from "../types";
import { useState } from "react";
import { toast } from "sonner";
import { formatDateBR } from "../lib/date-utils";
import { useAuth } from "../hooks/useAuth";
import { PRINT_STYLES } from "../lib/print-styles";

interface ServiceOrderPrintPageProps {
  serviceOrder: ServiceOrder;
  onBack: () => void;
  onSaveToHistory: (status: ServiceOrder["status"]) => void;
}

export function ServiceOrderPrintPage({ serviceOrder, onBack, onSaveToHistory }: ServiceOrderPrintPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<ServiceOrder["status"]>(serviceOrder.status || "pending");
  const { user } = useAuth();

  const storeName = user?.storeName || "ESTABELECIMENTO";
  const storeAddress = user?.storeAddress || "Endereço não cadastrado";
  const storePhone = user?.storePhone || "(00) 00000-0000";
  const storeEmail = user?.email || "";

  const handlePrint = async () => {
    // Imprimir usando a janela principal (respeita CSS @media print)
    const target = document.getElementById('service-order-print-content');
    if (!target) {
      toast.error('Conteúdo da O.S não encontrado para impressão.');
      return;
    }
    
    if (typeof window !== 'undefined' && window.electronAPI?.print) {
      const result = await window.electronAPI.print({ printBackground: true, silent: false });
      if (result.ok) {
        toast.success("Abrindo diálogo de impressão...");
      } else {
        toast.error("Erro ao imprimir: " + (result.error || "Desconhecido"));
      }
    } else {
      window.print();
      toast.success("Preparando impressão...");
    }
  };

  const handleDownloadPDF = async () => {
    // Gerar PDF somente do conteúdo da O.S.
    const target = document.getElementById('service-order-print-content');
    if (!target) {
      toast.error('Conteúdo da O.S não encontrado para salvar em PDF.');
      return;
    }
    
    if (typeof window !== 'undefined' && window.electronAPI?.printToPdf) {
      const clientName = serviceOrder.clientName?.replace(/[^\w\s]/g, '') || 'Cliente';
      const osNumber = serviceOrder.osNumber;
      const fileName = `${clientName} - O.S ${osNumber}.pdf`;

      const html = PRINT_STYLES + (target as HTMLElement).outerHTML;
      const result = await window.electronAPI.printToPdf({ suggestedFileName: fileName, html });
      if (result.ok && !result.canceled) {
        toast.success("PDF salvo com sucesso!", {
          description: `Arquivo salvo em: ${result.filePath || fileName}`,
        });
      } else if (result.canceled) {
        toast.info("Download cancelado.");
      } else {
        toast.error("Erro ao gerar PDF: " + (result.error || "Desconhecido"));
      }
    } else {
      // Fallback para browsers
      toast.error("Geração de PDF não disponível neste modo.");
    }
  };

  const handleSaveAndContinue = () => {
    onSaveToHistory(selectedStatus);
  };

  const getPriorityLabel = (priority?: string) => {
    const labels = {
      normal: "Normal",
      urgent: "🔴 Urgente",
      low: "Baixa"
    };
    return labels[priority as keyof typeof labels] || "Normal";
  };

  const getPaymentMethodLabel = (method?: string) => {
    const labels = {
      cash: "Dinheiro",
      card: "Cartão",
      pix: "PIX",
      transfer: "Transferência"
    };
    return labels[method as keyof typeof labels] || method;
  };

  const isCompleted = serviceOrder.status === "completed";
  const hasWarranty = isCompleted && serviceOrder.warrantyEndDate;

  return (
    <div className="w-full h-screen bg-[#f5f0e8] overflow-auto print:bg-white print-root">
      {/* Header - Hidden on print */}
      <div className="print:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Salvar PDF
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div id="service-order-print-content" className="max-w-4xl mx-auto p-8 print:p-4 print:text-sm">
        {/* O.S Document */}
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-3">
          {/* Store Header */}
          <div className="border-b-2 border-[#8b7355] pb-3 mb-3 print:pb-2 print:mb-2">
            <div className="text-center">
              <h1 className="text-3xl text-[#8b7355] print:text-xl">{storeName}</h1>
              <p className="text-sm text-gray-600 mt-1 print:text-xs print:mt-0.5">{storeAddress}</p>
              <p className="text-sm text-gray-600 print:text-xs">Tel/WhatsApp: {storePhone}</p>
              {storeEmail && <p className="text-sm text-gray-600 print:text-xs">Email: {storeEmail}</p>}
            </div>
          </div>

          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-6 print:pb-2 print:mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl print:text-lg">ORDEM DE SERVIÇO</h1>
                <p className="text-lg mt-1 print:text-sm print:mt-0.5">O.S #{serviceOrder.osNumber || serviceOrder.id.slice(-4)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 print:text-xs">Data de Emissão:</p>
                <p className="print:text-sm">{formatDateBR(serviceOrder.createdAt)}</p>
                {serviceOrder.entryDate && (
                  <>
                    <p className="text-sm text-gray-600 mt-2 print:text-xs print:mt-1">Data de Entrada:</p>
                    <p className="print:text-sm">{formatDateBR(serviceOrder.entryDate)}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-6 print:mb-3">
            <h2 className="text-lg border-b pb-2 mb-3 print:text-sm print:pb-1 print:mb-2">DADOS DO CLIENTE</h2>
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Nome:</p>
                <p className="print:text-sm">{serviceOrder.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Telefone:</p>
                <p className="print:text-sm">—</p>
              </div>
            </div>
          </div>

          {/* Equipment Info */}
          <div className="mb-6 print:mb-3">
            <h2 className="text-lg border-b pb-2 mb-3 print:text-sm print:pb-1 print:mb-2">EQUIPAMENTO</h2>
            <div className="grid grid-cols-3 gap-4 mb-4 print:gap-2 print:mb-2">
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Aparelho:</p>
                <p className="print:text-sm">{serviceOrder.device}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Marca:</p>
                <p className="print:text-sm">{serviceOrder.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Modelo:</p>
                <p className="print:text-sm">{serviceOrder.model}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 print:gap-2">
              {serviceOrder.serialNumber && (
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Número de Série:</p>
                  <p className="print:text-sm">{serviceOrder.serialNumber}</p>
                </div>
              )}
              {serviceOrder.color && (
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Cor:</p>
                  <p className="print:text-sm">{serviceOrder.color}</p>
                </div>
              )}
            </div>
            {serviceOrder.accessories && (
              <div className="mt-4 print:mt-2">
                <p className="text-sm text-gray-600 print:text-xs">Acessórios que vieram com o produto:</p>
                <p className="mt-1 p-3 bg-gray-50 rounded print:p-2 print:text-sm">{serviceOrder.accessories}</p>
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="mb-6 print:mb-3">
            <h2 className="text-lg border-b pb-2 mb-3 print:text-sm print:pb-1 print:mb-2">INFORMAÇÕES DO SERVIÇO</h2>
            <div className="grid grid-cols-2 gap-4 mb-4 print:gap-2 print:mb-2">
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Técnico Responsável:</p>
                <p className="print:text-sm">{serviceOrder.technicianName}</p>
              </div>
              {serviceOrder.entryDate && (
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Data de Entrada:</p>
                  <p className="print:text-sm">{formatDateBR(serviceOrder.entryDate)}</p>
                </div>
              )}
              {serviceOrder.priority && serviceOrder.priority !== "normal" && (
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Prioridade:</p>
                  <p className="print:text-sm">{getPriorityLabel(serviceOrder.priority)}</p>
                </div>
              )}
            </div>
            
            <div className="mb-4 print:mb-2">
              <p className="text-sm text-gray-600 print:text-xs">Defeito Relatado:</p>
              <p className="mt-1 p-3 bg-gray-50 rounded print:p-2 print:text-sm">{serviceOrder.defect}</p>
            </div>

            {serviceOrder.observations && (
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Observações:</p>
                <p className="mt-1 p-3 bg-gray-50 rounded print:p-2 print:text-sm">{serviceOrder.observations}</p>
              </div>
            )}
          </div>

          {/* Payment Info - Only if completed */}
          {isCompleted && (
            <div className="mb-6">
              <h2 className="text-lg border-b pb-2 mb-3">PAGAMENTO E FINALIZAÇÃO</h2>
              <div className="grid grid-cols-2 gap-4">
                {serviceOrder.paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-600">Forma de Pagamento:</p>
                    <p>{getPaymentMethodLabel(serviceOrder.paymentMethod)}</p>
                  </div>
                )}
                {serviceOrder.paymentAmount && (
                  <div>
                    <p className="text-sm text-gray-600">Valor do Serviço:</p>
                    <p>{serviceOrder.paymentAmount}</p>
                  </div>
                )}
                {serviceOrder.completionDate && (
                  <div>
                    <p className="text-sm text-gray-600">Data de Conclusão:</p>
                    <p>{formatDateBR(serviceOrder.completionDate)}</p>
                  </div>
                )}
                {serviceOrder.deliveryDate && (
                  <div>
                    <p className="text-sm text-gray-600">Data de Entrega:</p>
                    <p>{formatDateBR(serviceOrder.deliveryDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warranty Info - Only if completed and has warranty */}
          {hasWarranty && (
            <div className="mb-6 p-6 bg-green-50 border-2 border-green-500 rounded-lg">
              <h2 className="text-lg border-b border-green-600 pb-2 mb-3 text-green-900">✓ GARANTIA</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-700">Período de Garantia:</p>
                  <p className="text-green-900">
                    {serviceOrder.warrantyMonths || 3} {(serviceOrder.warrantyMonths || 3) === 1 ? 'mês' : 'meses'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Válida até:</p>
                  <p className="text-green-900">{formatDateBR(serviceOrder.warrantyEndDate!)}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white border border-green-300 rounded">
                <p className="text-xs text-gray-700">
                  <strong>Condições da Garantia:</strong> Esta garantia cobre defeitos relacionados ao serviço 
                  realizado pelo período especificado. Não cobre danos causados por mau uso, queda, 
                  líquidos ou intervenção de terceiros.
                </p>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="mt-12 pt-6 border-t-2 border-gray-300">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <div className="border-t border-black pt-2 mt-16">
                  <p className="text-center text-sm">Assinatura do Cliente</p>
                  <p className="text-center text-xs text-gray-600">{serviceOrder.clientName}</p>
                </div>
              </div>
              <div>
                <div className="border-t border-black pt-2 mt-16">
                  <p className="text-center text-sm">Assinatura do Técnico</p>
                  <p className="text-center text-xs text-gray-600">{serviceOrder.technicianName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>Este documento comprova a prestação de serviço e, quando aplicável, a garantia especificada acima.</p>
            {hasWarranty && (
              <p className="mt-2">
                <strong>IMPORTANTE:</strong> Guarde este documento. Ele é necessário para utilização da garantia.
              </p>
            )}
          </div>
        </div>

        {/* Actions - Hidden on print */}
        <div className="print:hidden mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Salvar no Histórico</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="status">Status da O.S</Label>
              <Select value={selectedStatus} onValueChange={(value: ServiceOrder["status"]) => setSelectedStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="waiting-parts">Aguardando Peças</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSaveAndContinue}
              className="bg-[#8b7355] hover:bg-[#7a6345]"
            >
              <Send className="w-4 h-4 mr-2" />
              Salvar e Continuar
            </Button>
          </div>
        </div>
      </div>

      {/* Estilos de impressão dedicados */}
      <style>{`
        @media print {
          /* Ocultar tudo exceto o conteúdo de impressão */
          body > *:not(.print-root) {
            display: none !important;
          }
          
          /* Garantir que o conteúdo seja visível */
          .print-root,
          .print-root * {
            visibility: visible !important;
            display: block !important;
          }

          /* Forçar cores */
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          /* Garantir que bordas e backgrounds apareçam */
          .border-2,
          .border-b-2,
          .border-t-2 {
            border-width: 2px !important;
            border-color: #000 !important;
          }

          .bg-gray-50 {
            background-color: #f9fafb !important;
          }

          .bg-green-50 {
            background-color: #f0fdf4 !important;
          }

          .text-\\[\\#8b7355\\] {
            color: #8b7355 !important;
          }
        }
      `}</style>
    </div>
  );
}