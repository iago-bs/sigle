// Funções de validação e formatação

/**
 * Valida formato de e-mail
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true; // E-mail é opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro (formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false; // Telefone é obrigatório
  const cleanPhone = phone.replace(/\D/g, '');
  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular com 9)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

/**
 * Valida CPF brasileiro
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf) return true; // CPF é opcional
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length === 0) return '';
  
  if (cleanValue.length <= 2) {
    return `(${cleanValue}`;
  }
  
  if (cleanValue.length <= 6) {
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  }
  
  if (cleanValue.length <= 10) {
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 6)}-${cleanValue.slice(6)}`;
  }
  
  // Formato com 9 dígitos
  return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
}

/**
 * Formata CPF brasileiro
 */
export function formatCPF(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length === 0) return '';
  
  if (cleanValue.length <= 3) {
    return cleanValue;
  }
  
  if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  }
  
  if (cleanValue.length <= 9) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  }
  
  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
}

/**
 * Remove máscara de telefone
 */
export function unmaskPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Remove máscara de CPF
 */
export function unmaskCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 Mensagens de erro amigáveis
 */
export const validationMessages = {
  email: 'Digite um e-mail válido (exemplo: usuario@email.com)',
  phone: 'Digite um telefone válido com DDD (exemplo: (11) 99999-9999)',
  cpf: 'Digite um CPF válido (11 dígitos)',
};
