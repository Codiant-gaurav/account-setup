import * as Keychain from 'react-native-keychain';
import CryptoJS from 'react-native-crypto-js';
import { UserData } from '../slices/AuthenticationSlice';

const KEYCHAIN_SERVICE = 'AccountSetup';
const USER_DATA_KEY = 'userData';
const CREDENTIALS_KEY = 'credentials';
const SESSION_KEY = 'session';

// Encryption key - In production, this should be stored securely
// For now, using a constant key. Consider using a secure key management solution
const ENCRYPTION_KEY = 'AccountSetupSecretKey2024!';

export interface Credential {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface Session {
  email: string;
  timestamp: number;
}

/**
 * Encrypt user data using AES encryption
 */
const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt encrypted data using AES decryption
 */
const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Store user data securely in keychain
 * Data is encrypted before storing and automatically encrypted by react-native-keychain
 */
export const storeUserDataInKeychain = async (
  userData: UserData,
): Promise<boolean> => {
  try {
    const jsonData = JSON.stringify(userData);
    // Encrypt the data before storing
    const encryptedData = encryptData(jsonData);
    await Keychain.setGenericPassword(USER_DATA_KEY, encryptedData, {
      service: KEYCHAIN_SERVICE,
    });
    return true;
  } catch (error) {
    console.error('Error storing user data in keychain:', error);
    return false;
  }
};

/**
 * Retrieve user data from keychain
 * Data is decrypted after retrieval
 */
export const getUserDataFromKeychain = async (): Promise<UserData | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    if (credentials) {
      // Decrypt the data after retrieval
      const decryptedData = decryptData(credentials.password);
      const userData = JSON.parse(decryptedData);
      return userData as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user data from keychain:', error);
    return null;
  }
};

/**
 * Clear user data from keychain
 */
export const clearUserDataFromKeychain = async (): Promise<boolean> => {
  try {
    const result = await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    return result;
  } catch (error) {
    console.error('Error clearing user data from keychain:', error);
    return false;
  }
};

/**
 * Store credentials (email, password, firstName, lastName, phoneNumber) in keychain
 * Adds to existing list or creates new list if none exists
 */
export const storeCredentialsInKeychain = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
): Promise<boolean> => {
  try {
    // Get existing credentials
    const existingCredentials = await getCredentialsFromKeychain();

    // Check if email already exists, update credential if it does
    const credentialIndex = existingCredentials.findIndex(
      cred => cred.email.toLowerCase() === email.toLowerCase(),
    );

    const newCredential: Credential = {
      email: email.toLowerCase(),
      password: password,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
    };

    let updatedCredentials: Credential[];
    if (credentialIndex >= 0) {
      // Update existing credential
      updatedCredentials = [...existingCredentials];
      updatedCredentials[credentialIndex] = newCredential;
    } else {
      // Add new credential
      updatedCredentials = [...existingCredentials, newCredential];
    }

    // Encrypt and store the credentials array
    const jsonData = JSON.stringify(updatedCredentials);
    const encryptedData = encryptData(jsonData);

    await Keychain.setGenericPassword(CREDENTIALS_KEY, encryptedData, {
      service: `${KEYCHAIN_SERVICE}_${CREDENTIALS_KEY}`,
    });
    return true;
  } catch (error) {
    console.error('Error storing credentials in keychain:', error);
    return false;
  }
};

/**
 * Retrieve all credentials from keychain
 * Returns empty array if none exist
 */
export const getCredentialsFromKeychain = async (): Promise<Credential[]> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: `${KEYCHAIN_SERVICE}_${CREDENTIALS_KEY}`,
    });
    if (credentials) {
      // Decrypt the data after retrieval
      const decryptedData = decryptData(credentials.password);
      const credentialsList = JSON.parse(decryptedData);
      return credentialsList as Credential[];
    }
    return [];
  } catch (error) {
    console.error('Error retrieving credentials from keychain:', error);
    return [];
  }
};

/**
 * Validate credentials against stored credentials
 * Returns true if email and password match a stored credential
 */
export const validateCredentials = async (
  email: string,
  password: string,
): Promise<boolean> => {
  try {
    const credentials = await getCredentialsFromKeychain();
    const normalizedEmail = email.toLowerCase();

    const matchingCredential = credentials.find(
      cred =>
        cred.email.toLowerCase() === normalizedEmail &&
        cred.password === password,
    );

    return !!matchingCredential;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return false;
  }
};

/**
 * Get credential data for a specific email
 * Returns the credential object if found, null otherwise
 */
export const getCredentialByEmail = async (
  email: string,
): Promise<Credential | null> => {
  try {
    const credentials = await getCredentialsFromKeychain();
    const normalizedEmail = email.toLowerCase();

    const matchingCredential = credentials.find(
      cred => cred.email.toLowerCase() === normalizedEmail,
    );

    return matchingCredential || null;
  } catch (error) {
    console.error('Error getting credential by email:', error);
    return null;
  }
};

/**
 * Create a session for the logged-in user
 * Stores session data (email and timestamp) in keychain
 */
export const createSession = async (email: string): Promise<boolean> => {
  try {
    const session: Session = {
      email: email.toLowerCase(),
      timestamp: Date.now(),
    };

    const jsonData = JSON.stringify(session);
    const encryptedData = encryptData(jsonData);

    await Keychain.setGenericPassword(SESSION_KEY, encryptedData, {
      service: `${KEYCHAIN_SERVICE}_${SESSION_KEY}`,
    });
    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    return false;
  }
};

/**
 * Get current session from keychain
 * Returns session object if exists, null otherwise
 */
export const getSession = async (): Promise<Session | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: `${KEYCHAIN_SERVICE}_${SESSION_KEY}`,
    });
    if (credentials) {
      // Decrypt the data after retrieval
      const decryptedData = decryptData(credentials.password);
      const session = JSON.parse(decryptedData);
      return session as Session;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving session:', error);
    return null;
  }
};

/**
 * Clear session from keychain
 * Removes session data when user logs out
 */
export const clearSession = async (): Promise<boolean> => {
  try {
    const result = await Keychain.resetGenericPassword({
      service: `${KEYCHAIN_SERVICE}_${SESSION_KEY}`,
    });
    return result;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
};
