import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { 
  isValidEmail, 
  isValidPhone, 
  isValidCPF, 
  formatPhone, 
  formatCPF,
  validationMessages 
} from "../../lib/validators";
import { useClients, type Client } from "../../hooks/useClients";

interface EditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess?: () => void;
}

export function EditClientModal({ open, onOpenChange, client, onSuccess }: EditClientModalProps) {
  const { updateClient } = useClients();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    address: "",
    city: "",
    state: "",
  });

  const [touched, setTouched] = useState({
    phone: false,
    email: false,
    cpf: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email || "",
        cpf: client.cpf || "",
        address: client.address || "",
        city: client.city || "Vitória da Conquista",
        state: client.state || "BA",
      });
      setTouched({
        phone: false,
        email: false,
        cpf: false,
      });
    }
  }, [client]);

  const emailValid = isValidEmail(formData.email || "");
  const phoneValid = isValidPhone(formData.phone);
  const cpfValid = isValidCPF(formData.cpf || "");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client) return;
    
    setTouched({
      phone: true,
      email: true,
      cpf: true,
    });

    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!phoneValid) {
      toast.error("Telefone inválido", {
        description: validationMessages.phone
      });
      return;
    }

    if (formData.email && !emailValid) {
      toast.error("E-mail inválido", {
        description: validationMessages.email
      });
      return;
    }

    if (formData.cpf && !cpfValid) {
      toast.error("CPF inválido", {
        description: validationMessages.cpf
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const whatsapp = formData.phone.replace(/\D/g, '');

      await updateClient(client.id, {
        name: formData.name.trim(),
        phone: formData.phone,
        whatsapp: whatsapp || undefined,
        email: formData.email || undefined,
        cpf: formData.cpf || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
      });

      toast.success("Cliente atualizado com sucesso!");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input 
              id="name" 
              placeholder="Digite o nome completo" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <div className="relative">
                <Input 
                  id="cpf" 
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  onBlur={() => setTouched({ ...touched, cpf: true })}
                  maxLength={14}
                  disabled={isSubmitting}
                  className={
                    formData.cpf && touched.cpf
                      ? cpfValid
                        ? "border-green-500 pr-10"
                        : "border-red-500 pr-10"
                      : ""
                  }
                />
                {formData.cpf && touched.cpf && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {cpfValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {formData.cpf && touched.cpf && !cpfValid && (
                <p className="text-xs text-red-500">{validationMessages.cpf}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <div className="relative">
                <Input 
                  id="phone" 
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  maxLength={15}
                  disabled={isSubmitting}
                  required
                  className={
                    formData.phone && touched.phone
                      ? phoneValid
                        ? "border-green-500 pr-10"
                        : "border-red-500 pr-10"
                      : ""
                  }
                />
                {formData.phone && touched.phone && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {phoneValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {formData.phone && touched.phone && !phoneValid && (
                <p className="text-xs text-red-500">{validationMessages.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail (opcional)</Label>
            <div className="relative">
              <Input 
                id="email" 
                type="text"
                placeholder="cliente@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => setTouched({ ...touched, email: true })}
                disabled={isSubmitting}
                className={
                  formData.email && touched.email
                    ? emailValid
                      ? "border-green-500 pr-10"
                      : "border-red-500 pr-10"
                    : ""
                }
              />
              {formData.email && touched.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {formData.email && touched.email && !emailValid && (
              <p className="text-xs text-red-500">{validationMessages.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input 
              id="address" 
              placeholder="Rua, número, bairro"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input 
                id="city" 
                placeholder="Digite a cidade"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input 
                id="state" 
                placeholder="UF"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                maxLength={2}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#8b7355] hover:bg-[#7a6345]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Atualizando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
