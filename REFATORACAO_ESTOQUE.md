# 📋 REFATORAÇÃO DO SISTEMA DE ESTOQUE - IMPLEMENTAÇÃO

## 🎯 RESUMO DAS MUDANÇAS

Transformar o sistema de estoque de **cadastro simples** para **sistema com histórico e agregação**:

### Conceito
- **Página ESTOQUE**: Mostra cada peça UMA VEZ com:
  - Quantidade = SOMA de todos os cadastros dessa peça no histórico
  - Preço = Preço do ÚLTIMO cadastro dessa peça
  - Data = Data do ÚLTIMO cadastro dessa peça
  
- **Página HISTÓRICO**: Mostra TODOS os cadastros (incluindo ajustes positivos/negativos)

### Operações
- **Editar Quantidade**: Gera novo registro no histórico (positivo ou negativo) para ajustar
- **Editar Preço/Data**: Gera novo registro no histórico com mesma quantidade zero mas atualiza preço/data
- **Excluir**: Gera registro negativo no histórico para zerar

---

## 📊 ESTRUTURA ATUAL vs NOVA

### ATUAL
```typescript
interface StockPart {
  id: string;
  name: string;
  quantity: number;  // Quantidade única
  price?: number;
  addedAt: string;
  pieceId?: string;
}
```

### NOVA (Não muda a interface, mas muda o comportamento)
```typescript
interface StockPart {
  id: string;
  name: string;
  quantity: number;  // PODE SER NEGATIVA agora!
  price?: number;
  addedAt: string;
  pieceId?: string;
  isAdjustment?: boolean;  // NOVO: indica se é ajuste manual
  adjustmentReason?: string;  // NOVO: "edit" | "delete"
}
```

---

## 🔨 IMPLEMENTAÇÃO PASSO A PASSO

### FASE 1: Preparar Backend (Alta Prioridade)

#### 1.1. Alterar Tabela `parts` no Banco de Dados
```sql
-- Permitir quantidades negativas (remover constraint se existir)
ALTER TABLE parts DROP CONSTRAINT IF EXISTS parts_quantity_check;

-- Adicionar campos para controle de histórico
ALTER TABLE parts ADD COLUMN IF NOT EXISTS is_adjustment BOOLEAN DEFAULT FALSE;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS adjustment_reason TEXT;

-- Criar índice para consultas de agregação
CREATE INDEX IF NOT EXISTS idx_parts_piece_id_date 
  ON parts(piece_id, created_at DESC);
```

#### 1.2. Atualizar Hook `useParts.ts`
Adicionar função para buscar dados agregados:

```typescript
// Nova função: buscar estoque agregado (para página principal)
const fetchAggregatedStock = useCallback(async (): Promise<AggregatedStockPart[]> => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/parts/aggregated?shopToken=${shopToken}`,
    { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
  );
  
  if (!response.ok) throw new Error('Erro ao buscar estoque agregado');
  
  const data = await response.json();
  return data.aggregated || [];
}, [shopToken]);

// Nova função: criar ajuste de quantidade
const createQuantityAdjustment = useCallback(async (
  pieceId: string,
  quantityChange: number,
  price: number,
  date: string
): Promise<void> => {
  await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/parts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        shopToken,
        pieceId,
        quantity: quantityChange,  // Pode ser negativo!
        price,
        entryDate: date,
        isAdjustment: true,
        adjustmentReason: quantityChange < 0 ? 'decrease' : 'increase'
      }),
    }
  );
}, [shopToken]);
```

#### 1.3. Criar Rota Backend para Agregação
Em `src/supabase/functions/server/index.tsx`:

```typescript
// GET /parts/aggregated - Retorna estoque agregado
app.get("/make-server-9bef0ec0/parts/aggregated", async (c) => {
  try {
    const shopToken = c.req.query('shopToken');
    if (!shopToken) return c.json({ error: "Token obrigatório" }, 400);

    const supabase = db.getSupabaseClient();
    
    // Buscar todos os registros agrupados por piece_id
    const { data: parts, error } = await supabase
      .from('parts')
      .select('*')
      .eq('shop_token', shopToken)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Agrupar por piece_id e calcular totais
    const aggregated: Record<string, any> = {};
    
    parts.forEach((part: any) => {
      if (!part.piece_id) return;
      
      if (!aggregated[part.piece_id]) {
        aggregated[part.piece_id] = {
          pieceId: part.piece_id,
          name: part.name,
          totalQuantity: 0,
          lastPrice: null,
          lastEntryDate: null,
          entries: []
        };
      }
      
      aggregated[part.piece_id].totalQuantity += part.quantity || 0;
      
      // Último cadastro (já está ordenado por data DESC)
      if (!aggregated[part.piece_id].lastPrice) {
        aggregated[part.piece_id].lastPrice = part.price;
        aggregated[part.piece_id].lastEntryDate = part.created_at;
      }
      
      aggregated[part.piece_id].entries.push(part);
    });

    return c.json({ aggregated: Object.values(aggregated) });
  } catch (error) {
    return c.json({ error: "Erro ao buscar estoque agregado" }, 500);
  }
});
```

---

### FASE 2: Criar Componentes de Interface

#### 2.1. Criar `StockHistoryPage.tsx`
Página que mostra TODOS os registros (histórico completo):

```typescript
// Similar ao PartsPage atual, mas mostra TUDO
// Incluindo registros com quantidade negativa
// Badge verde para positivo, vermelho para negativo
```

#### 2.2. Refatorar `PartsPage.tsx`
Transformar em página de ESTOQUE AGREGADO:

```typescript
// Ao invés de mostrar parts[], mostra aggregatedStock[]
// Cada card representa UMA peça com:
// - Quantidade total (soma)
// - Preço do último cadastro
// - Data da última entrada
```

#### 2.3. Adicionar Navegação entre Estoque e Histórico
No `PartsPage.tsx`, adicionar botão:

```typescript
<button onClick={() => setShowHistory(true)}>
  Ver Histórico Completo
