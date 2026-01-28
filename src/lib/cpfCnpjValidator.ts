/**
 * Valida CPF usando algoritmo de verificação de dígitos
 */
export function validateCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, "");
  
  if (cleanCpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf[9])) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf[10])) return false;
  
  return true;
}

/**
 * Valida CNPJ usando algoritmo de verificação de dígitos
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  
  if (cleanCnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;
  
  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCnpj[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCnpj[12])) return false;
  
  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCnpj[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleanCnpj[13])) return false;
  
  return true;
}

/**
 * Valida CPF ou CNPJ baseado no tamanho
 */
export function validateCpfCnpj(value: string): { valid: boolean; type: "cpf" | "cnpj" | null; message: string } {
  const cleanValue = value.replace(/\D/g, "");
  
  if (!cleanValue) {
    return { valid: false, type: null, message: "Informe o CPF ou CNPJ" };
  }
  
  if (cleanValue.length === 11) {
    if (validateCPF(cleanValue)) {
      return { valid: true, type: "cpf", message: "CPF válido" };
    }
    return { valid: false, type: "cpf", message: "CPF inválido" };
  }
  
  if (cleanValue.length === 14) {
    if (validateCNPJ(cleanValue)) {
      return { valid: true, type: "cnpj", message: "CNPJ válido" };
    }
    return { valid: false, type: "cnpj", message: "CNPJ inválido" };
  }
  
  if (cleanValue.length < 11) {
    return { valid: false, type: null, message: "CPF deve ter 11 dígitos" };
  }
  
  if (cleanValue.length > 11 && cleanValue.length < 14) {
    return { valid: false, type: null, message: "CNPJ deve ter 14 dígitos" };
  }
  
  return { valid: false, type: null, message: "Documento inválido" };
}

/**
 * Aplica máscara de CPF ou CNPJ
 */
export function maskCpfCnpj(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  
  if (cleanValue.length <= 11) {
    // Máscara CPF: 000.000.000-00
    return cleanValue
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  
  // Máscara CNPJ: 00.000.000/0000-00
  return cleanValue
    .substring(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
