import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AddTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTechnicianAdded: () => void;
}

export function AddTechnicianModal({
  isOpen,
  onClose,
  onTechnicianAdded,
}: AddTechnicianModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
    onClose();
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return false;
    }

    if (!email.trim()) {
      setError("Email é obrigatório");
      return false;
    }

    if (!email.includes("@")) {
      setError("Email inválido");
      return false;
    }

    if (!password) {
      setError("Senha é obrigatória");
      return false;
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return false;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call server endpoint to create technician
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erro ao criar técnico');
      }

      toast.success("Técnico criado com sucesso!", {
        description: `${name} pode agora fazer login no sistema`,
      });

      onTechnicianAdded();
      handleClose();
    } catch (err: any) {
      console.error("Add technician error:", err);
      const errorMessage = err.message || "Erro ao criar técnico";
      setError(errorMessage);
      toast.error("Erro ao criar técnico", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? null :
    password.length < 6 ? "weak" :
    password.length < 10 ? "medium" : "strong";

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsDontMatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-[#8b7355] rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Adicionar Novo Técnico
          </DialogTitle>
          <DialogDescription className="text-center">
            Crie uma conta para um novo técnico acessar o sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="joao@oficina.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div className="flex gap-1 mt-1">
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength === 'weak' ? 'bg-red-500' :
                  passwordStrength === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength === 'medium' || passwordStrength === 'strong' ? 
                  (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') :
                  'bg-gray-200'
                }`} />
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password Match Indicator */}
            {passwordsMatch && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>As senhas coincidem</span>
              </div>
            )}
            {passwordsDontMatch && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>As senhas não coincidem</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#8b7355] hover:bg-[#6d5a43]"
            >
              {loading ? "Criando..." : "Criar Técnico"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
