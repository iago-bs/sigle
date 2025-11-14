// Parts section wrapper with add button

import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { PartsSection } from "./PartsSection";
import type { Part } from "../types";

interface PartsSectionWrapperProps {
  parts: Part[];
  onAddPart: () => void;
}

export function PartsSectionWrapper({ parts, onAddPart }: PartsSectionWrapperProps) {
  const arrivingParts = parts
    .filter(p => p.status === "arriving")
    .map(p => ({
      label: p.name,
      items: [`UN: ${p.unit || 'N/A'}`, `O.S: ${p.osNumber}`],
      urgent: p.urgent,
    }));

  const toOrderParts = parts
    .filter(p => p.status === "to-order")
    .map(p => ({
      label: p.name,
      items: [`UN: ${p.unit || 'N/A'}`, `O.S: ${p.osNumber}`],
      urgent: p.urgent,
    }));

  return (
    <div className="border-2 border-black rounded-lg p-3 bg-white mt-3 mb-6 max-h-[180px] overflow-y-auto">
      <div className="flex gap-4">
        <PartsSection title="PEÇAS À CHEGAR" items={arrivingParts} />
        <div className="w-px bg-black" />
        <PartsSection title="PEÇAS À PEDIR" items={toOrderParts} />
      </div>
      <div className="flex justify-end mt-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onAddPart}
                className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
