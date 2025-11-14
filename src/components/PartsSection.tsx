import { Plus } from "lucide-react";

interface PartsSectionProps {
  title: string;
  items: Array<{
    label: string;
    items: string[];
    urgent?: boolean; // Flag to mark urgent parts
  }>;
}

export function PartsSection({ title, items }: PartsSectionProps) {
  return (
    <div className="flex-1">
      <div 
        className="text-center mb-2"
        style={{
          fontFamily: 'Lexend Deca, sans-serif',
          fontSize: '12px',
          fontWeight: 400,
          letterSpacing: '0.5px'
        }}
      >
        {title}
      </div>
      {items.map((item, index) => (
        <div 
          key={index} 
          className={`mb-1.5 text-center ${item.urgent ? 'animate-pulse' : ''}`}
        >
          <div className={`text-xs ${item.urgent ? 'font-bold text-red-600' : 'opacity-60'}`}>
            {item.label} {item.urgent && '⚠️ URGENTE'}
          </div>
          {item.items.map((detail, i) => (
            <div
              key={i}
              className={`text-xs ${item.urgent ? "text-red-600" : ""}`}
            >
              {detail}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}