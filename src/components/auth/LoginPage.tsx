import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Wrench, Loader2, AlertCircle, Key } from "lucide-react";
import { toast } from "sonner";

interface LoginPageProps {
  onSignIn: (email: string, password: string, shopToken: string) => Promise<void>;
  onSwitchToSignUp: () => void;
}

export function LoginPage({ onSignIn, onSwitchToSignUp }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopToken, setShopToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!shopToken.trim()) {
      setError("Token da loja é obrigatório");
      toast.error("Token da loja é obrigatório");
      return;
    }

    setLoading(true);

    try {
      await onSignIn(email, password, shopToken);
      toast.success("Login realizado com sucesso!");
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Erro ao fazer login. Verifique suas credenciais.";
      setError(errorMessage);
      toast.error("Erro no login", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0e8] to-[#e8dcc8] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-[#8b7355] rounded-full flex items-center justify-center">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle 
              className="text-3xl"
              style={{
                fontFamily: 'Lexend Deca, sans-serif',
                fontWeight: 800,
                color: '#181717'
              }}
            >
              SIGLE Systems
            </CardTitle>
            <CardDescription className="text-base mt-1">
              Sistema de gerenciamento de lojas de eletrônicos
            </CardDescription>
            <CardDescription className="text-sm mt-3 text-gray-500">
              Entre com suas credenciais
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopToken" className="flex items-center gap-1">
                <Key className="w-3 h-3" />
                Token da Loja
              </Label>
              <Input
                id="shopToken"
                type="text"
                placeholder="Token único da sua loja"
                value={shopToken}
                onChange={(e) => setShopToken(e.target.value)}
                required
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Token único gerado no cadastro da loja
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button 
              type="submit" 
              className="w-full bg-[#8b7355] hover:bg-[#7a6345]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Não tem uma conta? </span>
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-[#8b7355] hover:underline font-medium"
                disabled={loading}
              >
                Criar conta
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
