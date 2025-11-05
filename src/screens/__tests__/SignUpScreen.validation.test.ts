import * as Yup from 'yup';

// SignUp validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
});

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

describe('SignUpScreen Validation', () => {
  describe('Email validation', () => {
    it('should validate correct email format', async () => {
      const validData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject invalid email format', async () => {
      const invalidData: SignUpFormValues = {
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Invalid email address',
      );
    });

    it('should reject empty email', async () => {
      const invalidData: SignUpFormValues = {
        email: '',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
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
        const data: SignUpFormValues = {
          email,
          password: 'password123',
          confirmPassword: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
        };
        await expect(validationSchema.validate(data)).resolves.toBeTruthy();
      }
    });
  });

  describe('Password validation', () => {
    it('should validate password with minimum 8 characters', async () => {
      const validData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject password shorter than 8 characters', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });

    it('should reject empty password', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: '',
        confirmPassword: '',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Please confirm your password',
      );
    });
  });

  describe('Confirm Password validation', () => {
    it('should validate matching passwords', async () => {
      const validData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject non-matching passwords', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Passwords must match',
      );
    });

    it('should reject empty confirm password', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: '',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Passwords must match',
      );
    });
  });

  describe('First Name validation', () => {
    it('should validate first name with minimum 2 characters', async () => {
      const validData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject first name shorter than 2 characters', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'J',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'First name must be at least 2 characters',
      );
    });

    it('should reject empty first name', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: '',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'First name must be at least 2 characters',
      );
    });
  });

  describe('Last Name validation', () => {
    it('should validate last name with minimum 2 characters', async () => {
      const validData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject last name shorter than 2 characters', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'D',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Last name must be at least 2 characters',
      );
    });

    it('should reject empty last name', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: '',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Last name must be at least 2 characters',
      );
    });
  });

  describe('Phone Number validation', () => {
    it('should validate 10-digit phone number', async () => {
      const validData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should reject phone number with less than 10 digits', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123456789',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Phone number must be 10 digits',
      );
    });

    it('should reject phone number with more than 10 digits', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '12345678901',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Phone number must be 10 digits',
      );
    });

    it('should reject phone number with non-numeric characters', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123456789a',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Phone number must be 10 digits',
      );
    });

    it('should reject empty phone number', async () => {
      const invalidData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '',
      };

      await expect(validationSchema.validate(invalidData)).rejects.toThrow(
        'Phone number must be 10 digits',
      );
    });
  });

  describe('Complete form validation', () => {
    it('should validate complete valid form', async () => {
      const validData: SignUpFormValues = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      await expect(validationSchema.validate(validData)).resolves.toEqual(
        validData,
      );
    });

    it('should reject form with multiple errors', async () => {
      const invalidData: SignUpFormValues = {
        email: 'invalid-email',
        password: 'short',
        confirmPassword: 'different',
        firstName: 'J',
        lastName: 'D',
        phoneNumber: '123',
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
