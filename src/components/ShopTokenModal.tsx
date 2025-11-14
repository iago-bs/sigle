import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Key, Copy, Mail, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface ShopTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopToken: string | null;
  shopName: string;
  userEmail: string;
  onConfirmLogout: () => void;
}

export function ShopTokenModal({ 
  open, 
  onOpenChange, 
  shopToken, 
  shopName, 
  userEmail,
  onConfirmLogout 
}: ShopTokenModalProps) {
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleCopyToken = () => {
    if (shopToken) {
      navigator.clipboard.writeText(shopToken);
      toast.success("Token copiado para a área de transferência!");
    }
  };

  const handleSendEmail = async () => {
    if (!shopToken) return;

    setSendingEmail(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/send-token-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            email: userEmail,
            shopToken,
            shopName
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Token enviado para seu e-mail!", {
          description: `Verifique a caixa de entrada de ${userEmail}`
        });
      } else if (response.ok && !result.success && result.showCopyOption) {
        // Serviço de email não configurado, mas não é um erro crítico
        toast.info("Configuração de e-mail pendente", {
          description: "O envio automático de e-mail está sendo configurado. Por favor, copie o token manualmente."
        });
      } else if (!response.ok && response.status === 500) {
        // Erro 500 do servidor - tratamento especial
        toast.info("Serviço de e-mail indisponível", {
          description: "O envio de e-mail está temporariamente indisponível. Por favor, copie o token manualmente."
        });
      } else {
        // Erro real do servidor
        const errorMsg = result.error || result.message || "Erro ao enviar e-mail";
        toast.error("Erro ao enviar e-mail", {
          description: errorMsg
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.info("Serviço de e-mail indisponível", {
        description: "O envio de e-mail está temporariamente indisponível. Por favor, copie o token manualmente."
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleLogout = () => {
    onOpenChange(false);
    onConfirmLogout();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#8b7355]" />
            Token da Sua Loja
          </DialogTitle>
          <DialogDescription>
            Guarde este token com segurança. Você precisará dele para fazer login.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Shop Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Loja:</strong> {shopName}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              <strong>E-mail:</strong> {userEmail}
            </p>
          </div>

          {/* Token Display */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-3">
              🔑 <strong>Token da Loja:</strong>
            </p>
            <div className="bg-white border border-gray-300 rounded p-3 font-mono text-sm break-all">
              {shopToken || "Token não disponível"}
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-800">
              ⚠️ <strong>IMPORTANTE:</strong> Copie e guarde este token em local seguro! Você e outros membros da equipe precisarão dele para fazer login no sistema.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleCopyToken}
                variant="outline"
                disabled={!shopToken}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Token
              </Button>
              <Button
                onClick={handleSendEmail}
                variant="outline"
                disabled={!shopToken || sendingEmail}
              >
                <Mail className="w-4 h-4 mr-2" />
                {sendingEmail ? "Enviando..." : "Enviar por E-mail"}
              </Button>
            </div>
            
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Confirmar Saída
            </Button>
            
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
