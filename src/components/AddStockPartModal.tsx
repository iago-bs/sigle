import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import type { StockPart, Piece } from "../types";

interface AddStockPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stockPart: StockPart) => void;
  pieces: Piece[];
  onOpenAddPieceModal: () => void;
  selectedPieceFromAdd?: Piece | null;
}

export function AddStockPartModal({ isOpen, onClose, onAdd, pieces, onOpenAddPieceModal, selectedPieceFromAdd }: AddStockPartModalProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  // Quando uma peça é selecionada após ser cadastrada
  React.useEffect(() => {
    if (selectedPieceFromAdd) {
      setSelectedPiece(selectedPieceFromAdd);
      setSearchQuery(selectedPieceFromAdd.name);
    }
  }, [selectedPieceFromAdd]);

  // Filtrar peças baseado na busca
  const filteredPieces = pieces.filter((piece) => {
    const query = searchQuery.toLowerCase();
    return (
      piece.name.toLowerCase().includes(query) ||
      piece.serialNumber?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!selectedPiece) {
      alert("Por favor, selecione uma peça");
      return;
    }

    const newStockPart: StockPart = {
      id: crypto.randomUUID(),
      name: selectedPiece.name,
      description: `${selectedPiece.partType}${selectedPiece.serialNumber ? ` - S/N: ${selectedPiece.serialNumber}` : ''}`,
      compatibleModels: [],
      quantity: parseInt(quantity) || 1,
      price: parseFloat(price) || undefined,
      addedAt: entryDate ? `${entryDate}T12:00:00.000Z` : new Date().toISOString(),
      pieceId: selectedPiece.id,
    };

    onAdd(newStockPart);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPiece(null);
    setSearchQuery("");
    setQuantity("1");
    setPrice("");
    setEntryDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl">Adicionar Peça ao Estoque</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Campo Peça com Busca e Botão + */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Peça <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedPiece(null);
                    }}
                    placeholder="Buscar por nome ou número de série..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
                    required={!selectedPiece}
                  />
                  {/* Dropdown de resultados */}
                  {searchQuery && !selectedPiece && filteredPieces.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredPieces.map((piece) => (
                        <button
                          key={piece.id}
                          type="button"
                          onClick={() => {
                            setSelectedPiece(piece);
                            setSearchQuery(piece.name);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{piece.name}</div>
                          <div className="text-xs text-gray-500">
                            {piece.partType}{piece.serialNumber ? ` • S/N: ${piece.serialNumber}` : ''}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Peça selecionada - agora no fluxo normal */}
                {selectedPiece && (
                  <div className="mt-2 bg-green-50 border border-green-300 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-900">{selectedPiece.name}</div>
                        <div className="text-xs text-green-700">
                          {selectedPiece.partType}{selectedPiece.serialNumber ? ` • S/N: ${selectedPiece.serialNumber}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPiece(null);
                          setSearchQuery("");
                        }}
                        className="text-green-700 hover:text-green-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                {searchQuery && !selectedPiece && filteredPieces.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Nenhuma peça encontrada. Clique no botão "+" para cadastrar.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onOpenAddPieceModal}
                className="px-3 py-2 bg-[#8b7355] text-white rounded-lg hover:bg-[#7a6345] transition-colors flex items-center gap-1 self-start"
                title="Cadastrar nova peça"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantidade <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
          </div>

          {/* Preço */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Preço
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
            />
          </div>

          {/* Data de Entrada */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Data de Entrada <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
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
              Adicionar ao Estoque
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
