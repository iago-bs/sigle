import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Piece } from "../types";

interface EditPieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  piece: Piece | null;
  onUpdate: (piece: Piece) => Promise<void>;
}

export function EditPieceModal({ isOpen, onClose, piece, onUpdate }: EditPieceModalProps) {
  const [name, setName] = useState("");
  const [partType, setPartType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Preencher formulário quando peça mudar
  useEffect(() => {
    if (piece) {
      setName(piece.name);
      setPartType(piece.partType);
      setSerialNumber(piece.serialNumber || "");
      setNotes(piece.notes || "");
    }
  }, [piece]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!piece) return;

    // Validation
    if (!name.trim()) {
      toast.error("Por favor, preencha o nome da peça");
      return;
    }

    if (!partType.trim()) {
      toast.error("Por favor, digite o tipo da peça");
      return;
    }

    try {
      const updatedPiece: Piece = {
        ...piece,
        name: name.trim(),
        partType: partType.trim(),
        serialNumber: serialNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await onUpdate(updatedPiece);
      
      // Reset form
      setName("");
      setPartType("");
      setSerialNumber("");
      setNotes("");
      
      onClose();
    } catch (error) {
      console.error("Error updating piece:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar peça");
    }
  };

  const handleClose = () => {
    setName("");
    setPartType("");
    setSerialNumber("");
    setNotes("");
    onClose();
  };

  if (!isOpen || !piece) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl">Editar Peça</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome da Peça <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Placa Mãe, Tela LCD, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partType}
              onChange={(e) => setPartType(e.target.value)}
              placeholder="Ex: Placa Principal, Fonte, Inversor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
          </div>

          {/* Número de Série */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Número de Série
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Ex: SN123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre a peça..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355] resize-none"
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
