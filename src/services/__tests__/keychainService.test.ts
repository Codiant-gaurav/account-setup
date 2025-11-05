import * as Keychain from 'react-native-keychain';
import CryptoJS from 'react-native-crypto-js';
import {
  storeCredentialsInKeychain,
  getCredentialsFromKeychain,
  validateCredentials,
  getCredentialByEmail,
  createSession,
  getSession,
  clearSession,
  storeUserDataInKeychain,
  getUserDataFromKeychain,
  clearUserDataFromKeychain,
  Credential,
  Session,
} from '../keychainService';

// Mock the keychain module
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

// Mock crypto-js
jest.mock('react-native-crypto-js', () => {
  const actualCryptoJS = jest.requireActual('react-native-crypto-js');
  return {
    ...actualCryptoJS,
    AES: {
      encrypt: jest.fn((data: string, key: string) => ({
        toString: () => `encrypted_${data}`,
      })),
      decrypt: jest.fn((encryptedData: string, key: string) => ({
        toString: () => encryptedData.replace('encrypted_', ''),
      })),
    },
    enc: {
      Utf8: 'utf8',
    },
  };
});

describe('keychainService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeCredentialsInKeychain', () => {
    it('should store credentials successfully', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await storeCredentialsInKeychain(
        'test@example.com',
        'password123',
        'John',
        'Doe',
        '1234567890',
      );

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });

    it('should update existing credential with same email', async () => {
      const existingCredentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'oldpassword',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: JSON.stringify(existingCredentials),
      });
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await storeCredentialsInKeychain(
        'test@example.com',
        'newpassword',
        'Jane',
        'Smith',
        '0987654321',
      );

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );
      // Also mock setGenericPassword to fail
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await storeCredentialsInKeychain(
        'test@example.com',
        'password123',
        'John',
        'Doe',
        '1234567890',
      );

      expect(result).toBe(false);
    });
  });

  describe('getCredentialsFromKeychain', () => {
    it('should retrieve credentials successfully', async () => {
      const credentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(credentials),
      });

      const result = await getCredentialsFromKeychain();

      expect(result).toEqual(credentials);
    });

    it('should return empty array when no credentials exist', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);

      const result = await getCredentialsFromKeychain();

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await getCredentialsFromKeychain();

      expect(result).toEqual([]);
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', async () => {
      const credentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(credentials),
      });

      const result = await validateCredentials(
        'test@example.com',
        'password123',
      );

      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const credentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(credentials),
      });

      const result = await validateCredentials(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const credentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(credentials),
      });

      const result = await validateCredentials(
        'nonexistent@example.com',
        'password123',
      );

      expect(result).toBe(false);
    });

    it('should be case-insensitive for email', async () => {
      const credentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(credentials),
      });

      const result = await validateCredentials(
        'TEST@EXAMPLE.COM',
        'password123',
      );

      expect(result).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await validateCredentials(
        'test@example.com',
        'password123',
      );

      expect(result).toBe(false);
    });
  });

  describe('getCredentialByEmail', () => {
    it('should retrieve credential by email', async () => {
      const credentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(credentials),
      });

      const result = await getCredentialByEmail('test@example.com');

      expect(result).toEqual(credentials[0]);
    });

    it('should return null for non-existent email', async () => {
      const credentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(credentials),
      });

      const result = await getCredentialByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should be case-insensitive for email', async () => {
      const credentials: Credential[] = [
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        },
      ];

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(credentials),
      });

      const result = await getCredentialByEmail('TEST@EXAMPLE.COM');

      expect(result).toEqual(credentials[0]);
    });

    it('should handle errors gracefully', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await getCredentialByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createSession', () => {
    it('should create session successfully', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await createSession('test@example.com');

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });

    it('should normalize email to lowercase', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      await createSession('TEST@EXAMPLE.COM');

      expect(Keychain.setGenericPassword).toHaveBeenCalled();
      const callArgs = (Keychain.setGenericPassword as jest.Mock).mock.calls[0];
      const encryptedData = callArgs[1];
      const decryptedData = encryptedData.replace('encrypted_', '');
      const session = JSON.parse(decryptedData) as Session;

      expect(session.email).toBe('test@example.com');
    });

    it('should handle errors gracefully', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await createSession('test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should retrieve session successfully', async () => {
      const session: Session = {
        email: 'test@example.com',
        timestamp: Date.now(),
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(session),
      });

      const result = await getSession();

      expect(result).toEqual(session);
    });

    it('should return null when no session exists', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);

      const result = await getSession();

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await getSession();

      expect(result).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should clear session successfully', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await clearSession();

      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await clearSession();

      expect(result).toBe(false);
    });
  });

  describe('storeUserDataInKeychain', () => {
    it('should store user data successfully', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      const result = await storeUserDataInKeychain(userData);

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      const result = await storeUserDataInKeychain(userData);

      expect(result).toBe(false);
    });
  });

  describe('getUserDataFromKeychain', () => {
    it('should retrieve user data successfully', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(userData),
      });

      const result = await getUserDataFromKeychain();

      expect(result).toEqual(userData);
    });

    it('should return null when no user data exists', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);

      const result = await getUserDataFromKeychain();

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await getUserDataFromKeychain();

      expect(result).toBeNull();
    });
  });

  describe('clearUserDataFromKeychain', () => {
    it('should clear user data successfully', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await clearUserDataFromKeychain();

      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await clearUserDataFromKeychain();

      expect(result).toBe(false);
    });
  });
});
