import { ArrowLeft, Plus, Search, FileText, Printer, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BudgetDetailModal } from "./BudgetDetailModal";
import { EditBudgetModal } from "./EditBudgetModal";
import { InvoiceDocument } from "./InvoiceDocument";
import { BudgetPrintDocument } from "./BudgetPrintDocument";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { ServiceOrder } from "../types";

interface Budget {
  id: string;
  osNumber: string;
  clientName: string;
  clientPhone: string;
  device: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  totalValue: string;
  date: string;
  expiryDate: string;
  status: "pending" | "approved" | "rejected" | "expired";
}

interface Invoice {
  id: string;
  osNumber: string;
  clientName: string;
  clientPhone: string;
  device: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  totalValue: string;
  issueDate: string;
  warrantyEndDate: string;
  technicianName: string;
}

interface BudgetsPageProps {
  onBack: () => void;
}

// Mock data
const mockBudgets: Budget[] = [
  {
    id: "1",
    osNumber: "1002",
    clientName: "Maria Souza",
    clientPhone: "(11) 98765-4321",
    device: "TV Samsung U8100F",
    items: [
      { description: "BARRA LED 37", quantity: 2, unitPrice: "R$ 150,00", total: "R$ 300,00" },
      { description: "Mão de obra", quantity: 1, unitPrice: "R$ 200,00", total: "R$ 200,00" }
    ],
    totalValue: "R$ 500,00",
    date: "01/10/2025",
    expiryDate: "15/10/2025",
    status: "pending"
  },
  {
    id: "2",
    osNumber: "1005",
    clientName: "João Silva",
    clientPhone: "(11) 99876-5432",
    device: "LG 42LB5600",
    items: [
      { description: "CAPACITOR 470uF", quantity: 3, unitPrice: "R$ 25,00", total: "R$ 75,00" },
      { description: "Diagnóstico", quantity: 1, unitPrice: "R$ 80,00", total: "R$ 80,00" }
    ],
    totalValue: "R$ 155,00",
    date: "28/09/2025",
    expiryDate: "12/10/2025",
    status: "approved"
  },
  {
    id: "3",
    osNumber: "1008",
    clientName: "Carlos Santos",
    clientPhone: "(11) 97654-3210",
    device: "Sony KDL-32W655D",
    items: [
      { description: "FONTE STANDY", quantity: 1, unitPrice: "R$ 180,00", total: "R$ 180,00" },
      { description: "Reparo", quantity: 1, unitPrice: "R$ 150,00", total: "R$ 150,00" }
    ],
    totalValue: "R$ 330,00",
    date: "25/09/2025",
    expiryDate: "09/10/2025",
    status: "expired"
  },
  {
    id: "4",
    osNumber: "1011",
    clientName: "Ana Costa",
    clientPhone: "(11) 96543-2109",
    device: "Samsung Microondas",
    items: [
      { description: "Magnetron", quantity: 1, unitPrice: "R$ 280,00", total: "R$ 280,00" }
    ],
    totalValue: "R$ 280,00",
    date: "30/09/2025",
    expiryDate: "14/10/2025",
    status: "rejected"
  },
  {
    id: "5",
    osNumber: "1012",
    clientName: "Pedro Oliveira",
    clientPhone: "(11) 95432-1098",
    device: "LG Smart TV 55",
    items: [
      { description: "Placa T-CON", quantity: 1, unitPrice: "R$ 320,00", total: "R$ 320,00" },
      { description: "Instalação", quantity: 1, unitPrice: "R$ 100,00", total: "R$ 100,00" }
    ],
    totalValue: "R$ 420,00",
    date: "03/10/2025",
    expiryDate: "17/10/2025",
    status: "pending"
  }
];

