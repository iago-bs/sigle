// Week view section with select button

import { ChevronDown } from "lucide-react";
import { WeekView } from "./WeekView";
import { useState } from "react";
import type { Appointment } from "../../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface WeekViewSectionProps {
  appointments: Appointment[];
  onAddAppointment: () => void;
}

// Helper to get week range (Monday to Friday)
function getWeekRange(weeksOffset: number): { start: Date; end: Date; label: string } {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate offset to Monday of current week
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  // Get Monday of current week
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + mondayOffset);
  
  // Apply weeks offset
  const targetMonday = new Date(currentMonday);
  targetMonday.setDate(currentMonday.getDate() + (weeksOffset * 7));
  
  // Get Friday of that week
  const targetFriday = new Date(targetMonday);
  targetFriday.setDate(targetMonday.getDate() + 4);
  
  // Format label
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };
  
  const label = `${formatDate(targetMonday)} - ${formatDate(targetFriday)}`;
  
  return { start: targetMonday, end: targetFriday, label };
}

export function WeekViewSection({ appointments, onAddAppointment }: WeekViewSectionProps) {
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  
  // Generate week options: 2 weeks ago, current, 2 weeks ahead
  const weekOptions = [-2, -1, 0, 1, 2].map(offset => {
    const week = getWeekRange(offset);
    let description = "";
    
    if (offset === 0) {
      description = "Semana Atual";
    } else if (offset === -2) {
      description = "2 semanas atrás";
    } else if (offset === -1) {
      description = "Semana passada";
    } else if (offset === 1) {
      description = "Próxima semana";
    } else if (offset === 2) {
      description = "2 semanas à frente";
    }
    
    return {
      offset,
      label: week.label,
      description,
      start: week.start,
      end: week.end,
    };
  });
  
  const currentSelection = weekOptions.find(w => w.offset === selectedWeekOffset)!;

  return (
    <div className="mb-4">
      <div className="flex justify-end mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-1.5 bg-[#8b7355] text-white rounded-full text-xs flex items-center gap-2 hover:bg-[#7a6345] transition-colors">
              {currentSelection.label} {currentSelection.offset === 0 && "(Atual)"}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {weekOptions.map((week) => (
              <DropdownMenuItem
                key={week.offset}
                onClick={() => setSelectedWeekOffset(week.offset)}
                className={`cursor-pointer ${
                  week.offset === selectedWeekOffset 
                    ? "bg-[#8b7355]/10 font-semibold" 
                    : ""
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{week.label}</span>
                  <span className="text-xs text-gray-500">{week.description}</span>
                </div>
                {week.offset === selectedWeekOffset && (
                  <span className="ml-auto text-[#8b7355]">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <WeekView 
        appointments={appointments}
        onAddAppointment={onAddAppointment} 
        weekOffset={selectedWeekOffset} 
      />
    </div>
  );
}
