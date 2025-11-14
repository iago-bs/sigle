import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { formatDateBR } from "../lib/date-utils";
import type { ServiceOrder } from "../types";

interface DeliveryDateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrder: ServiceOrder | null;
  onSelectDate: (deliverToday: boolean, selectedDate?: Date) => void;
}

export function DeliveryDateSelectionModal({
  open,
  onOpenChange,
  serviceOrder,
  onSelectDate
}: DeliveryDateSelectionModalProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  if (!serviceOrder) return null;

  const handleDeliverToday = () => {
    onSelectDate(true);
    onOpenChange(false);
    setShowCalendar(false);
    setSelectedDate(undefined);
  };

  const handleSelectOtherDate = () => {
    setShowCalendar(true);
  };

  const handleConfirmDate = () => {
    if (selectedDate) {
      onSelectDate(false, selectedDate);
      onOpenChange(false);
      setShowCalendar(false);
      setSelectedDate(undefined);
    }
  };

  const handleCancel = () => {
    setShowCalendar(false);
    setSelectedDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#8b7355]" />
            Data de Entrega
          </DialogTitle>
          <DialogDescription>
            O.S #{serviceOrder.osNumber || serviceOrder.id.slice(-4)} - {serviceOrder.clientName}
          </DialogDescription>
        </DialogHeader>

        {!showCalendar ? (
          <div className="space-y-4 py-6">
            <p className="text-sm text-gray-600 mb-4">
              Quando o equipamento será entregue ao cliente?
            </p>

            {/* Option 1: Deliver Today */}
            <button
              onClick={handleDeliverToday}
              className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Entregar Hoje</h3>
                  <p className="text-sm text-gray-600">
                    {formatDateBR(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Select Other Date */}
            <button
              onClick={handleSelectOtherDate}
              className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Escolher Outra Data</h3>
                  <p className="text-sm text-gray-600">
                    Selecionar data no calendário
                  </p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-800">
                  <strong>Data selecionada:</strong> {formatDateBR(selectedDate.toISOString())}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmDate}
                disabled={!selectedDate}
                className="bg-[#8b7355] hover:bg-[#7a6345]"
              >
                Confirmar Data
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
