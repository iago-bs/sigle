import {
  X,
  User,
  Smartphone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  Edit2,
  Save,
  Send,
  FileText,
  Shield,
  Wrench,
  CreditCard,
  Clock,
  Printer,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { ServiceOrder, Client } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { InvoiceDocument } from "./InvoiceDocument";
import { sendInvoiceEmail } from "../lib/email-service";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrder: ServiceOrder;
  client: Client;
  onUpdatePayment: (
    osId: string,
    paymentMethod: ServiceOrder["paymentMethod"],
    paymentAmount: string
  ) => void;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  serviceOrder,
  client,
  onUpdatePayment,
}: InvoiceDetailModalProps) {
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    ServiceOrder["paymentMethod"]
  >(serviceOrder.paymentMethod || "pix");
  const [paymentAmount, setPaymentAmount] = useState(
    serviceOrder.paymentAmount || ""
  );
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Função para identificar se é uma venda
  const isSale = (order: ServiceOrder): boolean => {
    return order.defect === "Venda de equipamento" || order.osNumber?.startsWith("VE-") || order.os_number?.startsWith("VE-");
  };

  // Função para formatar o título da venda
  const getSaleTitle = (order: ServiceOrder): string => {
    if (!isSale(order)) return `O.S #${order.osNumber || order.id}`;
    
    const date = new Date(order.entry_date || order.created_at);
    const formattedDate = date.toLocaleDateString("pt-BR");
    return `Venda de ${order.device} no dia ${formattedDate}`;
  };

  // Reset states when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(serviceOrder.paymentMethod || "pix");
      setPaymentAmount(serviceOrder.paymentAmount || "");
      setIsEditingPayment(false);
    }
  }, [isOpen, serviceOrder]);

  if (!isOpen) return null;

  const handleSavePayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount.replace(/[^\d,]/g, "").replace(",", ".")) <= 0) {
      toast.error("Insira um valor válido para o pagamento");
      return;
    }

    onUpdatePayment(serviceOrder.id, paymentMethod, paymentAmount);
    setIsEditingPayment(false);
    toast.success("Forma de pagamento atualizada com sucesso!");
  };

  const handleSendEmail = async () => {
    if (!client.email) {
      toast.error("Cliente não possui email cadastrado");
      return;
    }

    if (!serviceOrder.warrantyStartDate || !serviceOrder.warrantyEndDate) {
      toast.error("Garantia não configurada");
      return;
    }

    try {
      const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
      };

      toast.info("Enviando email...");
      
      await sendInvoiceEmail({
        to: client.email,
        clientName: client.name,
        osNumber: serviceOrder.osNumber || serviceOrder.id,
        deliveryDate: serviceOrder.deliveryDate ? formatDate(serviceOrder.deliveryDate) : undefined,
        totalValue: parseFloat(paymentAmount.replace(/[^\d,]/g, "").replace(",", ".")) || 0,
        paymentMethod: getPaymentMethodLabel(paymentMethod),
        warrantyEndDate: formatDate(serviceOrder.warrantyEndDate),
        parts: [
          {
            name: serviceOrder.defect || "Serviço de reparo",
            quantity: 1,
            price: parseFloat(paymentAmount.replace(/[^\d,]/g, "").replace(",", ".")) || 0,
          },
        ],
      });

      toast.success("Email enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar email. Verifique a configuração do Resend.");
    }
  };

  const handleSendWhatsApp = () => {
    if (!client.phone) {
      toast.error("Cliente não possui número de telefone cadastrado");
      return;
    }

    // Remove all non-numeric characters from phone
    const cleanPhone = client.phone.replace(/\D/g, "");
    
    // Format message with invoice and warranty info
    const message = `
*NOTA FISCAL E GARANTIA - ${getSaleTitle(serviceOrder)}*

Olá *${client.name}*! 👋

Segue os detalhes do ${isSale(serviceOrder) ? "equipamento adquirido" : "serviço realizado"}:

📱 *Equipamento:*
${serviceOrder.device} - ${serviceOrder.brand} ${serviceOrder.model}
${serviceOrder.serialNumber ? `Série: ${serviceOrder.serialNumber}` : ""}

${isSale(serviceOrder) ? "📦 *Tipo:*" : "🔧 *Serviço Realizado:*"}
${isSale(serviceOrder) ? "Venda de Equipamento" : serviceOrder.defect}

💰 *Valor Total:* ${paymentAmount || "R$ 0,00"}
💳 *Forma de Pagamento:* ${getPaymentMethodLabel(paymentMethod)}

📅 *Datas:*
• Entrada: ${serviceOrder.entryDate ? new Date(serviceOrder.entryDate).toLocaleDateString("pt-BR") : "-"}
• Conclusão: ${serviceOrder.completionDate ? new Date(serviceOrder.completionDate).toLocaleDateString("pt-BR") : "-"}
• Entrega: ${serviceOrder.deliveryDate ? new Date(serviceOrder.deliveryDate).toLocaleDateString("pt-BR") : "-"}

🛡️ *GARANTIA:*
${serviceOrder.warrantyMonths || 3} meses de garantia
• Início: ${serviceOrder.warrantyStartDate ? new Date(serviceOrder.warrantyStartDate).toLocaleDateString("pt-BR") : "-"}
• Término: ${serviceOrder.warrantyEndDate ? new Date(serviceOrder.warrantyEndDate).toLocaleDateString("pt-BR") : "-"}

${serviceOrder.observations ? `\n📝 *Observações:* ${serviceOrder.observations}` : ""}

---
Obrigado pela confiança! 
Qualquer dúvida, estamos à disposição.
    `.trim();

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp Web Business
    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Abrindo WhatsApp...");
  };

  const getPaymentMethodLabel = (method?: ServiceOrder["paymentMethod"]) => {
    const methods = {
      cash: "Dinheiro",
      card: "Cartão",
      pix: "PIX",
      transfer: "Transferência",
    };
    return method ? methods[method] : "-";
  };

  const handleOpenInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  // Converter ServiceOrder para Invoice format
  const getInvoiceData = () => {
    if (!serviceOrder.warrantyStartDate || !serviceOrder.warrantyEndDate) {
      return null;
    }

    const formatDate = (isoDate: string) => {
      const date = new Date(isoDate);
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    };

    return {
      id: `INV-${serviceOrder.id}`,
      osNumber: serviceOrder.osNumber || serviceOrder.id,
      clientName: client.name,
      clientPhone: client.phone || "",
      device: `${serviceOrder.device} - ${serviceOrder.brand} ${serviceOrder.model}`,
      items: [
        {
          description: serviceOrder.defect || "Serviço de reparo",
          quantity: 1,
          unitPrice: serviceOrder.paymentAmount || "R$ 0,00",
          total: serviceOrder.paymentAmount || "R$ 0,00",
        },
      ],
      totalValue: serviceOrder.paymentAmount || "R$ 0,00",
      issueDate: serviceOrder.completionDate ? formatDate(serviceOrder.completionDate) : formatDate(new Date().toISOString()),
      warrantyEndDate: formatDate(serviceOrder.warrantyEndDate),
      technicianName: serviceOrder.technicianName || "Técnico Responsável",
    };
  };

  const getStatusBadge = () => {
    const badges = {
      completed: { label: "✅ Concluído", className: "bg-green-100 text-green-800" },
      "in-progress": { label: "🔧 Em Andamento", className: "bg-blue-100 text-blue-800" },
      pending: { label: "⏳ Pendente", className: "bg-yellow-100 text-yellow-800" },
      "waiting-parts": { label: "📦 Aguardando Peças", className: "bg-orange-100 text-orange-800" },
      "under-observation": { label: "👁️ Em Observação", className: "bg-purple-100 text-purple-800" },
      cancelled: { label: "❌ Cancelado", className: "bg-gray-100 text-gray-800" },
    };
    const badge = badges[serviceOrder.status] || badges.pending;
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8b7355] to-[#7a6345] text-white p-6 flex items-center justify-between">
          <div>
            <h2
              className="text-2xl"
              style={{
                fontFamily: "Lexend Deca, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              Nota Fiscal - {getSaleTitle(serviceOrder)}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Detalhes completos {isSale(serviceOrder) ? "da venda" : "do serviço"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            <div className="flex gap-2">
              {serviceOrder.warrantyStartDate && serviceOrder.warrantyEndDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInvoice}
                  className="flex items-center gap-2 bg-[#8b7355] text-white hover:bg-[#7a6345] hover:text-white"
                >
                  <Printer className="w-4 h-4" />
                  Ver Nota Fiscal
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar ao Cliente
              </Button>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <h3 className="flex items-center gap-2 font-semibold mb-3 text-[#8b7355]">
              <User className="w-5 h-5" />
              Dados do Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-semibold">{client.name}</p>
              </div>
              {client.phone && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> Telefone
                  </p>
                  <p className="font-semibold">{client.phone}</p>
                </div>
              )}
              {client.email && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="font-semibold">{client.email}</p>
                </div>
              )}
              {client.cpf && (
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-semibold">{client.cpf}</p>
                </div>
              )}
              {client.address && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Endereço
                  </p>
                  <p className="font-semibold">
                    {client.address}
                    {client.city && `, ${client.city}`}
                    {client.state && ` - ${client.state}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Equipment Information */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h3 className="flex items-center gap-2 font-semibold mb-3 text-blue-700">
              <Wrench className="w-5 h-5" />
              {isSale(serviceOrder) ? "Equipamento" : "Equipamento e Serviço"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Equipamento</p>
                <p className="font-semibold">{serviceOrder.device}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Marca / Modelo</p>
                <p className="font-semibold">
                  {serviceOrder.brand} {serviceOrder.model}
                </p>
              </div>
              {serviceOrder.serialNumber && (
                <div>
                  <p className="text-sm text-gray-600">Número de Série</p>
                  <p className="font-semibold">{serviceOrder.serialNumber}</p>
                </div>
              )}
              {serviceOrder.color && (
                <div>
                  <p className="text-sm text-gray-600">Cor</p>
                  <p className="font-semibold">{serviceOrder.color}</p>
                </div>
              )}
              {serviceOrder.accessories && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Acessórios</p>
                  <p className="font-semibold">{serviceOrder.accessories}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-600">{isSale(serviceOrder) ? "Tipo" : "Defeito Reportado"}</p>
                <p className="font-semibold">{isSale(serviceOrder) ? "Venda de Equipamento" : serviceOrder.defect}</p>
              </div>
              {serviceOrder.observations && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="font-semibold">{serviceOrder.observations}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <h3 className="flex items-center gap-2 font-semibold mb-3 text-purple-700">
              <Calendar className="w-5 h-5" />
              Datas
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {serviceOrder.entryDate && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Entrada
                  </p>
                  <p className="font-semibold">
                    {new Date(serviceOrder.entryDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              {serviceOrder.completionDate && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Conclusão
                  </p>
                  <p className="font-semibold">
                    {new Date(serviceOrder.completionDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              {serviceOrder.deliveryDate && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Entrega
                  </p>
                  <p className="font-semibold">
                    {new Date(serviceOrder.deliveryDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information - Editable */}
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 font-semibold text-green-700">
                <CreditCard className="w-5 h-5" />
                Pagamento
              </h3>
              {!isEditingPayment ? (
                <button
                  onClick={() => setIsEditingPayment(true)}
                  className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              ) : (
                <button
                  onClick={handleSavePayment}
                  className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              )}
            </div>

            {!isEditingPayment ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Forma de Pagamento</p>
                  <p className="font-semibold">
                    {getPaymentMethodLabel(serviceOrder.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-semibold text-green-700 text-xl">
                    {serviceOrder.paymentAmount || "R$ 0,00"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Forma de Pagamento
                  </label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: any) => setPaymentMethod(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Dinheiro</SelectItem>
                      <SelectItem value="card">💳 Cartão</SelectItem>
                      <SelectItem value="pix">📱 PIX</SelectItem>
                      <SelectItem value="transfer">🏦 Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Valor Total
                  </label>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Warranty Information */}
          {serviceOrder.warrantyStartDate && serviceOrder.warrantyEndDate && (
            <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
              <h3 className="flex items-center gap-2 font-semibold mb-3 text-amber-700">
                <Shield className="w-5 h-5" />
                Garantia
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Período</p>
                  <p className="font-semibold">
                    {serviceOrder.warrantyMonths || 3} meses
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Início</p>
                  <p className="font-semibold">
                    {new Date(serviceOrder.warrantyStartDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Término</p>
                  <p className="font-semibold">
                    {new Date(serviceOrder.warrantyEndDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-amber-100 rounded border border-amber-300">
                <p className="text-xs text-amber-800">
                  <strong>Atenção:</strong> A garantia cobre defeitos relacionados ao
                  serviço executado. Não cobre danos físicos, mau uso ou defeitos
                  não relacionados ao reparo realizado.
                </p>
              </div>
            </div>
          )}

          {/* Technician Information */}
          <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
            <h3 className="flex items-center gap-2 font-semibold mb-2 text-gray-700">
              <User className="w-5 h-5" />
              Técnico Responsável
            </h3>
            <p className="font-semibold">{serviceOrder.technicianName}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {serviceOrder.warrantyStartDate && serviceOrder.warrantyEndDate && (
            <Button
              variant="outline"
              onClick={handleOpenInvoice}
              className="bg-[#8b7355] text-white hover:bg-[#7a6345]"
            >
              <Printer className="w-4 h-4 mr-2" />
              Ver Nota Fiscal
            </Button>
          )}
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSendWhatsApp}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar via WhatsApp
          </Button>
        </div>
      </div>

      {/* Invoice Document Modal */}
      <InvoiceDocument
        invoice={getInvoiceData()}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
}
