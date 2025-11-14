import { useState, useEffect } from 'react';
import type { SystemVariable, VariableCategory } from '../types';
import { STORAGE_KEYS, defaultSystemVariables } from '../lib/constants';

export function useSystemVariables() {
  const [variables, setVariables] = useState<SystemVariable[]>([]);
  const [loading, setLoading] = useState(true);

  // Load variables from localStorage
  const loadVariables = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SYSTEM_VARIABLES);
      if (stored) {
        const parsedVariables = JSON.parse(stored) as SystemVariable[];
        setVariables(parsedVariables);
      } else {
        // Initialize with default variables if none exist
        initializeDefaultVariables();
      }
    } catch (error) {
      console.error('Error loading system variables:', error);
      initializeDefaultVariables();
    } finally {
      setLoading(false);
    }
  };

  // Initialize with default variables
  const initializeDefaultVariables = () => {
    const initialVariables: SystemVariable[] = [];
    
    // Add default part types
    defaultSystemVariables.part_types.forEach((value, index) => {
      initialVariables.push({
        id: `pt-${index}`,
        category: 'part_types',
        value,
        isDefault: true,
        createdAt: new Date().toISOString()
      });
    });

    // Add default device types
    defaultSystemVariables.device_types.forEach((value, index) => {
      initialVariables.push({
        id: `dt-${index}`,
        category: 'device_types',
        value,
        isDefault: true,
        createdAt: new Date().toISOString()
      });
    });

    // Add default brands
    defaultSystemVariables.brands.forEach((value, index) => {
      initialVariables.push({
        id: `br-${index}`,
        category: 'brands',
        value,
        isDefault: true,
        createdAt: new Date().toISOString()
      });
    });

    // Add default colors
    defaultSystemVariables.product_colors.forEach((value, index) => {
      initialVariables.push({
        id: `pc-${index}`,
        category: 'product_colors',
        value,
        isDefault: true,
        createdAt: new Date().toISOString()
      });
    });

    setVariables(initialVariables);
    saveVariables(initialVariables);
  };

  // Save variables to localStorage
  const saveVariables = (variablesToSave: SystemVariable[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_VARIABLES, JSON.stringify(variablesToSave));
    } catch (error) {
      console.error('Error saving system variables:', error);
    }
  };

  // Get variables by category
  const getVariablesByCategory = (category: VariableCategory): SystemVariable[] => {
    return variables.filter((variable: SystemVariable) => variable.category === category);
  };

  // Get variable values by category (for dropdowns)
  const getVariableValuesByCategory = (category: VariableCategory): string[] => {
    return variables
      .filter((variable: SystemVariable) => variable.category === category)
      .map((variable: SystemVariable) => variable.value)
      .sort();
  };

  // Add a new variable
  const addVariable = (category: VariableCategory, value: string): boolean => {
    // Check if variable already exists
    const exists = variables.some(
      (variable: SystemVariable) => variable.category === category && 
      variable.value.toLowerCase() === value.toLowerCase()
    );

    if (exists) {
      return false; // Variable already exists
    }

    const newVariable: SystemVariable = {
      id: `${category}-${Date.now()}`,
      category,
      value: value.trim(),
      isDefault: false,
      createdAt: new Date().toISOString()
    };

    const updatedVariables = [...variables, newVariable];
    setVariables(updatedVariables);
    saveVariables(updatedVariables);
    return true;
  };

  // Update a variable
  const updateVariable = (id: string, newValue: string): boolean => {
    const variable = variables.find((v: SystemVariable) => v.id === id);
    if (!variable) return false;

    // Check if new value already exists in the same category
    const exists = variables.some(
      (v: SystemVariable) => v.category === variable.category && 
      v.value.toLowerCase() === newValue.toLowerCase() && 
      v.id !== id
    );

    if (exists) {
      return false; // Value already exists
    }

    const updatedVariables = variables.map((v: SystemVariable) =>
      v.id === id ? { ...v, value: newValue.trim() } : v
    );

    setVariables(updatedVariables);
    saveVariables(updatedVariables);
    return true;
  };

  // Delete a variable
  const deleteVariable = (id: string): boolean => {
    const variable = variables.find((v: SystemVariable) => v.id === id);
    if (!variable) return false;

    // Prevent deletion of default variables (optional - you can remove this check)
    if (variable.isDefault) {
      return false;
    }

    const updatedVariables = variables.filter((v: SystemVariable) => v.id !== id);
    setVariables(updatedVariables);
    saveVariables(updatedVariables);
    return true;
  };

  // Reset to default variables
  const resetToDefaults = () => {
    setVariables([]);
    localStorage.removeItem(STORAGE_KEYS.SYSTEM_VARIABLES);
    initializeDefaultVariables();
  };

  // Load data on mount
  useEffect(() => {
    loadVariables();
  }, []);

  return {
    variables,
    loading,
    getVariablesByCategory,
    getVariableValuesByCategory,
    addVariable,
    updateVariable,
    deleteVariable,
    resetToDefaults,
    refresh: loadVariables
  };
}