import { Check, X, Package, GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import { useRef, useState } from "react";
import type { ServiceOrder } from "../types";
import { Button } from "./ui/button";

interface ServiceOrderDeliveryCardProps {
  serviceOrder: ServiceOrder;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  onToggleDelivered: (serviceOrder: ServiceOrder) => void;
}

const ItemType = "DELIVERY_CARD";

export function ServiceOrderDeliveryCard({
  serviceOrder,
  index,
  moveCard,
  onToggleDelivered,
}: ServiceOrderDeliveryCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDelivered, setIsDelivered] = useState(serviceOrder.status === "completed");

  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: () => {
      return { id: serviceOrder.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  const handleToggle = () => {
    setIsDelivered(!isDelivered);
    onToggleDelivered(serviceOrder);
  };

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`rounded-lg p-2.5 relative transition-all ${
        isDelivered ? "bg-[#c8f0c8]" : "bg-[#fff3cd]"
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2 flex-1">
          {/* Drag handle */}
          <div 
            ref={drag}
            className="cursor-move text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
            <Package className="w-3 h-3" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs truncate">{serviceOrder.clientName}</div>
            <div className="text-[10px] text-gray-700">
              O.S #{serviceOrder.osNumber || serviceOrder.id.slice(-4)}
            </div>
          </div>
        </div>
        <button 
          onClick={handleToggle}
          className="flex-shrink-0 ml-2"
          title={isDelivered ? "Marcar como não entregue" : "Marcar como entregue"}
        >
          {isDelivered ? (
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      </div>
      <div className="text-[10px] ml-11 space-y-0.5">
        <div className="truncate">{serviceOrder.device} {serviceOrder.brand}</div>
        <div className="truncate text-gray-600">{serviceOrder.model}</div>
        <div className={`font-medium ${isDelivered ? "text-green-700" : "text-amber-700"}`}>
          {isDelivered ? "✓ Entregue ao cliente" : "⏰ Aguardando retirada"}
        </div>
      </div>
    </div>
  );
}
