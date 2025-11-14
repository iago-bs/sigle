// Custom hook for localStorage with automatic persistence

import { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "../lib/storage";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => loadFromStorage(key, defaultValue));

  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
