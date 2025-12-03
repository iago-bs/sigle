# 🚀 Deploy da Atualização - Função DELETE de Equipamentos

## ⚠️ Problema Atual
A rota DELETE para equipamentos retorna 404 porque a Edge Function não foi atualizada no Supabase.

## ✅ Solução: Atualizar Edge Function

### Opção 1: Via Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/rwgdfveokzemavstpvyv/functions
   ```

2. **Localize a função `make-server-9bef0ec0`**

3. **Clique em "Edit" (Editar)**

4. **Substitua TODO o código** pelo conteúdo do arquivo:
   ```
   edge-function-bundle.ts
   ```
   
   📋 **Dica:** Abra o arquivo `edge-function-bundle.ts` na raiz do projeto, selecione tudo (Ctrl+A), copie (Ctrl+C) e cole no editor do Supabase.

5. **Clique em "Deploy"**

6. **Aguarde** o deploy finalizar (geralmente 10-30 segundos)

7. **Teste** tentando excluir um equipamento novamente

---

### Opção 2: Teste Rápido da Rota

Para verificar se a rota está funcionando após o deploy, execute no PowerShell:

```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z2RmdmVva3plbWF2c3Rwdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzA3MTksImV4cCI6MjA3ODA0NjcxOX0.JaZjZkWEzkp5k-eiuPX-_MQ-mTXAALSNoxv2WjHZdRk"
}

# Teste de health check (deve retornar 200)
Invoke-RestMethod -Uri "https://rwgdfveokzemavstpvyv.supabase.co/functions/v1/make-server-9bef0ec0/health" -Headers $headers -Method GET
```

Se retornar `{ status: "ok" }`, a função está no ar!

---

## 📝 O que foi adicionado

A nova rota DELETE foi adicionada no arquivo `edge-function-bundle.ts`:

```typescript
// Delete equipment
app.delete("/make-server-9bef0ec0/equipments/:id", async (c) => {
  // ... validações e exclusão segura
});
```

**Funcionalidades:**
- ✅ Verifica se equipamento existe
- ✅ Valida se há ordens de serviço associadas
- ✅ Bloqueia exclusão se houver histórico
- ✅ Retorna erro 400 com mensagem se não puder excluir
- ✅ Exclui com sucesso se passar nas validações

---

## 🔍 Troubleshooting

### Se continuar dando 404:
1. Verifique se fez o deploy correto
2. Aguarde 30 segundos após o deploy
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Tente novamente

### Se der erro 500:
- Verifique os logs da Edge Function no Supabase Dashboard
- Vá em: Functions → make-server-9bef0ec0 → Logs

### Se der erro 400:
- O equipamento tem ordens de serviço associadas
- Isso é esperado e correto (proteção de dados)

---

## ✨ Após o Deploy

Teste a exclusão:
1. Vá em Equipamentos
2. Selecione um equipamento SEM histórico de O.S.
3. Clique em "Excluir"
4. Confirme
5. Deve excluir com sucesso! 🎉
