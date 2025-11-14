export const formatDate = (date: Date | undefined | null): string => {
  if (!date) return 'N/A';
  
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  
  const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const dayName = days[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${dayName}. ${day}/${month}`;
};

export const formatTime = (date: Date | undefined | null): string => {
  if (!date) return 'N/A';
  
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Format date as DD/MM/YYYY
export const formatDateBR = (date: Date | string | undefined | null): string => {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(d.getTime())) return 'N/A';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Calculate warranty end date (adds months to a date)
export const addMonthsToDate = (date: Date | string | undefined | null, months: number): Date => {
  if (!date) return new Date();
  
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) return new Date();
  
  d.setMonth(d.getMonth() + months);
  return d;
};

// Calculate warranty end date string
export const calculateWarrantyEndDate = (startDate: string | Date | undefined | null, months: number = 3): string => {
  const endDate = addMonthsToDate(startDate, months);
  return endDate.toISOString();
};

// Check if warranty is still valid
export const isWarrantyValid = (warrantyEndDate: string | Date | undefined | null): boolean => {
  if (!warrantyEndDate) return false;
  
  const endDate = typeof warrantyEndDate === 'string' ? new Date(warrantyEndDate) : warrantyEndDate;
  if (isNaN(endDate.getTime())) return false;
  
  return new Date() < endDate;
};

// Get days remaining in warranty
export const getDaysRemainingInWarranty = (warrantyEndDate: string | Date | undefined | null): number => {
  if (!warrantyEndDate) return 0;
  
  const endDate = typeof warrantyEndDate === 'string' ? new Date(warrantyEndDate) : warrantyEndDate;
  if (isNaN(endDate.getTime())) return 0;
  
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};