export function BudgetsPage({ onBack }: BudgetsPageProps) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<Budget["status"] | "all">("all");
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [budgetToPrint, setBudgetToPrint] = useState<Budget | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Carregar orçamentos do localStorage
  useEffect(() => {
    const loadedBudgets = JSON.parse(localStorage.getItem("budgets") || "[]");
    setBudgets(loadedBudgets.length > 0 ? loadedBudgets : mockBudgets);
  }, []);

  // Salvar orçamentos no localStorage sempre que mudar
  useEffect(() => {
    if (budgets.length > 0) {
      localStorage.setItem("budgets", JSON.stringify(budgets));
    }
  }, [budgets]);

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch =
      budget.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.osNumber.includes(searchQuery) ||
      budget.device.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || budget.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Função para calcular data de garantia (3 meses)
  const calculateWarrantyDate = (issueDate: string): string => {
    const [day, month, year] = issueDate.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    date.setMonth(date.getMonth() + 3);
    
    const newDay = String(date.getDate()).padStart(2, "0");
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    const newYear = date.getFullYear();
    
    return `${newDay}/${newMonth}/${newYear}`;
  };

  // Handlers
  const handleApproveBudget = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    
    if (budget) {
      // Calcular datas
      const today = new Date();
      const issueDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
      const warrantyEndDate = calculateWarrantyDate(issueDate);
      
      // Criar/Atualizar ServiceOrder com nota fiscal
      const serviceOrders: ServiceOrder[] = JSON.parse(localStorage.getItem("serviceOrders") || "[]");
      
      // Encontrar a O.S correspondente pelo número
      const existingOrderIndex = serviceOrders.findIndex(
        (order) => order.osNumber === budget.osNumber
      );

      const warrantyStart = new Date(today);
      const warrantyEnd = new Date(today);
      warrantyEnd.setMonth(warrantyEnd.getMonth() + 3);

      if (existingOrderIndex !== -1) {
        // Atualizar O.S existente com dados de conclusão e garantia
        serviceOrders[existingOrderIndex] = {
          ...serviceOrders[existingOrderIndex],
          status: "completed",
          completionDate: today.toISOString(),
          deliveryDate: today.toISOString(),
          warrantyMonths: 3,
          warrantyStartDate: warrantyStart.toISOString(),
          warrantyEndDate: warrantyEnd.toISOString(),
          paymentAmount: budget.totalValue,
          technicianName: user?.technicianName || user?.user_metadata?.name || "Técnico Responsável",
        };
      } else {
        // Criar nova O.S se não existir (fallback)
        const newOrder: ServiceOrder = {
          id: `OS-${Date.now()}`,
          osNumber: budget.osNumber,
          clientId: budget.id,
          clientName: budget.clientName,
          device: budget.device,
          brand: "",
          model: "",
          defect: budget.items.map(item => item.description).join(", "),
          status: "completed",
          entryDate: today.toISOString(),
          completionDate: today.toISOString(),
          deliveryDate: today.toISOString(),
          warrantyMonths: 3,
          warrantyStartDate: warrantyStart.toISOString(),
          warrantyEndDate: warrantyEnd.toISOString(),
          paymentAmount: budget.totalValue,
          technicianName: user?.technicianName || user?.user_metadata?.name || "Técnico Responsável",
        };
        serviceOrders.push(newOrder);
      }

      // Salvar no localStorage
      localStorage.setItem("serviceOrders", JSON.stringify(serviceOrders));

      // Gerar Invoice para visualização
      const invoice: Invoice = {
        id: `INV-${budget.id}`,
        osNumber: budget.osNumber,
        clientName: budget.clientName,
        clientPhone: budget.clientPhone,
        device: budget.device,
        items: budget.items,
        totalValue: budget.totalValue,
        issueDate,
        warrantyEndDate,
        technicianName: user?.technicianName || user?.user_metadata?.name || "Técnico Responsável",
      };
      
      // Remover orçamento da lista (ele agora está em Notas Fiscais)
      setBudgets(budgets.filter(b => b.id !== budgetId));
      
      setGeneratedInvoice(invoice);
      setIsInvoiceModalOpen(true);
      
      toast.success("Orçamento Aprovado!", {
        description: `Nota Fiscal gerada - O.S #${budget.osNumber}. Acesse em "Notas Fiscais"`,
        duration: 5000,
      });
    }
  };

  const handleRejectBudget = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    
    if (budget) {
      // Atualizar status do orçamento para rejeitado
      setBudgets(budgets.map(b => 
        b.id === budgetId ? { ...b, status: "rejected" as const } : b
      ));
      
      // Concluir a O.S como "cliente recusou serviço"
      const serviceOrders: ServiceOrder[] = JSON.parse(localStorage.getItem("serviceOrders") || "[]");
      const existingOrderIndex = serviceOrders.findIndex(
        (order) => order.osNumber === budget.osNumber
      );
      
      if (existingOrderIndex !== -1) {
        const today = new Date();
        serviceOrders[existingOrderIndex] = {
          ...serviceOrders[existingOrderIndex],
          status: "completed",
          completionDate: today.toISOString(),
          deliveryDate: today.toISOString(),
          observations: (serviceOrders[existingOrderIndex].observations || "") + 
            "\n\nCliente recusou o orçamento",
        };
        
        localStorage.setItem("serviceOrders", JSON.stringify(serviceOrders));
      }
      
      toast.error("Orçamento Rejeitado", {
        description: `O.S #${budget.osNumber} concluída como "Cliente recusou serviço"`,
        duration: 4000,
      });
    }
  };

  const handleViewDetails = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDetailModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditModalOpen(true);
  };

  const handleSaveBudget = (updatedBudget: Budget) => {
    setBudgets(budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b));
    setSelectedBudget(updatedBudget);
  };

  const handlePrintBudget = (budget: Budget) => {
    setBudgetToPrint(budget);
    setIsPrintModalOpen(true);
  };

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

  const statusCounts = {
    all: budgets.length,
    pending: budgets.filter(b => b.status === "pending").length,
    approved: budgets.filter(b => b.status === "approved").length,
    rejected: budgets.filter(b => b.status === "rejected").length,
    expired: budgets.filter(b => b.status === "expired").length
  };

  return (
    <div className="w-full h-screen bg-[#f5f0e8] overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
              <div>
                <h1 className="text-2xl font-bold">Orçamentos</h1>
                <p className="text-sm text-gray-600">Gerencie os orçamentos de serviços</p>
              </div>
            </div>
            
            <Button className="bg-[#8b7355] hover:bg-[#7a6345]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, O.S ou aparelho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-full bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "all"
                  ? "bg-[#8b7355] text-white"
                  : "bg-white border-2 border-gray-300 hover:border-[#8b7355]"
              }`}
            >
              Todos ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-white border-2 border-gray-300 hover:border-yellow-500"
              }`}
            >
              Pendentes ({statusCounts.pending})
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-white border-2 border-gray-300 hover:border-green-500"
              }`}
            >
              Aprovados ({statusCounts.approved})
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "rejected"
                  ? "bg-red-500 text-white"
                  : "bg-white border-2 border-gray-300 hover:border-red-500"
              }`}
            >
              Rejeitados ({statusCounts.rejected})
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filterStatus === "expired"
                  ? "bg-gray-500 text-white"
                  : "bg-white border-2 border-gray-300 hover:border-gray-500"
              }`}
            >
              Expirados ({statusCounts.expired})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid gap-4">
          {filteredBudgets.map((budget) => (
            <div
              key={budget.id}
              className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-[#8b7355] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{budget.clientName}</h3>
                    {getStatusBadge(budget.status)}
                  </div>
                  <p className="text-gray-600">O.S #{budget.osNumber} - {budget.device}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-[#8b7355]">{budget.totalValue}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-b border-gray-200 py-3 mb-4">
                <div className="space-y-2">
                  {budget.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.description}
                      </span>
                      <span className="font-semibold">{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div>
                  <span className="mr-4">Emitido: {budget.date}</span>
                  <span>Validade: {budget.expiryDate}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(budget)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePrintBudget(budget)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                {budget.status === "pending" && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveBudget(budget.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleRejectBudget(budget.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBudgets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum orçamento encontrado</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <BudgetDetailModal
        budget={selectedBudget}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onApprove={handleApproveBudget}
        onReject={handleRejectBudget}
        onPrint={handlePrintBudget}
        onEdit={handleEditBudget}
      />

      {/* Edit Modal */}
      <EditBudgetModal
        budget={selectedBudget}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveBudget}
      />

      {/* Invoice Modal */}
      <InvoiceDocument
        invoice={generatedInvoice}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      {/* Budget Print Modal */}
      <BudgetPrintDocument
        budget={budgetToPrint}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}