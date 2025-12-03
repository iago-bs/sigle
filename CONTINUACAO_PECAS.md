# Continuação da Implementação do Sistema de Peças

## ✅ O QUE JÁ FOI FEITO:

1. **Menu renomeado**: "Peças" → "Estoque" ✓
2. **Título atualizado**: "GERENCIAMENTO DE ESTOQUE DE PEÇAS" ✓  
3. **Tipos criados**: `Piece` interface em types/index.ts ✓
4. **Hook criado**: `src/hooks/usePieces.ts` (fetchPieces, createPiece, updatePiece, deletePiece) ✓
5. **Modal criado**: `src/components/AddPieceModal.tsx` ✓
6. **Página criada**: `src/components/PiecesPage.tsx` ✓
7. **Menu adicionado**: Botão "PEÇAS" no RightSidebar (entre Equipamentos e Estoque) ✓
8. **AddStockPartModal reformulado**: Busca de peças + botão + ✓
9. **Tipos atualizados**: `StockPart` (price, pieceId) e `PageType` ("pieces") ✓

---

## ⚠️ O QUE PRECISA SER FEITO:

### 1. COMPLETAR INTEGRAÇÃO NO App.tsx

**Adicionar imports (após linha 33):**
```typescript
import { AddPieceModal } from "./components/AddPieceModal";
import { PiecesPage } from "./components/PiecesPage";
```

**Adicionar hook (após linha 106):**
```typescript
const { pieces, createPiece, updatePiece, deletePiece, fetchPieces } = usePieces();
```

**Adicionar estados (após linha 134):**
```typescript
const [isPieceModalOpen, setIsPieceModalOpen] = useState(false);
const [isEditPieceModalOpen, setIsEditPieceModalOpen] = useState(false);
const [editingPiece, setEditingPiece] = useState<Piece | null>(null);
const [selectedPieceFromAdd, setSelectedPieceFromAdd] = useState<Piece | null>(null);
```

**Adicionar handler (após handleAddEquipment):**
```typescript
const handleAddPiece = async (pieceData: Omit<Piece, "id" | "createdAt">) => {
  try {
    await createPiece(pieceData);
    toast.success("Peça cadastrada com sucesso!");
  } catch (error) {
    console.error('Erro ao cadastrar peça:', error);
    toast.error(error instanceof Error ? error.message : "Erro ao cadastrar peça");
  }
};
```

**Atualizar MainLayout (adicionar prop onNavigateToPieces):**
Procure onde está `<MainLayout` e adicione:
```typescript
onNavigateToPieces={() => setCurrentPage("pieces")}
```

**Atualizar RightSidebar (adicionar prop onNavigateToPieces):**
Procure onde está `<RightSidebar` e adicione:
```typescript
onNavigateToPieces={() => setCurrentPage("pieces")}
```

**Adicionar roteamento (após currentPage === "equipments"):**
```typescript
) : currentPage === "pieces" ? (
  <PiecesPage
    onBack={() => setCurrentPage("main")}
    pieces={pieces}
    onAddPiece={() => setIsPieceModalOpen(true)}
    onEditPiece={(piece) => {
      setEditingPiece(piece);
      setIsEditPieceModalOpen(true);
    }}
    onDeletePiece={async (pieceId: string) => {
      await deletePiece(pieceId);
      toast.success("Peça excluída com sucesso!");
    }}
  />
```

**Atualizar AddStockPartModal (linha 934):**
```typescript
        <AddStockPartModal
          isOpen={isStockPartModalOpen}
          onClose={() => {
            setIsStockPartModalOpen(false);
            setSelectedPieceFromAdd(null);
          }}
          onAdd={handleAddStockPart}
          pieces={pieces}
          onOpenAddPieceModal={() => {
            setIsStockPartModalOpen(false);
            setIsPieceModalOpen(true);
          }}
          selectedPieceFromAdd={selectedPieceFromAdd}
        />
```

**Adicionar modais de peça (após AddEquipmentModal):**
```typescript
        <AddPieceModal
          isOpen={isPieceModalOpen}
          onClose={() => setIsPieceModalOpen(false)}
          onAdd={async (pieceData) => {
            const newPiece = await createPiece(pieceData);
            // Se veio do estoque, seleciona a peça criada e reabre o modal de estoque
            if (!isStockPartModalOpen) {
              setSelectedPieceFromAdd(newPiece);
              setIsPieceModalOpen(false);
              setIsStockPartModalOpen(true);
            }
          }}
        />
```

---

### 2. CRIAR ROTAS BACKEND

**Arquivo**: `src/supabase/functions/server/index.tsx`

**Adicionar após a rota de equipamentos (linha ~1200):**

