import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import type { Appointment } from "../../types";

interface WeekViewProps {
  appointments: Appointment[];
  onAddAppointment: () => void;
  weekOffset?: number; // Offset in weeks from current week (0 = current, -1 = last week, 1 = next week)
}

// Helper to get the dates for the week
function getWeekDates(weeksOffset: number = 0): Date[] {
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
  
  // Generate Monday to Friday
  const weekDates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(targetMonday);
    date.setDate(targetMonday.getDate() + i);
    weekDates.push(date);
  }
  
  return weekDates;
}

// Format date as YYYY-MM-DD for comparison
function formatDateYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Map appointment status to color
function getStatusColor(status: "waiting" | "in-progress" | "ready"): string {
  const colorMap = {
    "waiting": "#d4c5a0",      // Yellow/beige - Aguardando
    "in-progress": "#8b4513",  // Brown - Em andamento
    "ready": "#90ee90"         // Light green - Pronto
  };
  return colorMap[status];
}

// Get appointments for a specific date
function getAppointmentsForDate(appointments: Appointment[], date: Date): Appointment[] {
  const dateStr = formatDateYMD(date);
  return appointments.filter(apt => apt.date === dateStr);
}

// Build tooltip content for appointments
function buildTooltip(appointments: Appointment[]): string {
  if (appointments.length === 0) return "";
  
  return appointments
    .map(apt => `${apt.name} - ${apt.time}\n${apt.service} ${apt.model}`)
    .join("\n\n");
}

// Get primary color for the day (most urgent status)
function getPrimaryColor(appointments: Appointment[]): string {
  if (appointments.length === 0) return "#e5e5e5"; // Gray for no appointments
  
  // Priority: ready > in-progress > waiting
  if (appointments.some(apt => apt.status === "ready")) {
    return getStatusColor("ready");
  }
  if (appointments.some(apt => apt.status === "in-progress")) {
    return getStatusColor("in-progress");
  }
  return getStatusColor("waiting");
}

export function WeekView({ appointments, onAddAppointment, weekOffset = 0 }: WeekViewProps) {
  const weekDates = getWeekDates(weekOffset);
  
  const weekDays = [
    { label: "SEG", date: weekDates[0] },
    { label: "TER", date: weekDates[1] },
    { label: "QUA", date: weekDates[2] },
    { label: "QUI", date: weekDates[3] },
    { label: "SEX", date: weekDates[4] },
  ].map(day => {
    const dayAppointments = getAppointmentsForDate(appointments, day.date);
    return {
      ...day,
      appointments: dayAppointments,
      hasAppointments: dayAppointments.length > 0,
      color: getPrimaryColor(dayAppointments),
      tooltip: buildTooltip(dayAppointments)
    };
  });

  return (
    <div className="border-2 border-black rounded-lg p-4 bg-[#f5f0e8]">
      <div 
        className="text-center mb-6"
        style={{
          fontFamily: 'Lexend Zetta, sans-serif',
          fontSize: '22px',
          fontWeight: 400,
          letterSpacing: '0.5em'
        }}
      >
        SEMANA
      </div>
      <div className="border-b-2 border-black mb-3" />
      <div className="flex justify-around mb-4">
        <TooltipProvider>
          {weekDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <div className="text-[10px]">{day.label}</div>
              <div className="text-[8px] text-gray-600">
                {day.date.getDate().toString().padStart(2, '0')}
              </div>
              {/* Appointment indicator dot - color shows priority status */}
              {day.tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <div
                        className="w-3 h-3 rounded-full cursor-pointer hover:scale-[1.6] transition-transform"
                        style={{ backgroundColor: day.color }}
                      />
                      {/* Show count badge if multiple appointments */}
                      {day.appointments.length > 1 && (
                        <div 
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-black text-white flex items-center justify-center text-[8px]"
                          style={{ fontSize: '7px' }}
                        >
                          {day.appointments.length}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="whitespace-pre-line text-xs">{day.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: day.color }}
                />
              )}
            </div>
          ))}
        </TooltipProvider>
      </div>
      
      <div className="flex justify-end mb-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onAddAppointment}
                className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar Agendamento</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
