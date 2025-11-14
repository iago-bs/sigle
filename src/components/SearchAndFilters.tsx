// Search bar and filter buttons component

import { Search, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { PART_TYPES } from "../lib/constants";

// TODO: MIGRAÇÃO PARA BD - Quando migrar para banco de dados estruturado:
// 1. partTypes virá de: await db.partTypes.findMany()
// 2. technicians virá de: await db.technicians.findMany()
// 3. statuses pode ser enum no BD ou tabela separada
export interface FilterOptions {
  partTypes: string[];  // TODO: BD - SELECT * FROM part_types
  technicians: string[];  // TODO: BD - SELECT name FROM technicians WHERE active = true
  statuses: string[];  // TODO: BD - Enum ou SELECT * FROM part_statuses
}

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasResults: boolean;
  filterOptions?: FilterOptions;
  selectedPartType?: string;
  selectedTechnician?: string;
  selectedStatus?: string;
  onPartTypeChange?: (type: string) => void;
  onTechnicianChange?: (technician: string) => void;
  onStatusChange?: (status: string) => void;
}

export function SearchAndFilters({ 
  searchQuery, 
  onSearchChange, 
  hasResults,
  filterOptions,
  selectedPartType,
  selectedTechnician,
  selectedStatus,
  onPartTypeChange,
  onTechnicianChange,
  onStatusChange,
}: SearchAndFiltersProps) {
  // Default filter options if not provided
  // TODO: MIGRAÇÃO PARA BD - Substituir PART_TYPES por chamada à API
  // const partTypes = await fetch('/api/part-types').then(r => r.json())
  const defaultFilterOptions: FilterOptions = {
    partTypes: [...PART_TYPES],  // Lista fixa de tipos de peças para TVs e Projetores
    technicians: [],  // TODO: BD - Carregar de: GET /api/technicians
    statuses: ["Chegando", "À Encomendar"]  // TODO: BD - Enum ou GET /api/part-statuses
  };

  const filters = filterOptions || defaultFilterOptions;

  // Get active filters count
  const activeFiltersCount = [selectedPartType, selectedTechnician, selectedStatus].filter(Boolean).length;

  const clearAllFilters = () => {
    if (onPartTypeChange) onPartTypeChange("");
    if (onTechnicianChange) onTechnicianChange("");
    if (onStatusChange) onStatusChange("");
  };

  return (
    <div className="mb-8">
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
        <input
          type="text"
          placeholder="Pesquisar por O.S, cliente, aparelho, peças..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-1.5 border-2 border-black rounded-full bg-white"
        />
        {searchQuery && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {hasResults ? "✓ Resultados encontrados" : "Nenhum resultado"}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 pl-3 items-center">
        {/* Tipo de Peça Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className={`border border-black rounded-full flex items-center justify-center gap-1 transition-colors ${
                selectedPartType 
                  ? "bg-[#8b7355] text-white hover:bg-[#7a6345]" 
                  : "bg-[#e8e4dc] hover:bg-[#d8d4cc]"
              }`}
              style={{ width: '110px', height: '30px', fontSize: '11px' }}
            >
              {selectedPartType || "Tipo de peça"}
              {selectedPartType ? (
                <X 
                  className="w-3 h-3" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPartTypeChange) onPartTypeChange("");
                  }}
                />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => onPartTypeChange && onPartTypeChange("")}
              className={`cursor-pointer ${!selectedPartType ? "bg-gray-100" : ""}`}
            >
              <span className="flex items-center gap-2">
                Todos os tipos
                {!selectedPartType && <span className="ml-auto text-[#8b7355]">✓</span>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {filters.partTypes.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => onPartTypeChange && onPartTypeChange(type)}
                className={`cursor-pointer ${selectedPartType === type ? "bg-[#8b7355]/10" : ""}`}
              >
                <span className="flex items-center gap-2">
                  {type}
                  {selectedPartType === type && <span className="ml-auto text-[#8b7355]">✓</span>}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Técnico Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className={`border border-black rounded-full flex items-center justify-center gap-1 transition-colors ${
                selectedTechnician 
                  ? "bg-[#8b7355] text-white hover:bg-[#7a6345]" 
                  : "bg-[#e8e4dc] hover:bg-[#d8d4cc]"
              }`}
              style={{ width: '110px', height: '30px', fontSize: '11px' }}
            >
              {selectedTechnician ? (
                selectedTechnician.length > 10 ? selectedTechnician.substring(0, 10) + "..." : selectedTechnician
              ) : (
                "Técnico"
              )}
              {selectedTechnician ? (
                <X 
                  className="w-3 h-3" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTechnicianChange) onTechnicianChange("");
                  }}
                />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => onTechnicianChange && onTechnicianChange("")}
              className={`cursor-pointer ${!selectedTechnician ? "bg-gray-100" : ""}`}
            >
              <span className="flex items-center gap-2">
                Todos os técnicos
                {!selectedTechnician && <span className="ml-auto text-[#8b7355]">✓</span>}
              </span>
            </DropdownMenuItem>
            {filters.technicians.length > 0 && <DropdownMenuSeparator />}
            {filters.technicians.length === 0 ? (
              <DropdownMenuItem disabled className="text-xs text-gray-500">
                Nenhum técnico cadastrado
              </DropdownMenuItem>
            ) : (
              filters.technicians.map((tech) => (
                <DropdownMenuItem
                  key={tech}
                  onClick={() => onTechnicianChange && onTechnicianChange(tech)}
                  className={`cursor-pointer ${selectedTechnician === tech ? "bg-[#8b7355]/10" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    {tech}
                    {selectedTechnician === tech && <span className="ml-auto text-[#8b7355]">✓</span>}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className={`border border-black rounded-full flex items-center justify-center gap-1 transition-colors ${
                selectedStatus 
                  ? "bg-[#8b7355] text-white hover:bg-[#7a6345]" 
                  : "bg-[#e8e4dc] hover:bg-[#d8d4cc]"
              }`}
              style={{ width: '110px', height: '30px', fontSize: '11px' }}
            >
              {selectedStatus || "Status"}
              {selectedStatus ? (
                <X 
                  className="w-3 h-3" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onStatusChange) onStatusChange("");
                  }}
                />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => onStatusChange && onStatusChange("")}
              className={`cursor-pointer ${!selectedStatus ? "bg-gray-100" : ""}`}
            >
              <span className="flex items-center gap-2">
                Todos os status
                {!selectedStatus && <span className="ml-auto text-[#8b7355]">✓</span>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {filters.statuses.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onStatusChange && onStatusChange(status)}
                className={`cursor-pointer ${selectedStatus === status ? "bg-[#8b7355]/10" : ""}`}
              >
                <span className="flex items-center gap-2">
                  {status === "Chegando" && "📦 "}
                  {status === "À Encomendar" && "🛒 "}
                  {status}
                  {selectedStatus === status && <span className="ml-auto text-[#8b7355]">✓</span>}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear All Filters Button */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-600 hover:text-gray-900 underline ml-2 transition-colors"
          >
            Limpar filtros ({activeFiltersCount})
          </button>
        )}
      </div>
    </div>
  );
}
