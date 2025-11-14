import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { CreditCard, Banknote, Smartphone, Building2, CheckCircle2, Printer, AlertCircle, Plus, User, Search } from "lucide-react";
import type { Equipment, ServiceOrder, Client } from "../types";
import { useState, useEffect } from "react";
import { calculateWarrantyEndDate } from "../lib/date-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface SellEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  clients: Client[];
  onSell: (invoice: ServiceOrder) => void;
  onCreateClient: (clientData: any) => Promise<void>;
}

export function SellEquipmentModal({ 
  open, 
  onOpenChange, 
  equipment,
  clients,
  onSell,
  onCreateClient
}: SellEquipmentModalProps) {
  const [tabValue, setTabValue] = useState<"select" | "new">("select");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clientSearch, setClientSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "pix" | "transfer">("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [warrantyMonths] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos para criar novo cliente
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCpf, setNewClientCpf] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setTabValue("select");
      setSelectedClientId("");
      setClientSearch("");
      setPaymentAmount("");
      setPaymentMethod("cash");
      setNewClientName("");
      setNewClientPhone("");
      setNewClientEmail("");
      setNewClientCpf("");
      setNewClientAddress("");
      setError(null);
    }
  }, [open]);

  if (!equipment) return null;

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone.includes(clientSearch) ||
    (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const validateForm = (): boolean => {
    if (tabValue === "select" && !selectedClientId) {
      setError("Selecione um cliente");
      return false;
    }

    if (tabValue === "new") {
      if (!newClientName.trim()) {
        setError("Nome do cliente é obrigatório");
        return false;
      }
      if (!newClientPhone.trim()) {
        setError("Telefone do cliente é obrigatório");
        return false;
      }
    }

    if (!paymentAmount || parseFloat(paymentAmount.replace(/[^\d,]/g, "").replace(",", ".")) <= 0) {
      setError("Informe o valor da venda");
      return false;
    }

    return true;
  };

  const handleSell = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let clientToUse: Client | undefined = selectedClient;

      // Se estiver criando novo cliente
      if (tabValue === "new") {
        await onCreateClient({
          name: newClientName,
          phone: newClientPhone,
          email: newClientEmail || undefined,
          cpf: newClientCpf || undefined,
          address: newClientAddress || undefined,
        });

        // Encontrar o cliente recém-criado (será o primeiro da lista após criação)
        clientToUse = clients.find(c => c.name === newClientName && c.phone === newClientPhone);
        
        if (!clientToUse) {
          throw new Error("Erro ao criar cliente");
        }
      }

      if (!clientToUse) {
        throw new Error("Cliente não encontrado");
      }

      // Criar "O.S" de venda (na verdade uma nota fiscal)
      const now = new Date().toISOString();
      const warrantyStartDate = now;
      const warrantyEndDate = calculateWarrantyEndDate(warrantyStartDate, warrantyMonths);
      
      // Gerar número de O.S único
      const osNumber = `VE-${Date.now()}`;

      const invoice: ServiceOrder = {
        id: `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        shop_token: "", // será preenchido pelo App.tsx
        os_number: osNumber,
        client_id: clientToUse.id,
        client_name: clientToUse.name,
        client_phone: clientToUse.phone,
        equipment_type: equipment.device,
        equipment_brand: equipment.brand,
        equipment_model: equipment.model,
        defect: "Venda de equipamento",
        observations: `Venda de equipamento${equipment.serialNumber ? ` (S/N: ${equipment.serialNumber})` : ""}${equipment.notes ? `\n${equipment.notes}` : ""}`,
        status: "completed",
        priority: "normal",
        entry_date: now,
        completion_date: now,
        delivery_date: now,
        warranty_months: warrantyMonths,
        total_value: parseFloat(paymentAmount.replace(/[^\d,]/g, "").replace(",", ".")),
        created_at: now,
        updated_at: now,
        paymentMethod,
        paymentAmount,
        warrantyStartDate,
        warrantyEndDate,
        serialNumber: equipment.serialNumber,
        osNumber,
        clientId: clientToUse.id,
        clientName: clientToUse.name,
        device: equipment.device,
        brand: equipment.brand,
        model: equipment.model,
      };

      onSell(invoice);
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao processar venda:", err);
      setError(err instanceof Error ? err.message : "Erro ao processar venda");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, "");
    
    if (!numbers) return "";
    
    // Converte para centavos
    const cents = parseInt(numbers, 10);
    
    // Formata como moeda brasileira
    const formatted = (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    
    return formatted;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setPaymentAmount(formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#8b7355]" />
            Vender Equipamento
          </DialogTitle>
          <DialogDescription>
            Registrar venda de <span className="font-semibold">{equipment.brand} {equipment.model}</span> e emitir nota fiscal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informações do Equipamento */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-700">Equipamento</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Tipo:</span>
                <span className="ml-2 font-medium">{equipment.device}</span>
              </div>
              <div>
                <span className="text-gray-600">Marca:</span>
                <span className="ml-2 font-medium">{equipment.brand}</span>
              </div>
              <div>
                <span className="text-gray-600">Modelo:</span>
                <span className="ml-2 font-medium">{equipment.model}</span>
              </div>
              {equipment.serialNumber && (
                <div>
                  <span className="text-gray-600">S/N:</span>
                  <span className="ml-2 font-medium">{equipment.serialNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seleção/Criação de Cliente */}
          <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as "select" | "new")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">
                <Search className="w-4 h-4 mr-2" />
                Selecionar Cliente
              </TabsTrigger>
              <TabsTrigger value="new">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4">
              <div>
                <Label>Buscar Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Nome, telefone ou email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                {filteredClients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {clientSearch ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                          selectedClientId === client.id ? "bg-[#8b7355] bg-opacity-10 border-l-4 border-[#8b7355]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-600">{client.phone}</div>
                            {client.email && (
                              <div className="text-xs text-gray-500">{client.email}</div>
                            )}
                          </div>
                          {selectedClientId === client.id && (
                            <CheckCircle2 className="w-5 h-5 text-[#8b7355]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedClient && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Cliente selecionado: {selectedClient.name}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newClientName">Nome *</Label>
                  <Input
                    id="newClientName"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="newClientPhone">Telefone *</Label>
                  <Input
                    id="newClientPhone"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newClientEmail">Email</Label>
                  <Input
                    id="newClientEmail"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="newClientCpf">CPF</Label>
                  <Input
                    id="newClientCpf"
                    value={newClientCpf}
                    onChange={(e) => setNewClientCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="newClientAddress">Endereço</Label>
                <Input
                  id="newClientAddress"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Informações de Pagamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Pagamento</h3>
            
            <div>
              <Label htmlFor="paymentAmount">Valor da Venda *</Label>
              <Input
                id="paymentAmount"
                value={paymentAmount}
                onChange={handleAmountChange}
                placeholder="R$ 0,00"
                className="text-lg font-semibold"
              />
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <Button
                  type="button"
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className={paymentMethod === "cash" ? "bg-[#8b7355] hover:bg-[#7a6345]" : ""}
                >
                  <Banknote className="w-4 h-4 mr-1" />
                  Dinheiro
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className={paymentMethod === "card" ? "bg-[#8b7355] hover:bg-[#7a6345]" : ""}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Cartão
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "pix" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("pix")}
                  className={paymentMethod === "pix" ? "bg-[#8b7355] hover:bg-[#7a6345]" : ""}
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  PIX
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "transfer" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("transfer")}
                  className={paymentMethod === "transfer" ? "bg-[#8b7355] hover:bg-[#7a6345]" : ""}
                >
                  <Building2 className="w-4 h-4 mr-1" />
                  Transf.
                </Button>
              </div>
            </div>
          </div>

          {/* Informações de Garantia */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">
                Garantia de {warrantyMonths} meses incluída (SIGLE Systems)
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSell}
            disabled={loading}
            className="bg-[#8b7355] hover:bg-[#7a6345] text-white"
          >
            {loading ? (
              <>Processando...</>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Emitir Nota Fiscal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
