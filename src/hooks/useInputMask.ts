// Input mask utilities for formatting user input

export const formatCNPJ = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");
  
  // Apply CNPJ mask: XX.XXX.XXX/XXXX-XX
  return digits
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const formatPhone = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");
  
  // Apply phone mask: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  if (digits.length <= 10) {
    return digits
      .slice(0, 10)
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

export const formatBankAgency = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");
  
  // Apply agency mask: XXXX-X
  return digits.slice(0, 5).replace(/^(\d{4})(\d)/, "$1-$2");
};

export const formatBankAccount = (value: string): string => {
  // Remove all non-digits and hyphens for clean input
  const clean = value.replace(/[^\dXx-]/g, "");
  return clean;
};

export const formatBankCode = (value: string): string => {
  // Only allow 3 digits for bank code
  return value.replace(/\D/g, "").slice(0, 3);
};
