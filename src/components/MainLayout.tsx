// Main layout component

import { useRef, useState } from "react";
import { DateTimeDisplay } from "./DateTimeDisplay";
import { AppointmentsSection } from "./AppointmentsSection";
import { SearchAndFilters, FilterOptions } from "./SearchAndFilters";
import { WeekViewSection } from "./WeekViewSection";
import { PartsSectionWrapper } from "./PartsSectionWrapper";
import { RightSidebar } from "./RightSidebar";
import type { Appointment, Part, Client, ServiceOrder, Technician } from "../types";
import type { AuthUser } from "../hooks/useAuth";
import { PART_TYPES, STORAGE_KEYS } from "../lib/constants";

interface MainLayoutProps {
  currentTime: Date;
  appointments: Appointment[];
  deliveryOrders: ServiceOrder[];
  serviceOrders?: ServiceOrder[]; // full list for global search
  parts: Part[];
  clients: Client[];
  currentUser?: AuthUser | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectServiceOrder?: (serviceOrder: ServiceOrder) => void;
  onMoveCard: (dragIndex: number, hoverIndex: number) => void;
  onToggleDelivered: (serviceOrder: ServiceOrder) => void;
  onAddClient: () => void;
  onAddAppointment: () => void;
  onAddPart: () => void;
  onNavigateToClients: () => void;
  onNavigateToPieces: () => void;
  onNavigateToParts: () => void;
  onNavigateToEquipments: () => void;
  onNavigateToVariables: () => void;
  onManageTechnicians: () => void;
  onLogout: () => void;
}

