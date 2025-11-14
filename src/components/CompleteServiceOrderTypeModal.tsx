import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle, Ban, ArrowRight } from "lucide-react";
import type { ServiceOrder } from "../types";

interface CompleteServiceOrderTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrder: ServiceOrder | null;
  onSelectType: (type: "repaired" | "refused" | "no-repair") => void;
}

export function CompleteServiceOrderTypeModal({
  open,
  onOpenChange,
  serviceOrder,
  onSelectType
}: CompleteServiceOrderTypeModalProps) {
  if (!serviceOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Tipo de Conclusão
          </DialogTitle>
          <DialogDescription>
            O.S #{serviceOrder.osNumber || serviceOrder.id.slice(-4)} - {serviceOrder.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-6">
          <p className="text-sm text-gray-600 mb-4">
            Como você deseja finalizar esta ordem de serviço?
          </p>

          {/* Option 1: Cliente Autorizou (Repaired) */}
          <button
            onClick={() => onSelectType("repaired")}
            className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Cliente Autorizou</h3>
                <p className="text-sm text-gray-600">
                  Cliente aprovou o conserto - ir para orçamento
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </button>

          {/* Option 2: Cliente Não Autorizou (Refused) */}
          <button
            onClick={() => onSelectType("refused")}
            className="w-full p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Cliente Não Autorizou Conserto</h3>
                <p className="text-sm text-gray-600">
                  Cliente recusou o orçamento - O.S será inativada
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </div>
          </button>

          {/* Option 3: Não Tem Conserto (No Repair) */}
          <button
            onClick={() => onSelectType("no-repair")}
            className="w-full p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Não Tem Conserto</h3>
                <p className="text-sm text-gray-600">
                  Equipamento sem possibilidade de reparo - O.S será inativada
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
