// Este componente não está mais em uso
// Mantido apenas para compatibilidade de cache

import * as React from "react";

export interface ComboboxProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  ({ options, value, onValueChange, placeholder, searchPlaceholder, emptyText, allowCustom }, ref) => {
    return null;
  }
);

Combobox.displayName = "Combobox";

