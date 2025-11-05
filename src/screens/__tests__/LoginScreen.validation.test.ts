import * as Yup from 'yup';

// Login validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

interface LoginFormValues {
  email: string;
  password: string;
}

describe('LoginScreen Validation', () => {
  describe('Email validation', () => {
    it('should validate correct email format', async () => {
      const validData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject invalid email format', async () => {
      const invalidData: LoginFormValues = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Invalid email address',
      );
    });

    it('should reject empty email', async () => {
      const invalidData: LoginFormValues = {
        email: '',
        password: 'password123',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Email address is required',
      );
    });

    it('should validate various email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@example-domain.com',
      ];

      for (const email of validEmails) {
        const data: LoginFormValues = {
          email,
          password: 'password123',
        };
        await expect(validationSchema.validate(data)).resolves.toBeTruthy();
      }
    });
  });

  describe('Password validation', () => {
    it('should validate password with minimum 8 characters', async () => {
      const validData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject password shorter than 8 characters', async () => {
      const invalidData: LoginFormValues = {
        email: 'test@example.com',
        password: 'short',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });

    it('should reject empty password', async () => {
      const invalidData: LoginFormValues = {
        email: 'test@example.com',
        password: '',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });

    it('should validate password with exactly 8 characters', async () => {
      const validData: LoginFormValues = {
        email: 'test@example.com',
        password: '12345678',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });
  });

  describe('Complete form validation', () => {
    it('should validate complete valid form', async () => {
      const validData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(validationSchema.validate(validData)).resolves.toEqual(
        validData,
      );
    });

    it('should reject form with both invalid email and password', async () => {
      const invalidData: LoginFormValues = {
        email: 'invalid-email',
        password: 'short',
      };

      try {
        await validationSchema.validate(invalidData);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