export function MainLayout({
  currentTime,
  appointments,
  deliveryOrders,
  serviceOrders,
  parts,
  clients,
  currentUser,
  searchQuery,
  onSearchChange,
  onSelectServiceOrder,
  onMoveCard,
  onToggleDelivered,
  onAddClient,
  onAddAppointment,
  onAddPart,
  onNavigateToClients,
  onNavigateToPieces,
  onNavigateToParts,
  onNavigateToEquipments,
  onNavigateToVariables,
  onManageTechnicians,
  onLogout,
}: MainLayoutProps) {
  const appointmentsScrollRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedPartType, setSelectedPartType] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const scrollToBottom = () => {
    if (appointmentsScrollRef.current) {
      appointmentsScrollRef.current.scrollTo({
        top: appointmentsScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // TODO: MIGRAÇÃO PARA BD - Substituir por chamadas à API
  // const partTypes = await fetch('/api/part-types').then(r => r.json());
  // const technicians = await fetch('/api/technicians').then(r => r.json());
  
  // Get technicians from localStorage
  // TODO: BD - Substituir por: const technicians = await db.technicians.findMany({ where: { active: true } })
  const technicians = JSON.parse(localStorage.getItem(STORAGE_KEYS.TECHNICIANS) || "[]");
  const technicianNames = technicians.map((t: Technician) => t.name);

  // Prepare filter options
  // TODO: BD - Carregar opções do banco de dados
  const filterOptions: FilterOptions = {
    partTypes: [...PART_TYPES],  // Lista fixa de tipos de peças (TVs e Projetores)
    technicians: technicianNames,  // TODO: BD - Carregar de: await db.technicians.findMany()
    statuses: ["Chegando", "À Encomendar"]  // TODO: BD - Enum ou tabela 'part_statuses'
  };

  // TODO: MIGRAÇÃO PARA BD - Filtros devem ser feitos no servidor
  // const filteredAppointments = await db.appointments.findMany({
  //   where: {
  //     OR: [
  //       { name: { contains: query, mode: 'insensitive' } },
  //       { service: { contains: query, mode: 'insensitive' } },
  //       { model: { contains: query, mode: 'insensitive' } }
  //     ]
  //   }
  // });
  
  // Filter appointments based on search
  const filteredAppointments = appointments.filter((appointment) => {
    const query = searchQuery.toLowerCase();
    return (
      appointment.name.toLowerCase().includes(query) ||
      appointment.service.toLowerCase().includes(query) ||
      appointment.model.toLowerCase().includes(query)
    );
  });

  // Filter delivery orders (service orders) based on search
  const filteredDeliveryOrders = deliveryOrders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.clientName?.toLowerCase().includes(query) ||
      order.client_name?.toLowerCase().includes(query) ||
      order.osNumber?.toLowerCase().includes(query) ||
      order.os_number?.toLowerCase().includes(query) ||
      order.device?.toLowerCase().includes(query) ||
      order.equipment_type?.toLowerCase().includes(query) ||
      order.brand?.toLowerCase().includes(query) ||
      order.equipment_brand?.toLowerCase().includes(query) ||
      order.model?.toLowerCase().includes(query) ||
      order.equipment_model?.toLowerCase().includes(query) ||
      order.defect?.toLowerCase().includes(query)
    );
  });

  // TODO: MIGRAÇÃO PARA BD - Filtros devem ser feitos no servidor com query params
  // const filteredParts = await db.parts.findMany({
  //   where: {
  //     AND: [
  //       query ? { OR: [{ name: { contains: query } }, { osNumber: { contains: query } }] } : {},
  //       partType ? { partType: { equals: partType } } : {},
  //       status ? { status: { equals: status } } : {},
  //       technician ? { technicianId: { equals: technician } } : {}
  //     ]
  //   }
  // });
  
  // Filter parts based on search AND filters
  const filteredParts = parts.filter((part) => {
    const query = searchQuery.toLowerCase();
    
    // Search filter
    const matchesSearch = 
      part.name.toLowerCase().includes(query) ||
      part.osNumber.toLowerCase().includes(query) ||
      part.osDescription.toLowerCase().includes(query);
    
    // Part type filter
    const matchesPartType = !selectedPartType || part.name === selectedPartType;
    
    // Status filter (map between UI labels and data values)
    // TODO: BD - Usar enum direto do banco: part.status === selectedStatus
    let matchesStatus = true;
    if (selectedStatus) {
      if (selectedStatus === "Chegando") {
        matchesStatus = part.status === "arriving";
      } else if (selectedStatus === "À Encomendar") {
        matchesStatus = part.status === "to-order";
      }
    }
    
    // TODO: BD - Adicionar campo technicianId em Part
    // const matchesTechnician = !selectedTechnician || part.technicianId === selectedTechnician;
    // Technician filter - would need to be added to Part type in the future
    // For now, we skip this filter for parts
    
    return matchesSearch && matchesPartType && matchesStatus;
  });

  // Global search results check
  const hasGlobalSearchResults = searchQuery.length > 0 && (
    filteredAppointments.length > 0 ||
    filteredDeliveryOrders.length > 0 ||
    filteredParts.length > 0 ||
    clients.some(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Build global O.S. matches list (from full serviceOrders if provided, else fallback to deliveryOrders)
  const osSource: ServiceOrder[] = (serviceOrders && serviceOrders.length > 0) ? serviceOrders : deliveryOrders;
  const osMatches = searchQuery
    ? osSource.filter((order) => {
        const q = searchQuery.toLowerCase();
        return (
          order.osNumber?.toLowerCase().includes(q) ||
          order.os_number?.toLowerCase().includes(q) ||
          order.id?.toLowerCase().includes(q) ||
          order.clientName?.toLowerCase().includes(q) ||
          order.client_name?.toLowerCase().includes(q) ||
          order.device?.toLowerCase().includes(q) ||
          order.equipment_type?.toLowerCase().includes(q) ||
          order.brand?.toLowerCase().includes(q) ||
          order.equipment_brand?.toLowerCase().includes(q) ||
          order.model?.toLowerCase().includes(q) ||
          order.equipment_model?.toLowerCase().includes(q)
        );
      })
      .slice(0, 8)
    : [];

  return (
    <>
      <div className="flex-1 p-4">
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="flex gap-3">
            {/* Left Section */}
            <div className="w-[280px] flex-shrink-0">
              <DateTimeDisplay 
                currentTime={currentTime}
              />
              <AppointmentsSection
                deliveryOrders={filteredDeliveryOrders}
                scrollRef={appointmentsScrollRef}
                onMoveCard={onMoveCard}
                onScrollToBottom={scrollToBottom}
                onToggleDelivered={onToggleDelivered}
              />
            </div>

            {/* Center Section */}
            <div className="flex-1 min-w-0">
              <SearchAndFilters
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                hasResults={hasGlobalSearchResults}
                filterOptions={filterOptions}
                selectedPartType={selectedPartType}
                selectedTechnician={selectedTechnician}
                selectedStatus={selectedStatus}
                onPartTypeChange={setSelectedPartType}
                onTechnicianChange={setSelectedTechnician}
                onStatusChange={setSelectedStatus}
              />
              {searchQuery && osMatches.length > 0 && (
                <div className="mt-2 bg-white border-2 border-black rounded-lg overflow-hidden shadow-sm">
                  <div className="px-3 py-2 bg-[#f5f0e8] text-xs font-semibold border-b-2 border-black">Resultados (O.S)</div>
                  <ul className="max-h-64 overflow-y-auto">
                    {osMatches.map((order) => {
                      const osNum = order.osNumber || order.os_number || order.id;
                      const client = order.clientName || order.client_name || "Cliente";
                      const device = `${order.device || order.equipment_type || "Aparelho"}`;
                      const brand = order.brand || order.equipment_brand || "";
                      const model = order.model || order.equipment_model || "";
                      return (
                        <li key={order.id}>
                          <button
                            className="w-full text-left px-3 py-2 hover:bg-[#8b7355]/10 border-b border-gray-200"
                            onClick={() => onSelectServiceOrder && onSelectServiceOrder(order)}
                          >
                            <div className="text-sm font-semibold">O.S #{osNum}</div>
                            <div className="text-xs text-gray-700">{client} — {device} {brand} {model}</div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <WeekViewSection 
                appointments={searchQuery ? filteredAppointments : appointments}
                onAddAppointment={onAddAppointment} 
              />
              <PartsSectionWrapper parts={filteredParts} onAddPart={onAddPart} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[200px] flex-shrink-0 h-screen">
        <RightSidebar
          currentUser={currentUser}
          onAddClient={onAddClient}
          onNavigateToClients={onNavigateToClients}
          onNavigateToPieces={onNavigateToPieces}
          onNavigateToParts={onNavigateToParts}
          onNavigateToEquipments={onNavigateToEquipments}
          onNavigateToVariables={onNavigateToVariables}
          onManageTechnicians={onManageTechnicians}
          onLogout={onLogout}
        />
      </div>
    </>
  );
}