</button>
```

---

### FASE 3: Implementar Lógica de Edição/Exclusão

#### 3.1. Editar Quantidade no Card Agregado
```typescript
const handleEditQuantity = async (pieceId: string, newQuantity: number) => {
  const currentQuantity = aggregatedStock.find(s => s.pieceId === pieceId).totalQuantity;
  const difference = newQuantity - currentQuantity;
  
  if (difference !== 0) {
    await createQuantityAdjustment(pieceId, difference, lastPrice, new Date());
    toast.success(`Quantidade ${difference > 0 ? 'aumentada' : 'diminuída'}`);
  }
};
```

#### 3.2. Excluir Card Agregado
```typescript
const handleDelete = async (pieceId: string, currentQuantity: number) => {
  // Gera registro negativo para zerar
  await createQuantityAdjustment(pieceId, -currentQuantity, 0, new Date());
  toast.success("Peça removida do estoque");
};
```

---

## 🎨 MOCKUP DA INTERFACE

### Página ESTOQUE (Agregada)
```
┌─────────────────────────────────────────────────┐
│ GERENCIAMENTO DE ESTOQUE DE PEÇAS               │
│ [+ Adicionar] [📋 Ver Histórico]                │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────┐  ┌──────────────────┐    │
│  │ Placa Mãe XYZ    │  │ Tela LCD ABC     │    │
│  │ Qtd: 15 unid     │  │ Qtd: 8 unid      │    │
│  │ R$ 250,00        │  │ R$ 180,00        │    │
│  │ 02/12/2025       │  │ 01/12/2025       │    │
│  │ [✏️ Editar] [🗑️]   │  │ [✏️ Editar] [🗑️]   │    │
│  └──────────────────┘  └──────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Página HISTÓRICO
```
┌─────────────────────────────────────────────────┐
│ HISTÓRICO DE MOVIMENTAÇÕES                      │
│ [← Voltar para Estoque]                         │
├─────────────────────────────────────────────────┤
│                                                  │
│  📦 Placa Mãe XYZ - Qtd: +10 - R$ 250,00       │
│     02/12/2025 10:30                            │
│                                                  │
│  📦 Placa Mãe XYZ - Qtd: +5 - R$ 245,00        │
│     01/12/2025 14:20                            │
│                                                  │
│  📦 Placa Mãe XYZ - Qtd: -2 - Ajuste           │
│     30/11/2025 09:15 [Edição de quantidade]    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## ⚠️ ATENÇÃO - MIGRAÇÃO DE DADOS

### Se já existem dados no sistema:
1. Todos os cadastros existentes são mantidos (quantidade positiva)
2. Novos ajustes serão adicionados como registros separados
3. A agregação funciona retroativamente

### Não é necessário:
- Deletar dados existentes
- Reprocessar histórico
- Apenas adicionar novas colunas e índices

---

## 📝 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. ✅ **Trocar ícones** (JÁ FEITO)
2. ✅ **Criar EditPieceModal** (JÁ FEITO)
3. ⏳ **Executar SQL** para adicionar colunas no banco
4. ⏳ **Criar rota `/parts/aggregated`** no backend
5. ⏳ **Atualizar `useParts.ts`** com novas funções
6. ⏳ **Criar `StockHistoryPage.tsx`**
7. ⏳ **Refatorar `PartsPage.tsx`** para mostrar agregação
8. ⏳ **Implementar edição com histórico**
9. ⏳ **Implementar exclusão com histórico**
10. ⏳ **Gerar bundle e deploy**
11. ⏳ **Testar fluxo completo**

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

**Você precisa decidir:**
1. Continuar com essa implementação complexa?
2. Simplificar e fazer apenas parte das mudanças?
3. Implementar em fases (primeiro histórico, depois agregação)?

**Me avise como quer proceder e eu continuo a implementação!** 🚀
