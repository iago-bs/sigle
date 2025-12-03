# IMPLEMENTAÇÃO: Sistema de Ativo/Inativo e Validações

## PASSOS PARA IMPLEMENTAÇÃO

### 1. **EXECUTAR SQL DE MIGRAÇÃO**
- Arquivo: `MIGRATION_ACTIVE_FIELD.sql`
- Ação: Executar no Supabase SQL Editor
- Adiciona campo `active` em: equipments_manual, pieces_manual, clients

### 2. **BACKEND - Atualizar Edge Functions**

#### 2.1 Equipamentos
- **DELETE /equipments/:id**: 
  - Verificar se existe OS com esse equipamento
  - Se SIM: apenas `UPDATE active = FALSE`
  - Se NÃO: `DELETE` real

- **POST /equipments**:
  - Validar duplicatas: device + brand + model + serialNumber
  - Não permitir se já existe (ativo OU inativo)

- **GET /equipments**:
  - Filtrar apenas `active = TRUE` por padrão
  - Adicionar query param `includeInactive=true` se necessário

#### 2.2 Peças
- **DELETE /pieces/:id**:
  - Verificar se existe movimentação em stock_parts
  - Se SIM: apenas `UPDATE active = FALSE`
  - Se NÃO: `DELETE` real

- **POST /pieces**:
  - Validar duplicatas: name + partType + serialNumber
  - Não permitir se já existe (ativo OU inativo)

- **GET /pieces**:
  - Filtrar apenas `active = TRUE` por padrão

#### 2.3 Clientes
- **DELETE /clients/:id**:
  - Verificar se existe OS com esse cliente
  - Se SIM: apenas `UPDATE active = FALSE`
  - Se NÃO: `DELETE` real

- **POST /clients**:
  - Validar duplicatas por nome (case-insensitive)
  - Não permitir se já existe (ativo OU inativo)

### 3. **FRONTEND - Componentes**

#### 3.1 EquipmentsPage
- ✅ Renomear abas: "Disponíveis" → "Ativos", "Vendidos" → "Inativos"
- Ajustar lógica de tabs para `active = true/false`
- Botão "Excluir" → chama API que decide soft/hard delete
- Equipamentos inativos: sem botão Editar, apenas "Reativar"

#### 3.2 PiecesPage
- Adicionar abas: "Ativos" e "Inativos"
- Botão "Excluir" → chama API que decide soft/hard delete
- Peças inativas: sem botão Editar, apenas "Reativar"

#### 3.3 ClientsPage
- ✅ Já tem sistema de inativos
- Verificar se lógica de exclusão está correta

#### 3.4 Modais de Cadastro
- **AddEquipmentModal**: 
  - Remover uso de variáveis
  - Campos "device", "brand", "model" = texto livre
  - Validar duplicatas antes de salvar

- **AddPieceModal**:
  - Remover uso de variáveis
  - Campo "partType" = texto livre
  - Validar duplicatas antes de salvar

- **AddClientModal**:
  - Validar nome duplicado (case-insensitive)

### 4. **REMOVER SISTEMA DE VARIÁVEIS**

Arquivos a atualizar:
- ❌ Remover página VariablesPage do menu
- ❌ Remover hook useSystemVariables
- ✅ Atualizar todos os selects para inputs de texto

### 5. **ORDEM DE IMPLEMENTAÇÃO**

1. ✅ Criar migration SQL
2. ✅ Atualizar tipos TypeScript
3. ✅ Renomear abas em EquipmentsPage
4. ⏳ Atualizar backend (edge functions)
5. ⏳ Atualizar modais de cadastro
6. ⏳ Implementar abas em PiecesPage
7. ⏳ Atualizar lógica de exclusão
8. ⏳ Implementar botão "Reativar"
9. ⏳ Remover sistema de variáveis

## QUERIES SQL ÚTEIS

```sql
-- Ver equipamentos inativos
SELECT * FROM equipments_manual WHERE active = FALSE;

-- Reativar equipamento
UPDATE equipments_manual SET active = TRUE WHERE id = 'uuid-aqui';

-- Verificar se equipamento tem OS
SELECT COUNT(*) FROM service_orders WHERE equipment_id = 'uuid-aqui';

-- Verificar se peça tem movimentações
SELECT COUNT(*) FROM stock_parts WHERE piece_id = 'uuid-aqui';
```

## VALIDAÇÕES A IMPLEMENTAR

### Equipamento
```typescript
// Verificar duplicata
const existing = await supabase
  .from('equipments_manual')
  .select('id, active')
  .eq('device', device)
  .eq('brand', brand)
  .eq('model', model)
  .eq('serial_number', serialNumber);

if (existing && existing.length > 0) {
  return error("Equipamento já cadastrado");
}
```

### Peça
```typescript
// Verificar duplicata
const existing = await supabase
  .from('pieces_manual')
  .select('id, active')
  .eq('name', name)
  .eq('part_type', partType)
  .eq('serial_number', serialNumber);
```

### Cliente
```typescript
// Verificar duplicata (case-insensitive)
const existing = await supabase
  .from('clients')
  .select('id, active')
  .ilike('name', name); // case-insensitive
```
