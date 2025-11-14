import { useSystemVariables } from './useSystemVariables';
import type { VariableCategory } from '../types';

/**
 * Hook para fornecer listas dinâmicas para dropdowns
 * Substitui as listas estáticas do constants.ts
 */
export function useDropdownOptions() {
  const { getVariableValuesByCategory } = useSystemVariables();

  return {
    // Tipos de peças para dropdowns
    partTypes: getVariableValuesByCategory('part_types'),
    
    // Tipos de equipamentos para dropdowns
    deviceTypes: getVariableValuesByCategory('device_types'),
    
    // Marcas para dropdowns
    brands: getVariableValuesByCategory('brands'),
    
    // Cores para dropdowns
    productColors: getVariableValuesByCategory('product_colors'),
    
    // Função helper para obter opções por categoria
    getOptionsByCategory: (category: VariableCategory) => 
      getVariableValuesByCategory(category)
  };
}