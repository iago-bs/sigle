import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import type { Technician } from "../types";

interface FirstTimeSetupModalProps {
  open: boolean;
  onComplete: (technician: Technician) => void;
}

export function FirstTimeSetupModal({ open, onComplete }: FirstTimeSetupModalProps) {
  const [technicianName, setTechnicianName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!technicianName.trim()) return;
    
    const technician: Technician = {
      id: Date.now().toString(),
      name: technicianName.trim(),
    };
    
    onComplete(technician);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle>🎉 Bem-vindo ao Sistema de O.S!</DialogTitle>
          <DialogDescription>
            Para começar a usar o sistema, cadastre o primeiro técnico responsável pelas ordens de serviço.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="technician-name">Nome do Técnico *</Label>
            <Input
              id="technician-name"
              placeholder="Digite o nome do técnico..."
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            <p className="mb-1">💡 <strong>Dica:</strong></p>
            <p>Você poderá adicionar, editar ou remover técnicos depois através do botão de engrenagem ⚙️ na barra lateral direita.</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={!technicianName.trim()}>
              Começar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}