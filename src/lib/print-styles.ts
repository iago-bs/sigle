/**
 * CSS INLINE PARA IMPRESSÃO EM ELECTRON
 * Este CSS é injetado no HTML enviado para o Electron para garantir
 * que todos os estilos sejam preservados na impressão/PDF
 */

export const PRINT_STYLES = `
<style>
  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
  }
  
  body { 
    font-family: monospace; 
    font-size: 12px; 
    padding: 10px; 
    background: white; 
  }
  
  /* ==================== TYPOGRAPHY ==================== */
  h1 { 
    font-size: 20px; 
    font-weight: bold; 
    margin-bottom: 4px; 
    text-transform: uppercase; 
  }
  
  h2 { 
    font-size: 14px; 
    font-weight: bold; 
    margin-bottom: 6px; 
  }
  
  p { 
    margin: 4px 0; 
  }
  
  .text-3xl { font-size: 22px; }
  .text-2xl { font-size: 18px; }
  .text-xl { font-size: 16px; }
  .text-lg { font-size: 14px; }
  .text-base { font-size: 12px; }
  .text-sm { font-size: 10px; }
  .text-xs { font-size: 9px; }
  .font-bold { font-weight: bold; }
  
  /* ==================== LAYOUT ==================== */
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
  /* Grid column spans commonly used */
  .col-span-1 { grid-column: span 1 / span 1; }
  .col-span-2 { grid-column: span 2 / span 2; }
  .col-span-3 { grid-column: span 3 / span 3; }
  .col-span-4 { grid-column: span 4 / span 4; }
  .col-span-5 { grid-column: span 5 / span 5; }
  .col-span-6 { grid-column: span 6 / span 6; }
  .col-span-7 { grid-column: span 7 / span 7; }
  .col-span-8 { grid-column: span 8 / span 8; }
  .col-span-9 { grid-column: span 9 / span 9; }
  .col-span-10 { grid-column: span 10 / span 10; }
  .col-span-11 { grid-column: span 11 / span 11; }
  .col-span-12 { grid-column: span 12 / span 12; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 6px; }
  .gap-4 { gap: 12px; }
  .gap-8 { gap: 20px; }
  .gap-12 { gap: 30px; }
  
  /* ==================== SPACING ==================== */
  /* Padding */
  .p-1 { padding: 2px; }
  .p-2 { padding: 4px; }
  .p-3 { padding: 8px; }
  .p-4 { padding: 10px; }
  .p-6 { padding: 14px; }
  .pb-2 { padding-bottom: 4px; }
  .pb-4 { padding-bottom: 10px; }
  .pt-2 { padding-top: 4px; }
  .pt-4 { padding-top: 10px; }
  .pt-6 { padding-top: 14px; }
  .px-3 { padding-left: 8px; padding-right: 8px; }
  .py-2 { padding-top: 4px; padding-bottom: 4px; }
  
  /* Margin */
  .mb-1 { margin-bottom: 2px; }
  .mb-2 { margin-bottom: 4px; }
  .mb-3 { margin-bottom: 8px; }
  .mb-4 { margin-bottom: 10px; }
  .mb-6 { margin-bottom: 12px; }
  .mt-1 { margin-top: 2px; }
  .mt-2 { margin-top: 4px; }
  .mt-3 { margin-top: 6px; }
  .mt-4 { margin-top: 8px; }
  .mt-8 { margin-top: 16px; }
  .mt-12 { margin-top: 24px; }
  
  /* Spacing utilities */
  .space-y-1 > * + * { margin-top: 2px; }
  .space-y-2 > * + * { margin-top: 6px; }
  
  /* ==================== BORDERS ==================== */
  .border { border: 1px solid black; }
  .border-2 { border: 2px solid black; }
  .border-4 { border: 4px solid black; }
  .border-b { border-bottom: 1px solid black; }
  .border-b-2 { border-bottom: 2px solid black; }
  .border-r-2 { border-right: 2px solid black; }
  .border-t { border-top: 1px solid black; }
  .border-t-2 { border-top: 2px solid black; }
  .border-black { border-color: black; }
  .border-gray-300 { border-color: #d1d5db; }
  .rounded-lg { border-radius: 8px; }
  
  /* ==================== COLORS ==================== */
  /* Backgrounds */
  .bg-white { background-color: white !important; }
  .bg-gray-50 { background-color: #fafafa !important; }
  .bg-gray-100 { background-color: #f3f4f6 !important; }
  .bg-gray-200 { background-color: #e5e7eb !important; }
  .bg-yellow-50 { background-color: #fffbf0 !important; }
  
  /* Text colors */
  .text-gray-500 { color: #6b7280; }
  .text-gray-600 { color: #4b5563; }
  .text-gray-700 { color: #374151; }
  .text-gray-900 { color: #111827; }
  
  /* ==================== TABLES ==================== */
  table { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 8px 0; 
  }
  
  thead { 
    background-color: #f3f4f6 !important; 
  }
  
  tfoot { 
    background-color: #f3f4f6 !important; 
    font-weight: bold; 
  }
  
  th, td { 
    border: 1px solid black; 
    padding: 6px; 
    text-align: left; 
    vertical-align: top; 
  }
  
  th { 
    font-weight: bold; 
  }
  
  /* ==================== LISTS ==================== */
  ul { 
    list-style-type: disc; 
    padding-left: 20px; 
  }
  
  li { 
    margin: 3px 0; 
  }
  
  .list-disc { 
    list-style-type: disc; 
  }
  
  .list-inside { 
    list-style-position: inside; 
  }
  
  /* ==================== WIDTHS ==================== */
  .w-20 { width: 50px; }
  .w-32 { width: 80px; }
  .w-full { width: 100%; }
  
  /* ==================== VISIBILITY ==================== */
  .hidden { display: none; }
  .no-print { display: none !important; }

  /* Support for Tailwind arbitrary-size classes used in receipt */
  .text-\[9px\] { font-size: 9px; }
  .text-\[10px\] { font-size: 10px; }
  .text-\[11px\] { font-size: 11px; }
  .text-\[12px\] { font-size: 12px; }

  /* Small paddings used in receipt labels */
  .px-1 { padding-left: 2px; padding-right: 2px; }
  .py-0\.5 { padding-top: 1px; padding-bottom: 1px; }
  .py-1 { padding-top: 2px; padding-bottom: 2px; }

  /* Ensure print colors are kept */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @page { size: A4; margin: 10mm; }
</style>
`;
