import * as Keychain from 'react-native-keychain';
import {
  validateCredentials,
  getCredentialByEmail,
  createSession,
  getSession,
  clearSession,
  Credential,
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

describe('Auth Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Credential Validation', () => {
    const mockCredentials: Credential[] = [
      {
        email: 'user1@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      },
      {
        email: 'user2@example.com',
        password: 'securepass456',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '0987654321',
      },
    ];

    beforeEach(() => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(mockCredentials),
      });
    });

    it('should validate existing user credentials', async () => {
      const result = await validateCredentials(
        'user1@example.com',
        'password123',
      );

      expect(result).toBe(true);
    });

    it('should reject wrong password for existing user', async () => {
      const result = await validateCredentials(
        'user1@example.com',
        'wrongpassword',
      );

      expect(result).toBe(false);
    });

    it('should reject credentials for non-existent user', async () => {
      const result = await validateCredentials(
        'nonexistent@example.com',
        'password123',
      );

      expect(result).toBe(false);
    });

    it('should be case-insensitive for email validation', async () => {
      const result1 = await validateCredentials(
        'USER1@EXAMPLE.COM',
        'password123',
      );
      const result2 = await validateCredentials(
        'User1@Example.Com',
        'password123',
      );

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should handle password case sensitivity correctly', async () => {
      const result = await validateCredentials(
        'user1@example.com',
        'PASSWORD123',
      );

      expect(result).toBe(false);
    });
  });

  describe('Get Credential by Email', () => {
    const mockCredentials: Credential[] = [
      {
        email: 'user1@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      },
    ];

    beforeEach(() => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: 'encrypted_' + JSON.stringify(mockCredentials),
      });
    });

    it('should retrieve credential for existing email', async () => {
      const result = await getCredentialByEmail('user1@example.com');

      expect(result).toEqual(mockCredentials[0]);
    });

    it('should return null for non-existent email', async () => {
      const result = await getCredentialByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should be case-insensitive when retrieving by email', async () => {
      const result = await getCredentialByEmail('USER1@EXAMPLE.COM');

      expect(result).toEqual(mockCredentials[0]);
    });
  });

  describe('Session Management', () => {
    describe('createSession', () => {
      it('should create a new session with email and timestamp', async () => {
        (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

        const result = await createSession('test@example.com');

        expect(result).toBe(true);
        expect(Keychain.setGenericPassword).toHaveBeenCalled();

        const callArgs = (Keychain.setGenericPassword as jest.Mock).mock
          .calls[0];
        const encryptedData = callArgs[1];
        const decryptedData = encryptedData.replace('encrypted_', '');
        const session = JSON.parse(decryptedData);

        expect(session.email).toBe('test@example.com');
        expect(session.timestamp).toBeGreaterThan(0);
        expect(typeof session.timestamp).toBe('number');
      });

      it('should normalize email to lowercase in session', async () => {
        (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

        await createSession('TEST@EXAMPLE.COM');

        const callArgs = (Keychain.setGenericPassword as jest.Mock).mock
          .calls[0];
        const encryptedData = callArgs[1];
        const decryptedData = encryptedData.replace('encrypted_', '');
        const session = JSON.parse(decryptedData);

        expect(session.email).toBe('test@example.com');
      });

      it('should handle errors when creating session', async () => {
        (Keychain.setGenericPassword as jest.Mock).mockRejectedValue(
          new Error('Storage error'),
        );

        const result = await createSession('test@example.com');

        expect(result).toBe(false);
      });
    });

    describe('getSession', () => {
      it('should retrieve existing session', async () => {
        const mockSession = {
          email: 'test@example.com',
          timestamp: Date.now(),
        };

        (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
          password: 'encrypted_' + JSON.stringify(mockSession),
        });

        const result = await getSession();

        expect(result).toEqual(mockSession);
      });

      it('should return null when no session exists', async () => {
        (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);

        const result = await getSession();

        expect(result).toBeNull();
      });

      it('should handle errors when retrieving session', async () => {
        (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
          new Error('Storage error'),
        );

        const result = await getSession();

        expect(result).toBeNull();
      });
    });

    describe('clearSession', () => {
      it('should clear existing session', async () => {
        (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

        const result = await clearSession();

        expect(result).toBe(true);
        expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      });

      it('should handle errors when clearing session', async () => {
        (Keychain.resetGenericPassword as jest.Mock).mockRejectedValue(
          new Error('Storage error'),
        );

        const result = await clearSession();

        expect(result).toBe(false);
      });
    });

    describe('Session Lifecycle', () => {
      it('should create, retrieve, and clear session', async () => {
        // Create session
        (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
        const createResult = await createSession('test@example.com');
        expect(createResult).toBe(true);

        // Retrieve session
        const mockSession = {
          email: 'test@example.com',
          timestamp: Date.now(),
        };
        (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
          password: 'encrypted_' + JSON.stringify(mockSession),
        });
        const getResult = await getSession();
        expect(getResult).toEqual(mockSession);

        // Clear session
        (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);
        const clearResult = await clearSession();
        expect(clearResult).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle keychain errors gracefully in validateCredentials', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await validateCredentials(
        'test@example.com',
        'password123',
      );

      expect(result).toBe(false);
    });

    it('should handle keychain errors gracefully in getCredentialByEmail', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await getCredentialByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });
});
