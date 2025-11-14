// Appointments section with drag and drop - Modified to show deliveries

import { ChevronDown } from "lucide-react";
import { ServiceOrderDeliveryCard } from "../ordem-servico/ServiceOrderDeliveryCard";
import type { ServiceOrder } from "../../types";

interface AppointmentsSectionProps {
  deliveryOrders: ServiceOrder[];
  scrollRef: React.RefObject<HTMLDivElement>;
  onMoveCard: (dragIndex: number, hoverIndex: number) => void;
  onScrollToBottom: () => void;
  onToggleDelivered: (serviceOrder: ServiceOrder) => void;
}

export function AppointmentsSection({ 
  deliveryOrders, 
  scrollRef, 
  onMoveCard,
  onScrollToBottom,
  onToggleDelivered
}: AppointmentsSectionProps) {
  return (
    <div 
      className="rounded-[20px] p-3 flex flex-col" 
      style={{ 
        height: '350px',
        background: '#F4F2F2'
      }}
    >
      <h2 
        className="text-center mb-3"
        style={{
          color: '#000',
          fontFamily: 'Lexend Deca, sans-serif',
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: 'normal',
          margin: '0 auto 12px auto'
        }}
      >
        Entregas para hoje
      </h2>

      <div ref={scrollRef} className="space-y-2.5 flex-1 overflow-auto">
        {deliveryOrders.length > 0 ? (
          deliveryOrders.map((order, index) => (
            <ServiceOrderDeliveryCard
              key={order.id}
              serviceOrder={order}
              index={index}
              moveCard={onMoveCard}
              onToggleDelivered={onToggleDelivered}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm mt-4">
            Nenhuma entrega programada para hoje
          </div>
        )}
      </div>

      <div className="flex justify-center mt-2">
        <button 
          onClick={onScrollToBottom}
          className="text-black hover:opacity-70 transition-opacity"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
