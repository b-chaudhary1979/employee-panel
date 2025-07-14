import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = "cyberclipperSecretKey123!";

/**
 * Decrypts a token using AES and parses the result.
 * @param {string} token
 * @returns {{ci: string|null, aid: string|null}}
 */
export function decryptToken(token) {
  try {
    const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const { ci, aid } = JSON.parse(decrypted);
    return { ci, aid };
  } catch {
    return { ci: null, aid: null };
  }
}

/**
 * Encrypts text using AES.
 * @param {string} text
 * @param {string} password
 * @returns {string}
 */
export function encryptKey(text, password) {
  return CryptoJS.AES.encrypt(text, password).toString();
}

/**
 * Decrypts AES-encrypted text.
 * @param {string} encryptedText
 * @param {string} password
 * @returns {string|null}
 */
export function decryptKey(encryptedText, password) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
}

/**
 * Formats the remaining lockout time as a string.
 * @param {Date|null} lockoutUntil
 * @returns {string}
 */
export function getRemainingLockoutTime(lockoutUntil) {
  if (!lockoutUntil) return "";
  const now = new Date();
  const diff = lockoutUntil - now;
  if (diff <= 0) return "";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
} 