import { useRef } from "react";
import { Printer, X, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { PRINT_STYLES } from "../lib/print-styles";
import type { ServiceOrder, Client } from "../types";

interface ServiceOrderReceiptPrintProps {
  serviceOrder: ServiceOrder;
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceOrderReceiptPrint({ 
  serviceOrder, 
  client, 
  isOpen, 
  onClose 
}: ServiceOrderReceiptPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const storeName = user?.storeName || "ESTABELECIMENTO";
  const storeAddress = user?.storeAddress || "Endereço não cadastrado";
  const storePhone = user?.storePhone || "(00) 00000-0000";

  const handlePrint = async () => {
    // Imprimir somente o conteúdo do recibo
    const target = document.getElementById('receipt-print-content') || printRef.current || undefined;
    if (typeof window !== 'undefined' && window.electronAPI?.print && target) {
  const html = PRINT_STYLES + (target as HTMLElement).outerHTML;
      const result = await window.electronAPI.print({ printBackground: true, silent: false, html });
      if (result.ok) {
        toast.success("Abrindo diálogo de impressão...");
      } else {
        toast.error("Erro ao imprimir: " + (result.error || "Desconhecido"));
      }
    } else if (!target) {
      toast.error('Conteúdo do recibo não encontrado para impressão.');
    } else {
      window.print();
      toast.success("Preparando impressão...");
    }
  };

  const handleDownloadPDF = async () => {
    // Gerar PDF somente com o conteúdo do recibo
    const target = document.getElementById('receipt-print-content') || printRef.current || undefined;
    if (typeof window !== 'undefined' && window.electronAPI?.printToPdf && target) {
      const clientName = client.name?.replace(/[^\w\s]/g, '') || 'Cliente';
      const fileName = `${clientName} - RECIBO.pdf`;
  const html = PRINT_STYLES + (target as HTMLElement).outerHTML;
      
      const result = await window.electronAPI.printToPdf({ suggestedFileName: fileName, html });
      if (result.ok && !result.canceled) {
        toast.success("PDF salvo com sucesso!", {
          description: `Arquivo salvo como: ${fileName}`,
        });
      } else if (result.canceled) {
        toast.info("Download cancelado.");
      } else {
        toast.error("Erro ao gerar PDF: " + (result.error || "Desconhecido"));
      }
    } else if (!target) {
      toast.error('Conteúdo do recibo não encontrado para salvar em PDF.');
    } else {
      // Fallback para browsers
      toast.error("Geração de PDF não disponível neste modo.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString("pt-BR");
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Recibo de Entrada - O.S #{serviceOrder.osNumber}</DialogTitle>
        </DialogHeader>

        {/* Botões de Ação */}
        <div className="flex gap-2 mb-4 no-print">
          <Button onClick={handleDownloadPDF} className="flex-1 bg-[#8b7355] hover:bg-[#7a6345]">
            <Download className="w-4 h-4 mr-2" />
            Salvar PDF
          </Button>
          <Button onClick={handlePrint} className="flex-1 bg-[#8b7355] hover:bg-[#7a6345]">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Recibo
          </Button>
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </div>

        {/* Container para 2 vias em formato horizontal */}
        <div id="receipt-print-content" className="space-y-4">
          {/* VIA 1 - Cliente */}
          <div
            ref={printRef}
            className="bg-white p-2 border-4 border-black print:border-2 print:p-1 print-receipt"
            style={{ fontFamily: "monospace", fontSize: "10px" }}
          >
            <div className="grid grid-cols-12 gap-2">
              {/* Coluna Esquerda - Cabeçalho e Informações */}
              <div className="col-span-7 space-y-1">
                {/* Cabeçalho */}
                <div className="text-center border-b-2 border-black pb-1">
                  <h1 className="text-sm font-bold">{storeName.toUpperCase()}</h1>
                  <p className="text-[9px]">{storeAddress}</p>
                  <p className="text-[9px]">Tel/WhatsApp: {storePhone}</p>
                  <p className="text-[10px] mt-0.5 font-bold border border-black inline-block px-1 py-0.5">
                    VIA DO CLIENTE
                  </p>
                </div>

                <div className="text-center border-b-2 border-black pb-1">
                  <h2 className="text-[10px] font-bold">RECIBO DE ENTRADA</h2>
                  <p className="text-[11px]">O.S Nº: <span className="font-bold text-sm">{serviceOrder.osNumber}</span></p>
                  <p className="text-[9px]">Data: {formatDate(serviceOrder.entryDate)}</p>
                </div>

                {/* Dados do Cliente */}
                <div className="border-2 border-black p-1">
                  <h3 className="font-bold text-[9px] text-center bg-gray-200 py-0.5 mb-0.5">DADOS DO CLIENTE</h3>
                  <div className="text-[9px] space-y-0">
                    <p><span className="font-bold">Nome:</span> {client.name}</p>
                    <p><span className="font-bold">Tel:</span> {client.phone}</p>
                    {client.cpf && <p><span className="font-bold">CPF:</span> {client.cpf}</p>}
                  </div>
                </div>

                {/* Dados do Equipamento */}
                <div className="border-2 border-black p-1">
                  <h3 className="font-bold text-[9px] text-center bg-gray-200 py-0.5 mb-0.5">DADOS DO EQUIPAMENTO</h3>
                  <div className="text-[9px] space-y-0">
                    <p><span className="font-bold">Tipo:</span> {serviceOrder.device}</p>
                    <p><span className="font-bold">Marca:</span> {serviceOrder.brand} | <span className="font-bold">Modelo:</span> {serviceOrder.model}</p>
                    {serviceOrder.serialNumber && <p><span className="font-bold">N° Série:</span> {serviceOrder.serialNumber}</p>}
                    {serviceOrder.color && <p><span className="font-bold">Cor:</span> {serviceOrder.color}</p>}
                    {serviceOrder.accessories && <p><span className="font-bold">Acessórios:</span> {serviceOrder.accessories}</p>}
                  </div>
                </div>

                {/* Defeito */}
                <div className="border-2 border-black p-1">
                  <h3 className="font-bold text-[9px] text-center bg-gray-200 py-0.5 mb-0.5">DEFEITO REPORTADO</h3>
                  <p className="text-[9px]">{serviceOrder.defect}</p>
                </div>

                {serviceOrder.observations && (
                  <div className="border-2 border-black p-1">
                    <h3 className="font-bold text-[9px] text-center bg-gray-200 py-0.5 mb-0.5">OBSERVAÇÕES</h3>
                    <p className="text-[9px]">{serviceOrder.observations}</p>
                  </div>
                )}
              </div>

              {/* Coluna Direita - Termos e Assinaturas */}
              <div className="col-span-5 space-y-1">
                {/* Termos de Segurança */}
                <div className="border-2 border-black p-1 bg-yellow-50 h-auto">
                  <p className="text-[8px] leading-tight">
                    <strong className="text-[9px]">⚠️ IMPORTANTE - LEIA:</strong><br/>
                    <strong>SEGURANÇA NA RETIRADA:</strong> A retirada do aparelho consertado será permitida 
                    somente mediante apresentação deste comprovante. Caso outra pessoa vá buscar o aparelho, 
                    ela deve trazer este documento + identificação + autorização do titular.<br/><br/>
                    <strong>PRAZO:</strong> O equipamento ficará no estabelecimento por no máximo 90 dias. 
                    Após esse período, será considerado abandonado. Em caso de não retirada dentro do prazo, 
                    a loja poderá tomar as medidas previstas na legislação.<br/><br/>
                    <strong>RESPONSABILIDADE:</strong> Não nos responsabilizamos por equipamentos deixados 
                    por mais de 90 dias ou retirados sem este comprovante.
                  </p>
                </div>

                {/* Assinaturas */}
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="border-t-2 border-black pt-1 mt-4">
                      <p className="text-[9px] font-bold">Assinatura do Cliente</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-black pt-1 mt-4">
                      <p className="text-[9px] font-bold">Assinatura do Responsável</p>
                      <p className="text-[8px] mt-0.5">{serviceOrder.technicianName || user?.technicianName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VIA 2 - Estabelecimento */}
          <div
            className="bg-white p-2 border-4 border-black print:border-2 print:page-break-before print:p-1 print-receipt"
            style={{ fontFamily: "monospace", fontSize: "10px" }}
          >
            <div className="grid grid-cols-12 gap-2">
              {/* Coluna Esquerda - Cabeçalho e Informações */}
              <div className="col-span-7 space-y-1">
                {/* Cabeçalho */}
                <div className="text-center border-b-2 border-black pb-1">
                  <h1 className="text-sm font-bold">{storeName.toUpperCase()}</h1>
                  <p className="text-[9px]">{storeAddress}</p>
                  <p className="text-[9px]">Tel/WhatsApp: {storePhone}</p>
                  <p className="text-[10px] mt-0.5 font-bold border border-black inline-block px-1 py-0.5">
                    VIA DO ESTABELECIMENTO
                  </p>
                </div>

                <div className="text-center border-b-2 border-black pb-1">
                  <h2 className="text-[10px] font-bold">RECIBO DE ENTRADA</h2>
                  <p className="text-[11px]">O.S Nº: <span className="font-bold text-sm">{serviceOrder.osNumber}</span></p>
                  <p className="text-[9px]">Data: {formatDate(serviceOrder.entryDate)}</p>
                </div>

                {/* Dados do Cliente */}
                <div className="border-2 border-black p-1">
                  <h3 className="font-bold text-[9px] text-center bg-gray-200 py-0.5 mb-0.5">DADOS DO CLIENTE</h3>
                  <div className="text-[9px] space-y-0">
                    <p><span className="font-bold">Nome:</span> {client.name}</p>
                    <p><span className="font-bold">Tel:</span> {client.phone}</p>
                    {client.cpf && <p><span className="font-bold">CPF:</span> {client.cpf}</p>}
                  </div>
                </div>

                {/* Dados do Equipamento */}
                <div className="border-2 border-black p-1">
                  <h3 className="font-bold text-[9px] text-center bg-gray-200 py-0.5 mb-0.5">DADOS DO EQUIPAMENTO</h3>
                  <div className="text-[9px] space-y-0">
                    <p><span className="font-bold">Tipo:</span> {serviceOrder.device}</p>
                    <p><span className="font-bold">Marca:</span> {serviceOrder.brand} | <span className="font-bold">Modelo:</span> {serviceOrder.model}</p>
                    {serviceOrder.serialNumber && <p><span className="font-bold">N° Série:</span> {serviceOrder.serialNumber}</p>}
                    {serviceOrder.color && <p><span className="font-bold">Cor:</span> {serviceOrder.color}</p>}
                    {serviceOrder.accessories && <p><span className="font-bold">Acessórios:</span> {serviceOrder.accessories}</p>}
                  </div>
                </div>

                {/* Defeito */}
                <div className="border-2 border-black p-1">
                  <h3 className="font-bold text-[9px] text-center bg-gray-200 py-0.5 mb-0.5">DEFEITO REPORTADO</h3>
                  <p className="text-[9px]">{serviceOrder.defect}</p>
                </div>

                {serviceOrder.observations && (
                  <div className="border-2 border-black p-1">
                    <h3 className="font-bold text-[9px] text-center bg-gray-200 py-0.5 mb-0.5">OBSERVAÇÕES</h3>
                    <p className="text-[9px]">{serviceOrder.observations}</p>
                  </div>
                )}
              </div>

              {/* Coluna Direita - Termos e Assinaturas */}
              <div className="col-span-5 space-y-1">
                {/* Termos de Segurança */}
                <div className="border-2 border-black p-1 bg-yellow-50 h-auto">
                  <p className="text-[8px] leading-tight">
                    <strong className="text-[9px]">⚠️ IMPORTANTE - LEIA:</strong><br/>
                    <strong>SEGURANÇA NA RETIRADA:</strong> A retirada do aparelho consertado será permitida 
                    somente mediante apresentação deste comprovante. Caso outra pessoa vá buscar o aparelho, 
                    ela deve trazer este documento + identificação + autorização do titular.<br/><br/>
                    <strong>PRAZO:</strong> O equipamento ficará no estabelecimento por no máximo 90 dias. 
                    Após esse período, será considerado abandonado. Em caso de não retirada dentro do prazo, 
                    a loja poderá tomar as medidas previstas na legislação.<br/><br/>
                    <strong>RESPONSABILIDADE:</strong> Não nos responsabilizamos por equipamentos deixados 
                    por mais de 90 dias ou retirados sem este comprovante.
                  </p>
                </div>

                {/* Assinaturas */}
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="border-t-2 border-black pt-1 mt-4">
                      <p className="text-[9px] font-bold">Assinatura do Cliente</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-black pt-1 mt-4">
                      <p className="text-[9px] font-bold">Assinatura do Responsável</p>
                      <p className="text-[8px] mt-0.5">{serviceOrder.technicianName || user?.technicianName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estilos para impressão - CORRIGIDOS */}
        <style>{`
          @media print {
            /* Configuração de página */
            @page {
              size: A4 landscape;
              margin: 5mm;
            }
            
            /* Ocultar elementos não relacionados à impressão */
            .no-print,
            body > div:not(:has(.print-receipt)),
            [role="dialog"] > div:first-child,
            button {
              display: none !important;
            }

            /* Garantir visibilidade do conteúdo */
            [role="dialog"] {
              position: static !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }

            .print-receipt {
              display: block !important;
              visibility: visible !important;
              page-break-inside: avoid !important;
            }
            
            /* Forçar cores e backgrounds */
            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }

            /* Garantir bordas pretas */
            .border-black,
            .border-2,
            .border-4 {
              border-color: #000 !important;
              border-style: solid !important;
            }

            /* Backgrounds */
            .bg-gray-200 {
              background-color: #e5e7eb !important;
            }

            .bg-yellow-50 {
              background-color: #fffbeb !important;
            }

            /* Garantir fonte monospace */
            body {
              font-family: 'Courier New', monospace !important;
            }

            /* Quebra de página entre vias */
            .print\\:page-break-before {
              page-break-before: always !important;
            }

            /* Garantir grid */
            .grid {
              display: grid !important;
            }

            .grid-cols-12 {
              grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            }

            .col-span-5 {
              grid-column: span 5 / span 5 !important;
            }

            .col-span-7 {
              grid-column: span 7 / span 7 !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
