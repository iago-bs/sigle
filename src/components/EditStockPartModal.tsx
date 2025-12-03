import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import type { StockPart, Piece } from "../types";

interface EditStockPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (pieceId: string, newQuantity: number, newPrice: number, newDate: string) => void;
  onUpdateIndividual?: (stockPart: StockPart) => void; // Para editar registro individual
  stockPart: StockPart | null;
  currentTotalQuantity: number; // Quantidade agregada atual
  isIndividualEdit?: boolean; // Modo de edição: individual ou agregado
  pieces: Piece[]; // Lista de peças para buscar nome atualizado
}

export function EditStockPartModal({ 
  isOpen, 
  onClose, 
  onUpdate, 
  onUpdateIndividual,
  stockPart, 
  currentTotalQuantity,
  isIndividualEdit = false,
  pieces
}: EditStockPartModalProps) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [entryDate, setEntryDate] = useState("");

  // Buscar nome atualizado da peça
  const pieceName = useMemo(() => {
    const pieceId = stockPart?.piece_id || stockPart?.pieceId;
    if (!pieceId) return stockPart?.name || "";
    const piece = pieces.find(p => p.id === pieceId);
    return piece?.name || stockPart.name;
  }, [stockPart, pieces]);

  // Populate form when stockPart changes
  useEffect(() => {
    if (stockPart) {
      // Se for edição individual, usar a quantidade do registro específico
      setQuantity(isIndividualEdit ? (stockPart.quantity?.toString() || "0") : currentTotalQuantity.toString());
      setPrice(stockPart.price?.toString() || "");
      // Se for edição individual, usar a data do registro
      const addedAt = stockPart.added_at || stockPart.addedAt;
      const dateToUse = isIndividualEdit && addedAt 
        ? new Date(addedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setEntryDate(dateToUse);
    }
  }, [stockPart, currentTotalQuantity, isIndividualEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stockPart) return;
    
    const newQuantity = parseInt(quantity) || 0;
    const newPrice = parseFloat(price) || 0;

    if (!entryDate) {
      alert("Por favor, selecione uma data");
      return;
    }

    // Se for edição individual, chama o handler específico
    if (isIndividualEdit && onUpdateIndividual) {
      const updatedStockPart: StockPart = {
        ...stockPart,
        quantity: newQuantity,
        price: newPrice,
        added_at: `${entryDate}T12:00:00.000Z`,
        addedAt: `${entryDate}T12:00:00.000Z`, // Mantém compatibilidade
      };
      onUpdateIndividual(updatedStockPart);
    } else {
      // Edição agregada (cria ajuste)
      const pieceId = stockPart.piece_id || stockPart.pieceId;
      if (!pieceId) return;
      if (newQuantity < 0) {
        alert("A quantidade total não pode ser negativa");
        return;
      }
      onUpdate(pieceId, newQuantity, newPrice, entryDate);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setQuantity("");
    setPrice("");
    setEntryDate("");
    onClose();
  };

  if (!isOpen || !stockPart) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {isIndividualEdit ? "Editar Movimentação" : "Editar Estoque"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{pieceName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isIndividualEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">ℹ️ Como funciona a edição:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Altere a <strong>quantidade</strong> para ajustar o estoque</li>
                <li>O sistema gerará automaticamente um registro de ajuste</li>
                <li>Você pode ver todo o histórico na aba "Movimentações"</li>
              </ul>
            </div>
          )}

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isIndividualEdit ? "Quantidade da Movimentação" : "Quantidade Total"} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
            {!isIndividualEdit && (
              <p className="text-xs text-gray-500 mt-1">
                Quantidade atual: <strong>{currentTotalQuantity}</strong>
              </p>
            )}
          </div>

          {/* Preço */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Preço Unitário <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Data de Referência <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta será a data do ajuste no histórico
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#8b7355] text-white rounded-lg hover:bg-[#7a6345] transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
