import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Wrench, Loader2, AlertCircle, CheckCircle2, Store, MapPin, Phone, Key, Copy, Building2, Users } from "lucide-react";
import { toast } from "sonner";
import { isValidEmail } from "../../lib/validators";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface SignUpPageProps {
  onSignUp: (email: string, password: string, name: string, storeName: string, storeAddress: string, storePhone: string, mode: 'create' | 'join', existingToken?: string) => Promise<any>;
  onSwitchToLogin: () => void;
}

export function SignUpPage({ onSignUp, onSwitchToLogin }: SignUpPageProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [existingToken, setExistingToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [shopToken, setShopToken] = useState("");
  const [checkingStoreName, setCheckingStoreName] = useState(false);
  const [storeNameAvailable, setStoreNameAvailable] = useState<boolean | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenShopInfo, setTokenShopInfo] = useState<any>(null);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const emailValid = isValidEmail(email);
  const passwordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Check if store name is available
  const checkStoreName = async (name: string) => {
    if (!name.trim() || name.length < 3) {
      setStoreNameAvailable(null);
      return;
    }

    setCheckingStoreName(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/check-store-name`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ storeName: name }),
        }
      );

      const result = await response.json();
      setStoreNameAvailable(result.available);
      
      if (!result.available) {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Error checking store name:", err);
      setStoreNameAvailable(null);
    } finally {
      setCheckingStoreName(false);
    }
  };

  // Validate shop token
  const validateToken = async (token: string) => {
    if (!token.trim()) {
      setTokenValid(null);
      setTokenShopInfo(null);
      return;
    }

    setValidatingToken(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/validate-shop-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ shopToken: token }),
        }
      );

      const result = await response.json();
      setTokenValid(result.valid);
      
      if (result.valid) {
        setTokenShopInfo(result.shop);
        toast.success(`Token válido! Você irá se juntar à loja: ${result.shop.name}`);
      } else {
        setTokenShopInfo(null);
        toast.error(result.error || "Token inválido");
      }
    } catch (err) {
      console.error("Error validating token:", err);
      setTokenValid(null);
      setTokenShopInfo(null);
    } finally {
      setValidatingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate common fields
    if (!name.trim()) {
      setError("Nome é obrigatório");
      toast.error("Preencha todos os campos");
      return;
    }

    if (!emailValid) {
      setError("E-mail inválido");
      toast.error("E-mail inválido");
      return;
    }

    if (!passwordValid) {
      setError("A senha deve ter pelo menos 6 caracteres");
      toast.error("Senha muito curta");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      toast.error("As senhas não coincidem");
      return;
    }

    // Mode-specific validation
    if (mode === 'create') {
      if (!storeName.trim()) {
        setError("Nome do estabelecimento é obrigatório");
        toast.error("Nome do estabelecimento é obrigatório");
        return;
      }

      if (storeNameAvailable === false) {
        setError("Este nome de loja já está sendo usado");
        toast.error("Escolha outro nome para sua loja");
        return;
      }

      if (!storeAddress.trim()) {
        setError("Endereço do estabelecimento é obrigatório");
        toast.error("Endereço do estabelecimento é obrigatório");
        return;
      }

      if (!storePhone.trim()) {
        setError("Telefone/WhatsApp do estabelecimento é obrigatório");
        toast.error("Telefone/WhatsApp do estabelecimento é obrigatório");
        return;
      }
    } else {
      // Join mode
      if (!existingToken.trim()) {
        setError("Token da loja é obrigatório");
        toast.error("Informe o token da loja");
        return;
      }

      if (tokenValid === false) {
        setError("Token da loja inválido");
        toast.error("Token da loja inválido");
        return;
      }
    }

    setLoading(true);

    try {
      const result = await onSignUp(
        email, 
        password, 
        name, 
        mode === 'create' ? storeName : tokenShopInfo?.name || '',
        mode === 'create' ? storeAddress : tokenShopInfo?.address || '',
        mode === 'create' ? storePhone : tokenShopInfo?.phone || '',
        mode,
        mode === 'join' ? existingToken : undefined
      );
      
      // Show the shop token to the user (only if creating new store)
      if (mode === 'create' && result.shopToken) {
        setShopToken(result.shopToken);
        setShowTokenModal(true);
        
        // Automatically send token via email
        try {
          const emailResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/send-token-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({ 
                email: email,
                shopToken: result.shopToken,
                shopName: storeName
              }),
            }
          );
          
          const emailResult = await emailResponse.json();
          
          if (emailResponse.ok && emailResult.success) {
            console.log("Token email sent successfully");
          } else if (!emailResponse.ok && emailResponse.status === 500) {
            console.log("Email service unavailable (500 error) - non-critical");
          } else {
            console.log("Email service not configured or failed:", emailResult.message);
          }
        } catch (emailError) {
          console.log("Email sending failed (non-critical):", emailError);
        }
      }
      
      toast.success("Conta criada com sucesso!", {
        description: mode === 'create' 
          ? "Guarde seu token da loja com segurança!" 
          : `Você agora faz parte da loja: ${tokenShopInfo?.name}`
      });
    } catch (err: any) {
      console.error("Sign up error:", err);
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      let errorTitle = "Erro ao criar conta";
      
      if (err.message?.includes("already registered") || err.message?.includes("A user with this email address has already been registered")) {
        errorTitle = "E-mail já cadastrado";
        errorMessage = mode === 'join' 
          ? "Você já possui uma conta. Faça login ou use outro e-mail." 
          : "Este e-mail já está cadastrado. Faça login ou use a opção 'Juntar-se a Loja Existente'.";
      } else if (err.message?.includes("já está sendo usado")) {
        errorTitle = "Nome da loja indisponível";
        errorMessage = "Este nome de loja já está sendo usado. Escolha outro nome.";
      } else if (err.message?.includes("Token inválido")) {
        errorTitle = "Token inválido";
        errorMessage = "O token fornecido não é válido. Verifique e tente novamente.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorTitle, {
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
              Criar nova conta
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
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Tabs for Create or Join Store */}
            <div className="pt-4 border-t">
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'create' | 'join')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Criar Loja
                  </TabsTrigger>
                  <TabsTrigger value="join" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Juntar-se
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4 mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      💡 Criando uma nova loja, você receberá um token único que permitirá outros usuários se juntarem à sua equipe.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nome do Estabelecimento *</Label>
                    <div className="relative">
                      <Input
                        id="storeName"
                        type="text"
                        placeholder="Ex: Eletrodel Eletrônica"
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value);
                          setStoreNameAvailable(null);
                        }}
                        onBlur={(e) => checkStoreName(e.target.value)}
                        required
                        disabled={loading}
                        className={
                          storeName && storeNameAvailable !== null
                            ? storeNameAvailable
                              ? "border-green-500 pr-10"
                              : "border-red-500 pr-10"
                            : ""
                        }
                      />
                      {checkingStoreName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
                      )}
                      {!checkingStoreName && storeName && storeNameAvailable !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {storeNameAvailable ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {storeName && storeNameAvailable === false && (
                      <p className="text-xs text-red-500">Este nome já está sendo usado por outra loja</p>
                    )}
                    {storeName && storeNameAvailable === true && (
                      <p className="text-xs text-green-600">✓ Nome disponível</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeAddress" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Endereço Completo *
                    </Label>
                    <Input
                      id="storeAddress"
                      type="text"
                      placeholder="Rua, número, bairro, cidade - UF"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storePhone" className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telefone/WhatsApp *
                    </Label>
                    <Input
                      id="storePhone"
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="join" className="space-y-4 mt-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      🔑 Para se juntar a uma loja existente, você precisa do token fornecido pelo proprietário da loja.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="existingToken" className="flex items-center gap-1">
                      <Key className="w-3 h-3" />
                      Token da Loja *
                    </Label>
                    <div className="relative">
                      <Input
                        id="existingToken"
                        type="text"
                        placeholder="Cole o token aqui"
                        value={existingToken}
                        onChange={(e) => {
                          setExistingToken(e.target.value);
                          setTokenValid(null);
                          setTokenShopInfo(null);
                        }}
                        onBlur={(e) => validateToken(e.target.value)}
                        required
                        disabled={loading}
                        className={
                          existingToken && tokenValid !== null
                            ? tokenValid
                              ? "border-green-500 pr-10"
                              : "border-red-500 pr-10"
                            : ""
                        }
                      />
                      {validatingToken && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
                      )}
                      {!validatingToken && existingToken && tokenValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {tokenValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {existingToken && tokenValid === false && (
                      <p className="text-xs text-red-500">Token inválido ou loja não encontrada</p>
                    )}
                    {existingToken && tokenValid === true && tokenShopInfo && (
                      <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                        <p className="text-xs text-green-800">
                          ✓ Você irá se juntar à loja: <strong>{tokenShopInfo.name}</strong>
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {tokenShopInfo.address}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-4 text-[#8b7355]">
                Dados de Acesso
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  required
                  disabled={loading}
                  className={
                    email && touched.email
                      ? emailValid
                        ? "border-green-500 pr-10"
                        : "border-red-500 pr-10"
                      : ""
                  }
                />
                {email && touched.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {email && touched.email && !emailValid && (
                <p className="text-xs text-red-500">Digite um e-mail válido</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  required
                  disabled={loading}
                  minLength={6}
                  className={
                    password && touched.password
                      ? passwordValid
                        ? "border-green-500 pr-10"
                        : "border-red-500 pr-10"
                      : ""
                  }
                />
                {password && touched.password && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {password && touched.password && !passwordValid && (
                <p className="text-xs text-red-500">Mínimo de 6 caracteres</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  required
                  disabled={loading}
                  className={
                    confirmPassword && touched.confirmPassword
                      ? passwordsMatch
                        ? "border-green-500 pr-10"
                        : "border-red-500 pr-10"
                      : ""
                  }
                />
                {confirmPassword && touched.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {confirmPassword && touched.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">As senhas não coincidem</p>
              )}
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
                  Criando conta...
                </>
              ) : (
                mode === 'create' ? 'Criar Loja e Conta' : 'Juntar-se e Criar Conta'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Já tem uma conta? </span>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#8b7355] hover:underline font-medium"
                disabled={loading}
              >
                Fazer login
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Modal de exibição do token da loja */}
      <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#8b7355]" />
              Token da Loja Gerado!
            </DialogTitle>
            <DialogDescription>
              Este é o token único e imutável da sua loja. Guarde-o com segurança!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                📧 Enviamos este token para <strong>{email}</strong>. Verifique sua caixa de entrada!
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 mb-3">
                ⚠️ <strong>IMPORTANTE:</strong> Você precisará deste token para fazer login. Outros membros da equipe também precisarão dele para se juntar à sua loja!
              </p>
              <div className="bg-white border border-gray-300 rounded p-3 font-mono text-sm break-all">
                {shopToken}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shopToken);
                  toast.success("Token copiado!");
                }}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Token
              </Button>
              <Button
                onClick={() => {
                  setShowTokenModal(false);
                  // Don't switch to login - user is already logged in automatically
                  // The App will handle showing the token modal
                }}
                className="flex-1 bg-[#8b7355] hover:bg-[#7a6345]"
              >
                Começar a Usar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
