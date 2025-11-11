import CryptoJS from 'crypto-js';

const SECRET_KEY = 'nova-bacabal-2025-secret-key';

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + SECRET_KEY).toString();
};

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};