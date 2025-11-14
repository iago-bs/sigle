import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { StockPart } from "../types";

interface EditStockPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (stockPart: StockPart) => void;
  stockPart: StockPart | null;
}

export function EditStockPartModal({ isOpen, onClose, onUpdate, stockPart }: EditStockPartModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [compatibleModels, setCompatibleModels] = useState<string[]>([""]);
  const [compatibleBrands, setCompatibleBrands] = useState<string[]>([""]);

  // Populate form when stockPart changes
  useEffect(() => {
    if (stockPart) {
      setName(stockPart.name);
      setDescription(stockPart.description || "");
      setQuantity(stockPart.quantity.toString());
      setLocation(stockPart.location || "");
      setNotes(stockPart.notes || "");
      setCompatibleModels(stockPart.compatibleModels.length > 0 ? stockPart.compatibleModels : [""]);
      setCompatibleBrands(stockPart.compatibleBrands && stockPart.compatibleBrands.length > 0 ? stockPart.compatibleBrands : [""]);
    }
  }, [stockPart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stockPart) return;
    
    // Validação
    if (!name.trim()) {
      alert("Por favor, preencha o nome da peça");
      return;
    }

    // Filtrar modelos e marcas vazios
    const filteredModels = compatibleModels.filter(m => m.trim() !== "");
    const filteredBrands = compatibleBrands.filter(b => b.trim() !== "");

    if (filteredModels.length === 0) {
      alert("Adicione pelo menos um modelo compatível");
      return;
    }

    const updatedStockPart: StockPart = {
      ...stockPart,
      name: name.trim(),
      description: description.trim() || undefined,
      compatibleModels: filteredModels,
      compatibleBrands: filteredBrands.length > 0 ? filteredBrands : undefined,
      quantity: parseInt(quantity) || 1,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onUpdate(updatedStockPart);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const addModelField = () => {
    setCompatibleModels([...compatibleModels, ""]);
  };

  const removeModelField = (index: number) => {
    if (compatibleModels.length > 1) {
      setCompatibleModels(compatibleModels.filter((_, i) => i !== index));
    }
  };

  const updateModel = (index: number, value: string) => {
    const newModels = [...compatibleModels];
    newModels[index] = value;
    setCompatibleModels(newModels);
  };

  const addBrandField = () => {
    setCompatibleBrands([...compatibleBrands, ""]);
  };

  const removeBrandField = (index: number) => {
    if (compatibleBrands.length > 1) {
      setCompatibleBrands(compatibleBrands.filter((_, i) => i !== index));
    }
  };

  const updateBrand = (index: number, value: string) => {
    const newBrands = [...compatibleBrands];
    newBrands[index] = value;
    setCompatibleBrands(newBrands);
  };

  if (!isOpen || !stockPart) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl">Editar Peça do Estoque</h2>
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
            <label className="block text-sm mb-1">
              Nome da Peça <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Placa UF50lg9, Tela LCD 32', Fonte 12V"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm mb-1">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição adicional da peça"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
            />
          </div>

          {/* Quantidade e Local */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
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
            <div>
              <label className="block text-sm mb-1">Local no Estoque</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Prateleira A3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
              />
            </div>
          </div>

          {/* Modelos Compatíveis */}
          <div>
            <label className="block text-sm mb-1">
              Modelos Compatíveis <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Digite os modelos de equipamentos que esta peça serve
            </p>
            <div className="space-y-2">
              {compatibleModels.map((model, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => updateModel(index, e.target.value)}
                    placeholder="Ex: UGLG9, LG50UN, Samsung 50"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
                  />
                  {compatibleModels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModelField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addModelField}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#8b7355] hover:bg-[#8b7355]/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Modelo
              </button>
            </div>
          </div>

          {/* Marcas Compatíveis (opcional) */}
          <div>
            <label className="block text-sm mb-1">Marcas Compatíveis (Opcional)</label>
            <p className="text-xs text-gray-500 mb-2">
              Se desejar, especifique as marcas compatíveis
            </p>
            <div className="space-y-2">
              {compatibleBrands.map((brand, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => updateBrand(index, e.target.value)}
                    placeholder="Ex: LG, Samsung, Sony"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355]"
                  />
                  {compatibleBrands.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBrandField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addBrandField}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#8b7355] hover:bg-[#8b7355]/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Marca
              </button>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm mb-1">Observações</label>
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
