import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormTextInput from '../../components/FormTextInput';
import {
  validateCredentials,
  getCredentialByEmail,
  createSession,
} from '../../services/keychainService';
import { useAppDispatch } from '../../redux/hooks';
import { setUserData } from '../../slices/AuthenticationSlice';

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const styles = useMemo(() => getStyles(insets), [insets]);
  const [loginError, setLoginError] = useState<string>('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const MAX_FAILED_ATTEMPTS = 5;

  // Refs for form inputs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoginError('');

        // Check if user is locked out
        if (isLockedOut) {
          setLoginError(
            'You have been locked out due to multiple failed login attempts.',
          );
          setSubmitting(false);
          return;
        }

        // Validate credentials against stored credentials
        const isValid = await validateCredentials(
          values.email,
          values.password,
        );

        if (!isValid) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);

          if (newAttempts >= MAX_FAILED_ATTEMPTS) {
            setIsLockedOut(true);
            setLoginError(
              'You have been locked out due to multiple failed login attempts.',
            );
          } else {
            setLoginError(
              `Invalid email or password. ${
                MAX_FAILED_ATTEMPTS - newAttempts
              } attempt(s) remaining.`,
            );
          }
          setSubmitting(false);
          return;
        }

        // Reset failed attempts on successful login
        setFailedAttempts(0);
        setIsLockedOut(false);

        // Get credential data from "credentials" key in keychain
        const credential = await getCredentialByEmail(values.email);

        if (!credential) {
          setLoginError('User data not found');
          setSubmitting(false);
          return;
        }

        // Create session
        const sessionSuccess = await createSession(values.email);
        if (!sessionSuccess) {
          console.error('Failed to create session');
          setLoginError('Failed to create session');
          setSubmitting(false);
          return;
        }

        // Prepare user data for Redux (excluding password)
        const userData = {
          email: credential.email,
          firstName: credential.firstName,
          lastName: credential.lastName,
          phoneNumber: credential.phoneNumber,
        };

        // Set user data in Redux
        dispatch(setUserData(userData));

        // Navigate to Home Screen
        navigation.navigate('Home' as never);

        setSubmitting(false);
      } catch (error) {
        console.error('Error during login:', error);
        setLoginError('An error occurred during login. Please try again.');
        setSubmitting(false);
      }
    },
  });

  // Reset failed attempts when email changes
  useEffect(() => {
    setFailedAttempts(0);
    setIsLockedOut(false);
    setLoginError('');
  }, [formik.values.email]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Title */}
          <Text style={styles.title}>Account Sign In</Text>

          {/* Email Address */}
          <FormTextInput
            ref={emailRef}
            placeholder="Email Address"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={formik.errors.email}
            touched={formik.touched.email}
          />

          {/* Password */}
          <FormTextInput
            ref={passwordRef}
            placeholder="Password"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => formik.handleSubmit()}
            error={formik.errors.password}
            touched={formik.touched.password}
          />

          {/* Login Error Message */}
          {loginError ? (
            <Text style={styles.errorText}>{loginError}</Text>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (!formik.isValid || formik.isSubmitting || isLockedOut) &&
                styles.loginButtonDisabled,
            ]}
            onPress={() => formik.handleSubmit()}
            disabled={!formik.isValid || formik.isSubmitting || isLockedOut}
          >
            {formik.isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('SignUp' as never)}
          >
            <Text style={styles.registerButtonText}>
              No Account? Register here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      backgroundColor: '#ffffff',
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    formContainer: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#000000',
      marginBottom: 32,
      textAlign: 'center',
    },
    loginButton: {
      backgroundColor: '#007AFF',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    loginButtonDisabled: {
      backgroundColor: '#cccccc',
      opacity: 0.6,
    },
    loginButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    registerButton: {
      alignItems: 'center',
      marginTop: 16,
      paddingVertical: 12,
    },
    registerButtonText: {
      color: '#007AFF',
      fontSize: 14,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
    lockoutErrorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginTop: 12,
      textAlign: 'center',
      fontWeight: '600',
    },
  });

export default LoginScreen;
