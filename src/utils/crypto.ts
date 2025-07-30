import CryptoJS from 'crypto-js';

// Chave secreta para criptografia (em produção, use variável de ambiente)
const SECRET_KEY = 'nova-bacabal-2025-secret-key';

// Função para criar hash da senha
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + SECRET_KEY).toString();
};

// Função para verificar senha
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Função para criptografar dados sensíveis
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

// Função para descriptografar dados
export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};