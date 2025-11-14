import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import type { Technician } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

interface TechniciansManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technicians: Technician[];
  onAddTechnician: (technician: Technician) => void;
  onDeleteTechnician: (id: string) => void;
  onUpdateTechnician: (technician: Technician) => void;
}

export function TechniciansManagementModal({
  open,
  onOpenChange,
  technicians,
  onAddTechnician,
  onDeleteTechnician,
  onUpdateTechnician,
}: TechniciansManagementModalProps) {
  const [newTechnicianName, setNewTechnicianName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    technicianId: string;
    technicianName: string;
  }>({
    open: false,
    technicianId: "",
    technicianName: ""
  });

  const handleAdd = () => {
    if (!newTechnicianName.trim()) return;
    
    const newTechnician: Technician = {
      id: Date.now().toString(),
      name: newTechnicianName.trim(),
    };
    
    onAddTechnician(newTechnician);
    setNewTechnicianName("");
  };

  const handleStartEdit = (technician: Technician) => {
    setEditingId(technician.id);
    setEditingName(technician.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim() || !editingId) return;
    
    onUpdateTechnician({
      id: editingId,
      name: editingName.trim(),
    });
    
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Técnicos</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova técnicos do sistema. Cada O.S precisa ter um técnico responsável.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new technician */}
          <div className="space-y-2">
            <Label htmlFor="new-technician">Adicionar Novo Técnico</Label>
            <div className="flex gap-2">
              <Input
                id="new-technician"
                placeholder="Nome do técnico..."
                value={newTechnicianName}
                onChange={(e) => setNewTechnicianName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button onClick={handleAdd} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* List of technicians */}
          <div className="space-y-2">
            <Label>Técnicos Cadastrados</Label>
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {technicians.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Nenhum técnico cadastrado
                </div>
              ) : (
                <div className="divide-y">
                  {technicians.map((technician) => (
                    <div key={technician.id} className="p-3 flex items-center gap-2">
                      {editingId === technician.id ? (
                        <>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button onClick={handleSaveEdit} size="sm" variant="outline">
                            Salvar
                          </Button>
                          <Button onClick={handleCancelEdit} size="sm" variant="ghost">
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">{technician.name}</span>
                          <Button
                            onClick={() => handleStartEdit(technician)}
                            size="sm"
                            variant="ghost"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => {
                              setConfirmDialog({
                                open: true,
                                technicianId: technician.id,
                                technicianName: technician.name
                              });
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
      
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Excluir Técnico"
        description={`Tem certeza que deseja excluir o técnico "${confirmDialog.technicianName}"? Esta ação não pode ser desfeita.`}
        variant="danger"
        onConfirm={() => {
          onDeleteTechnician(confirmDialog.technicianId);
        }}
      />
    </Dialog>
  );
}