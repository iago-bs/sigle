import { useRef } from "react";
import { Printer, Download, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { PRINT_STYLES } from "../lib/print-styles";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

interface Invoice {
  id: string;
  osNumber: string;
  clientName: string;
  clientPhone: string;
  device: string;
  items: InvoiceItem[];
  totalValue: string;
  issueDate: string;
  warrantyEndDate: string;
  technicianName: string;
}

interface InvoiceDocumentProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDocument({ invoice, isOpen, onClose }: InvoiceDocumentProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  if (!invoice) return null;

  const storeName = user?.storeName || "ELETRODEL ELETRÔNICA";
  const storeAddress = user?.storeAddress || "Endereço não cadastrado";
  const storePhone = user?.storePhone || "(00) 00000-0000";
  
  // Detectar se é uma venda de equipamento (não é um serviço de reparo)
  const isSale = invoice.osNumber?.startsWith("VE-");

  const handlePrint = async () => {
    // Imprimir apenas o conteúdo da nota fiscal
    const target = document.getElementById('invoice-print-content') || printRef.current || undefined;
    if (typeof window !== 'undefined' && window.electronAPI?.print && target) {
      const html = PRINT_STYLES + (target as HTMLElement).outerHTML;
      const result = await window.electronAPI.print({ printBackground: true, silent: false, html });
      if (result.ok) {
        toast.success("Abrindo diálogo de impressão...");
      } else {
        toast.error("Erro ao imprimir: " + (result.error || "Desconhecido"));
      }
    } else if (!target) {
      toast.error('Conteúdo da Nota Fiscal não encontrado para impressão.');
    } else {
      window.print();
      toast.success("Imprimindo nota fiscal...");
    }
  };

  const handleDownloadPDF = async () => {
    // Gerar PDF apenas com o conteúdo da nota fiscal
    const target = document.getElementById('invoice-print-content') || printRef.current || undefined;
    if (typeof window !== 'undefined' && window.electronAPI?.printToPdf && target) {
      const clientName = invoice.clientName?.replace(/[^\w\s]/g, '') || 'Cliente';
      const fileName = `${clientName} - O.S ${invoice.osNumber} - NOTA FISCAL.pdf`;
      
      const html = PRINT_STYLES + (target as HTMLElement).outerHTML;
      
      const result = await window.electronAPI.printToPdf({ suggestedFileName: fileName, html });
      if (result.ok && !result.canceled) {
        toast.success("PDF salvo com sucesso!", {
          description: `Arquivo salvo em: ${result.filePath}`,
        });
      } else if (result.canceled) {
        toast.info("Download cancelado.");
      } else {
        toast.error("Erro ao gerar PDF: " + (result.error || "Desconhecido"));
      }
    } else if (!target) {
      toast.error('Conteúdo da Nota Fiscal não encontrado para salvar em PDF.');
    } else {
      // Fallback para browsers
      toast.error("Geração de PDF não disponível neste modo.");
    }
  };

  const handleSendWhatsApp = () => {
    const phone = invoice.clientPhone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${invoice.clientName}! Sua Nota Fiscal da O.S #${invoice.osNumber} está pronta. Total: ${invoice.totalValue}. Garantia válida até ${invoice.warrantyEndDate}.`
    );
    const whatsappUrl = `https://wa.me/55${phone}?text=${message}`;
    
    // Usar API do Electron se disponível
    if (typeof window !== 'undefined' && window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(whatsappUrl);
    } else {
      window.open(whatsappUrl, "_blank");
    }
    
    toast.success("Abrindo WhatsApp...", {
      description: "Enviando nota fiscal para o cliente",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isSale ? "Nota Fiscal de Venda" : "Nota Fiscal de Serviço"}
          </DialogTitle>
          <DialogDescription>
            {isSale ? `Venda #${invoice.osNumber}` : `O.S #${invoice.osNumber}`} - Garantia de 3 meses
          </DialogDescription>
        </DialogHeader>

        {/* Botões de Ação */}
        <div className="flex gap-2 mb-4 no-print">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
          <Button
            onClick={handleSendWhatsApp}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar WhatsApp
          </Button>
        </div>

        {/* Documento da Nota Fiscal */}
        <div
          ref={printRef}
          id="invoice-print-content"
          className="bg-white p-8 border-2 border-black rounded-lg print:border-0 print-invoice"
          style={{ fontFamily: "monospace", fontSize: "14px" }}
        >
          {/* Cabeçalho */}
          <div className="text-center border-b-2 border-black pb-4 mb-6 print:pb-2 print:mb-3">
            <h1 className="text-3xl font-bold print:text-lg">{storeName.toUpperCase()}</h1>
            <p className="text-sm mt-1 print:text-xs print:mt-0.5">{storeAddress}</p>
            <p className="text-sm print:text-xs">Tel/WhatsApp: {storePhone}</p>
            <p className="text-lg mt-3 font-bold print:text-sm print:mt-1">
              {isSale ? "NOTA FISCAL DE VENDA" : "NOTA FISCAL DE SERVIÇO"}
            </p>
          </div>

          {/* Informações da O.S/Venda */}
          <div className="grid grid-cols-2 gap-4 mb-6 border-2 border-black p-4 print:gap-2 print:mb-3 print:p-2">
            <div>
              <p className="font-bold print:text-xs">
                {isSale ? "NOTA FISCAL Nº:" : "ORDEM DE SERVIÇO Nº:"}
              </p>
              <p className="text-xl print:text-sm">{invoice.osNumber}</p>
            </div>
            <div>
              <p className="font-bold print:text-xs">DATA DE EMISSÃO:</p>
              <p className="text-xl print:text-sm">{invoice.issueDate}</p>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="border-2 border-black p-4 mb-6 print:p-2 print:mb-3">
            <h2 className="font-bold text-lg mb-3 print:text-sm print:mb-1">DADOS DO CLIENTE</h2>
            <div className="space-y-2 print:space-y-0 print:text-xs">
              <p>
                <span className="font-bold">Nome:</span> {invoice.clientName}
              </p>
              <p>
                <span className="font-bold">Telefone:</span> {invoice.clientPhone}
              </p>
              <p>
                <span className="font-bold">{isSale ? "Produto Adquirido:" : "Equipamento:"}</span> {invoice.device}
              </p>
            </div>
          </div>

          {/* Serviços e Peças / Produtos */}
          <div className="border-2 border-black mb-6 print:mb-3">
            <h2 className="font-bold text-lg p-4 bg-gray-100 border-b-2 border-black print:text-sm print:p-2">
              {isSale ? "DISCRIMINAÇÃO DOS PRODUTOS" : "DISCRIMINAÇÃO DOS SERVIÇOS E PEÇAS"}
            </h2>
            <table className="w-full print:text-xs">
              <thead className="border-b-2 border-black">
                <tr>
                  <th className="text-left p-3 border-r-2 border-black print:p-1">DESCRIÇÃO</th>
                  <th className="text-center p-3 border-r-2 border-black w-20 print:p-1 print:w-12">QTD</th>
                  <th className="text-right p-3 border-r-2 border-black w-32 print:p-1 print:w-20">
                    VALOR UNIT.
                  </th>
                  <th className="text-right p-3 w-32 print:p-1 print:w-20">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-black">
                    <td className="p-3 border-r-2 border-black">{item.description}</td>
                    <td className="p-3 text-center border-r-2 border-black print:p-1">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right border-r-2 border-black print:p-1">
                      {item.unitPrice}
                    </td>
                    <td className="p-3 text-right print:p-1">{item.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-black">
                <tr>
                  <td colSpan={3} className="p-3 text-right font-bold text-lg print:p-1 print:text-sm">
                    VALOR TOTAL:
                  </td>
                  <td className="p-3 text-right font-bold text-xl print:p-1 print:text-base">
                    {invoice.totalValue}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Garantia */}
          <div className="border-2 border-black p-4 mb-6 bg-yellow-50 print:p-2 print:mb-3">
            <h2 className="font-bold text-lg mb-3 text-center print:text-sm print:mb-1">
              ⚠️ {isSale ? "GARANTIA DO PRODUTO" : "GARANTIA DO SERVIÇO"}
            </h2>
            <div className="space-y-2 print:space-y-0">
              <p className="text-center font-bold text-xl print:text-sm">
                GARANTIA DE 3 (TRÊS) MESES
              </p>
              <p className="text-center print:text-xs">
                <span className="font-bold">Válida até:</span> {invoice.warrantyEndDate}
              </p>
            </div>
          </div>

          {/* Termos e Condições */}
          <div className="border-2 border-black p-4 mb-6 text-sm print:p-2 print:mb-3 print:text-[9px]">
            <h2 className="font-bold mb-2 print:mb-1 print:text-[10px]">TERMOS E CONDIÇÕES DE GARANTIA:</h2>
            {isSale ? (
              // Termos para VENDA de produto
              <ul className="list-disc list-inside space-y-1 text-xs print:space-y-0 print:text-[8px]">
                <li>
                  A garantia cobre defeitos de fabricação e funcionamento do produto adquirido.
                </li>
                <li>
                  A garantia não cobre danos causados por mau uso, queda, umidade, oxidação,
                  sobretensão elétrica ou qualquer tipo de violação do equipamento.
                </li>
                <li>
                  Para validar a garantia, o cliente deve apresentar esta nota fiscal original.
                </li>
                <li>
                  Produtos que apresentarem defeitos cobertos pela garantia serão reparados ou
                  substituídos sem custo adicional.
                </li>
                <li>
                  A garantia não cobre transporte ou deslocamento do produto até a assistência
                  técnica.
                </li>
                <li>
                  Reparos realizados durante o período de garantia não estendem o prazo da mesma.
                </li>
                <li>
                  O produto deve ser utilizado conforme as instruções do fabricante.
                </li>
              </ul>
            ) : (
              // Termos para SERVIÇO de reparo
              <ul className="list-disc list-inside space-y-1 text-xs print:space-y-0 print:text-[8px]">
                <li>
                  A garantia cobre apenas defeitos relacionados ao serviço executado e às peças
                  substituídas mencionadas nesta nota fiscal.
                </li>
                <li>
                  A garantia não cobre danos causados por mau uso, queda, umidade, oxidação ou
                  qualquer tipo de violação do equipamento.
                </li>
                <li>
                  Para validar a garantia, o cliente deve apresentar esta nota fiscal original.
                </li>
                <li>
                  Equipamentos que apresentarem defeitos cobertos pela garantia serão reparados
                  sem custo adicional de mão de obra.
                </li>
                <li>
                  A garantia não cobre transporte ou deslocamento do equipamento até a assistência
                  técnica.
                </li>
                <li>
                  Serviços realizados durante o período de garantia não estendem o prazo da mesma.
                </li>
              </ul>
            )}
          </div>

          {/* Assinaturas */}
          <div className="grid grid-cols-2 gap-8 mt-8 print:gap-4 print:mt-4">
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mb-2 print:pt-1 print:mb-1">
                <p className="font-bold print:text-xs">TÉCNICO RESPONSÁVEL</p>
                <p className="text-sm print:text-[10px]">{invoice.technicianName}</p>
              </div>
              <p className="text-xs print:text-[8px]">Assinatura do Técnico</p>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mb-2 print:pt-1 print:mb-1">
                <p className="font-bold print:text-xs">CLIENTE</p>
                <p className="text-sm print:text-[10px]">{invoice.clientName}</p>
              </div>
              <p className="text-xs print:text-[8px]">Assinatura do Cliente</p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center mt-8 pt-4 border-t-2 border-black text-xs print:mt-3 print:pt-2 print:text-[9px]">
            <p className="font-bold print:text-[10px]">ELETRODEL ELETRÔNICA - Sistema SIGLE Systems</p>
            <p>Este documento comprova a prestação de serviço e a garantia concedida.</p>
            <p className="mt-2 print:mt-1">
              <span className="font-bold">Importante:</span> Guarde esta nota fiscal para
              utilização da garantia.
            </p>
          </div>
        </div>

        {/* Estilos de impressão dedicados */}
        <style>{`
          @media print {
            /* Ocultar modal e mostrar apenas conteúdo */
            [role="dialog"] {
              position: static !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }

            [role="dialog"] > div:first-child {
              display: none !important;
            }

            .no-print {
              display: none !important;
            }

            /* Garantir visibilidade do documento */
            .print-invoice {
              display: block !important;
              visibility: visible !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 20mm !important;
            }

            /* Forçar cores */
            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }

            /* Bordas */
            .border-black,
            .border-2 {
              border-color: #000 !important;
              border-style: solid !important;
            }

            /* Backgrounds */
            .bg-gray-100 {
              background-color: #f3f4f6 !important;
            }

            .bg-yellow-50 {
              background-color: #fffbeb !important;
            }

            /* Tabelas */
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }

            table td,
            table th {
              border: 1px solid #000 !important;
              padding: 8px !important;
            }

            /* Fonte monospace */
            body {
              font-family: 'Courier New', monospace !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
