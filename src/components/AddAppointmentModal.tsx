import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useState } from "react";
import { Calendar, Wrench } from "lucide-react";
import type { Appointment, ServiceOrder } from "../types";

interface AddAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAppointment: (appointment: Appointment) => void;
}

export function AddAppointmentModal({ 
  open, 
  onOpenChange, 
  onAddAppointment
}: AddAppointmentModalProps) {
  const [formData, setFormData] = useState({
    osNumber: "",
    clientName: "",
    service: "",
    model: "",
    date: "",
    time: "",
    type: "",
    statusColor: "yellow"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointmentData = formData;
    
    const statusMap = {
      green: { status: "ready" as const, message: "Pronto para retirada" },
      yellow: { status: "waiting" as const, message: "Aguardando" },
      brown: { status: "in-progress" as const, message: "Em andamento" },
      red: { status: "waiting" as const, message: "Cancelado" }
    };

    const statusInfo = statusMap[appointmentData.statusColor as keyof typeof statusMap] || statusMap.yellow;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      name: appointmentData.clientName,
      date: appointmentData.date,
      time: appointmentData.time,
      service: appointmentData.service,
      model: appointmentData.model,
      status: statusInfo.status,
      statusMessage: statusInfo.message
    };

    onAddAppointment(newAppointment);
    
    // Reset form
    setFormData({
      osNumber: "",
      clientName: "",
      service: "",
      model: "",
      date: "",
      time: "",
      type: "",
      statusColor: "yellow"
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#8b7355]" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Agende um compromisso para um cliente
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Manual Fields */}
              <div className="space-y-2">
                <Label htmlFor="os">Número da O.S *</Label>
                <Input
                  id="os"
                  placeholder="Ex: 1009"
                  value={formData.osNumber}
                  onChange={(e) => setFormData({...formData, osNumber: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-name">Nome do Cliente *</Label>
                <Input
                  id="client-name"
                  placeholder="Ex: Maria Souza"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Serviço *</Label>
                  <Input
                    id="service"
                    placeholder="Ex: Reparo TV"
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    placeholder='Ex: Samsung 55"'
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
              </div>

          {/* Common Fields - Date, Time, Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-date">Data *</Label>
              <Input 
                id="appointment-date" 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment-time">Horário *</Label>
              <Input 
                id="appointment-time" 
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Serviço *</Label>
            <Select 
              value={formData.type}
              onValueChange={(value: string) => setFormData({...formData, type: value})}
              required
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reparo">Reparo</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Instalação">Instalação</SelectItem>
                <SelectItem value="Orçamento">Orçamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-color">Status do Agendamento</Label>
            <Select
              value={formData.statusColor}
              onValueChange={(value: string) => setFormData({...formData, statusColor: value})}
            >
              <SelectTrigger id="status-color">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yellow">Aguardando (Cinza)</SelectItem>
                <SelectItem value="brown">Em Progresso (Azul)</SelectItem>
                <SelectItem value="green">Pronto (Verde)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-[#8b7355] hover:bg-[#7a6345]">
              Agendar
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