```typescript
// ============================================
// PIECES ENDPOINTS
// ============================================

// Get pieces
app.get("/make-server-9bef0ec0/pieces", async (c) => {
  try {
    const shopToken = c.req.query('shopToken');

    if (!shopToken) {
      return c.json({ error: "Token da loja é obrigatório" }, 400);
    }

    const supabase = db.getSupabaseClient();
    
    const { data: pieces, error } = await supabase
      .from('pieces_manual')
      .select('*')
      .eq('shop_token', shopToken)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pieces:', error);
      return c.json({ error: "Erro ao buscar peças" }, 500);
    }

    return c.json({ pieces: pieces || [] });

  } catch (error) {
    console.error(`Fetch pieces error: ${error}`);
    return c.json({ error: "Erro ao buscar peças" }, 500);
  }
});

// Create piece
app.post("/make-server-9bef0ec0/pieces", async (c) => {
  try {
    const data = await c.req.json();
    const { shopToken, name, partType, serialNumber, notes } = data;

    if (!shopToken || !name || !partType) {
      return c.json({ error: "shopToken, name e partType são obrigatórios" }, 400);
    }

    const supabase = db.getSupabaseClient();

    const { data: piece, error } = await supabase
      .from('pieces_manual')
      .insert({
        shop_token: shopToken,
        name,
        part_type: partType,
        serial_number: serialNumber || null,
        notes: notes || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating piece:', error);
      return c.json({ error: "Erro ao criar peça" }, 500);
    }

    return c.json({ success: true, piece });

  } catch (error) {
    console.error(`Create piece error: ${error}`);
    return c.json({ error: "Erro ao criar peça" }, 500);
  }
});

// Update piece
app.put("/make-server-9bef0ec0/pieces/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    if (!id) {
      return c.json({ error: "Piece ID is required" }, 400);
    }

    const { name, partType, serialNumber, notes } = data;

    if (!name || !partType) {
      return c.json({ error: "Name and partType are required" }, 400);
    }

    const supabase = db.getSupabaseClient();
    
    const { data: piece, error: fetchError } = await supabase
      .from('pieces_manual')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !piece) {
      return c.json({ error: "Piece not found" }, 404);
    }

    const { data: updatedPiece, error: updateError } = await supabase
      .from('pieces_manual')
      .update({
        name,
        part_type: partType,
        serial_number: serialNumber || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating piece:', updateError);
      return c.json({ error: "Error updating piece" }, 500);
    }

    return c.json({ success: true, piece: updatedPiece });

  } catch (error) {
    console.error(`Update piece error: ${error}`);
    return c.json({ error: "Error updating piece" }, 500);
  }
});

// Delete piece
app.delete("/make-server-9bef0ec0/pieces/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    if (!id) {
      return c.json({ error: "Piece ID is required" }, 400);
    }

    const supabase = db.getSupabaseClient();
    
    const { data: piece, error: fetchError } = await supabase
      .from('pieces_manual')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !piece) {
      return c.json({ error: "Piece not found" }, 404);
    }

    // Check if piece is used in stock
    const { data: stockUsage, error: stockError } = await supabase
      .from('stock_parts')
      .select('id')
      .eq('piece_id', id)
      .limit(1);

    if (stockError) {
      console.error('Error checking stock usage:', stockError);
      return c.json({ error: "Error checking stock usage" }, 500);
    }

    if (stockUsage && stockUsage.length > 0) {
      return c.json({ 
        error: "Cannot delete piece that is in stock" 
      }, 400);
    }

    const { error: deleteError } = await supabase
      .from('pieces_manual')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting piece:', deleteError);
      return c.json({ error: "Error deleting piece" }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.error(`Delete piece error: ${error}`);
    return c.json({ error: "Error deleting piece" }, 500);
  }
});
```

---

### 3. CRIAR TABELA NO SUPABASE

Execute no SQL Editor do Supabase:

```sql
-- Criar tabela de peças cadastradas
CREATE TABLE IF NOT EXISTS pieces_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token TEXT NOT NULL,
  name TEXT NOT NULL,
  part_type TEXT NOT NULL,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pieces_shop_token ON pieces_manual(shop_token);
CREATE INDEX IF NOT EXISTS idx_pieces_name ON pieces_manual(name);
CREATE INDEX IF NOT EXISTS idx_pieces_serial ON pieces_manual(serial_number);

-- Adicionar coluna piece_id em stock_parts (referência)
ALTER TABLE stock_parts 
ADD COLUMN IF NOT EXISTS piece_id UUID REFERENCES pieces_manual(id);

-- Adicionar coluna price em stock_parts
ALTER TABLE stock_parts 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
```

---

### 4. REGENERAR O BUNDLE

Depois de adicionar as rotas backend:

```powershell
.\generate-bundle.ps1
```

Depois fazer deploy no Supabase Dashboard.

---

### 5. TESTAR O FLUXO COMPLETO

1. Acessar menu "PEÇAS" → Cadastrar uma peça
2. Acessar menu "ESTOQUE" → Adicionar ao Estoque
3. Buscar a peça cadastrada no campo "Peça"
4. Ou clicar no botão "+" para cadastrar nova peça inline
5. Verificar que após cadastrar inline, a peça é selecionada automaticamente

---

## RESUMO DA ARQUITETURA:

```
PEÇAS (Menu)
└─> PiecesPage
    ├─> Lista de peças cadastradas
    ├─> Detalhes da peça
    ├─> Editar peça
    └─> Deletar peça

ESTOQUE (Menu)
└─> PartsPage (renomeado de "Peças")
    └─> AddStockPartModal
        ├─> Campo de busca de peças
        ├─> Botão + para cadastrar nova peça
        ├─> Quantidade
        ├─> Preço
        └─> Data de entrada
```

**Fluxo:**
1. Usuário cadastra peça no menu "PEÇAS"
2. Ao adicionar ao estoque, busca a peça cadastrada
3. Ou clica no "+" para cadastrar direto do modal de estoque
4. Peça cadastrada inline é selecionada automaticamente no campo

---

Feito por: GitHub Copilot
Data: 3 de dezembro de 2025
