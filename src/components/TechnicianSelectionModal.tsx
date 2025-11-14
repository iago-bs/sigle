import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Plus, LogIn } from "lucide-react";
import type { Technician } from "../types";

interface TechnicianSelectionModalProps {
  open: boolean;
  technicians: Technician[];
  onSelectTechnician: (technicianId: string) => void;
  onAddNewTechnician: (name: string, phone?: string) => void;
}

export function TechnicianSelectionModal({
  open,
  technicians,
  onSelectTechnician,
  onAddNewTechnician,
}: TechnicianSelectionModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTechName, setNewTechName] = useState("");
  const [newTechPhone, setNewTechPhone] = useState("");

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTechName.trim()) {
      onAddNewTechnician(newTechName.trim(), newTechPhone.trim() || undefined);
      setNewTechName("");
      setNewTechPhone("");
      setShowAddForm(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setNewTechName("");
    setNewTechPhone("");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Selecione o Técnico
          </DialogTitle>
          <DialogDescription>
            Quem está operando o sistema agora?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showAddForm ? (
            <>
              {/* Lista de técnicos existentes */}
              {technicians.length > 0 && (
                <div className="space-y-2">
                  <Label>Técnicos Cadastrados:</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {technicians.map((tech) => (
                      <button
                        key={tech.id}
                        onClick={() => onSelectTechnician(tech.id)}
                        className="w-full p-3 border rounded-lg hover:bg-[#8b7355]/10 hover:border-[#8b7355] transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#8b7355] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{tech.name}</p>
                            {tech.phone && (
                              <p className="text-sm text-gray-600">{tech.phone}</p>
                            )}
                          </div>
                          <LogIn className="w-5 h-5 text-gray-400 group-hover:text-[#8b7355]" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão para adicionar novo técnico */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Novo Técnico
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Formulário de novo técnico */}
              <form onSubmit={handleAddTechnician} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-tech-name">Nome do Técnico *</Label>
                  <Input
                    id="new-tech-name"
                    placeholder="Digite o nome..."
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-tech-phone">Telefone (opcional)</Label>
                  <Input
                    id="new-tech-phone"
                    placeholder="(00) 00000-0000"
                    value={newTechPhone}
                    onChange={(e) => setNewTechPhone(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#8b7355] hover:bg-[#7a6345]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar e Continuar
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

        {technicians.length === 0 && !showAddForm && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">Nenhum técnico cadastrado ainda.</p>
            <p className="text-sm mt-1">Adicione o primeiro técnico para continuar.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
