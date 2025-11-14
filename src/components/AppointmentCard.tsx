import { Check, X, MoreVertical, GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";

interface AppointmentCardProps {
  id: number;
  name: string;
  time: string;
  service: string;
  model: string;
  status: "confirmed" | "cancelled";
  statusMessage: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = "APPOINTMENT_CARD";

export function AppointmentCard({
  id,
  name,
  time,
  service,
  model,
  status,
  statusMessage,
  index,
  moveCard,
}: AppointmentCardProps) {
  const ref = useRef<HTMLDivElement>(null);

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
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`rounded-lg p-2.5 relative transition-opacity ${
        status === "confirmed" ? "bg-[#c8f0c8]" : "bg-[#ffc8d4]"
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <div 
            ref={drag}
            className="cursor-move text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          <div>
            <div className="text-xs">{name}</div>
            <div className="text-[10px]">{time}</div>
          </div>
        </div>
        <button className="text-black">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="text-[10px] ml-11">
        <div>{service}</div>
        <div>{model}</div>
        <div className={status === "cancelled" ? "text-red-700" : ""}>
          {statusMessage}
        </div>
      </div>
      <div className="absolute top-2.5 right-2.5">
        {status === "confirmed" ? (
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}