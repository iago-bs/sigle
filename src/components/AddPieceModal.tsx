import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Piece } from "../types";
import { useSystemVariables } from "../hooks/useSystemVariables";

interface AddPieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (piece: Omit<Piece, "id" | "createdAt">) => Promise<void>;
}

export function AddPieceModal({ isOpen, onClose, onAdd }: AddPieceModalProps) {
  const { variables, addVariable, refresh } = useSystemVariables();
  const [name, setName] = useState("");
  const [partType, setPartType] = useState("");
  const [customPartType, setCustomPartType] = useState("");
  const [showCustomPartType, setShowCustomPartType] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Carregar variáveis quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Get part types from variables
  const partTypes = variables
    .filter((v) => v.category === "part_types")
    .map((v) => v.value);

  // Filter out duplicate "Outro" entries
  const uniquePartTypes = [...partTypes.filter(pt => pt !== "Outro"), "Outro"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get final part type value (use custom if "Outro" is selected)
    const finalPartType = partType === "Outro" ? customPartType : partType;

    // Validation
    if (!name.trim()) {
      toast.error("Por favor, preencha o nome da peça");
      return;
    }

    if (!finalPartType.trim()) {
      toast.error("Por favor, selecione ou digite o tipo da peça");
      return;
    }

    // Save custom part type to variables if "Outro" was selected
    if (partType === "Outro" && customPartType.trim()) {
      const added = addVariable('part_types', customPartType);
      if (added) {
        toast.success(`Tipo "${customPartType}" adicionado à lista!`);
      }
    }

    try {
      await onAdd({
        name: name.trim(),
        partType: finalPartType.trim(),
        serialNumber: serialNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      handleClose();
      toast.success("Peça cadastrada com sucesso!");
    } catch (error) {
      console.error('Erro ao cadastrar peça:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar peça");
    }
  };

  const handleClose = () => {
    setName("");
    setPartType("");
    setCustomPartType("");
    setShowCustomPartType(false);
    setSerialNumber("");
    setNotes("");
    onClose();
  };

  // Handle part type selection
  const handlePartTypeChange = (value: string) => {
    setPartType(value);
    setShowCustomPartType(value === "Outro");
    if (value !== "Outro") {
      setCustomPartType("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Cadastrar Peça</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome da Peça */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome da Peça <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Placa Principal, Fonte 12V"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
          </div>

          {/* Tipo da Peça */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo da Peça <span className="text-red-500">*</span>
            </label>
            <select
              value={partType}
              onChange={(e) => handlePartTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            >
              <option value="">Selecione o tipo</option>
              {uniquePartTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Part Type (se "Outro" selecionado) */}
          {showCustomPartType && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Digite o Tipo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customPartType}
                onChange={(e) => setCustomPartType(e.target.value)}
                placeholder="Ex: Inversor, LED Strip, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
                required={partType === "Outro"}
              />
            </div>
          )}

          {/* Número de Série */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Número de Série
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Número de série da peça"
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
              placeholder="Observações adicionais sobre a peça"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
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
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
