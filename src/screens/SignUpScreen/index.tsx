import React, { useMemo, useRef, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../redux/hooks';
import { setUserData } from '../../slices/AuthenticationSlice';
import {
  storeCredentialsInKeychain,
  createSession,
} from '../../services/keychainService';

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

const SIGNUP_FORM_STORAGE_KEY = '@AccountSetup:signupFormData';

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

const SignUpScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const styles = useMemo(() => getStyles(insets), [insets]);

  // Refs for form inputs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);

  // State to hold initial form values (loaded from AsyncStorage)
  const [initialFormValues, setInitialFormValues] =
    React.useState<SignUpFormValues>({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    });

  // Load saved form data on mount
  useEffect(() => {
    const loadSavedFormData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(SIGNUP_FORM_STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData) as SignUpFormValues;
          setInitialFormValues(parsedData);
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    };

    loadSavedFormData();
  }, []);

  const formik = useFormik<SignUpFormValues>({
    enableReinitialize: true,
    initialValues: initialFormValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Store credentials (email, password, firstName, lastName, phoneNumber) in keychain
        const credentialsSuccess = await storeCredentialsInKeychain(
          values.email,
          values.password,
          values.firstName,
          values.lastName,
          values.phoneNumber,
        );
        if (!credentialsSuccess) {
          console.error('Failed to store credentials in keychain');
          setSubmitting(false);
          return;
        }

        // Create session
        const sessionSuccess = await createSession(values.email);
        if (!sessionSuccess) {
          console.error('Failed to create session');
          setSubmitting(false);
          return;
        }

        // Clear saved form data after successful submission
        await AsyncStorage.removeItem(SIGNUP_FORM_STORAGE_KEY);

        // Prepare user data for Redux (excluding password)
        const userData = {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
        };

        // Store in Redux
        dispatch(setUserData(userData));

        // Navigate to HomeScreen
        navigation.navigate('Home' as never);
      } catch (error) {
        console.error('Error during signup:', error);
        setSubmitting(false);
      }
    },
  });

  // Save form data to AsyncStorage when values change
  useEffect(() => {
    const saveFormData = async () => {
      try {
        const formData = {
          email: formik.values.email,
          password: formik.values.password,
          confirmPassword: formik.values.confirmPassword,
          firstName: formik.values.firstName,
          lastName: formik.values.lastName,
          phoneNumber: formik.values.phoneNumber,
        };
        await AsyncStorage.setItem(
          SIGNUP_FORM_STORAGE_KEY,
          JSON.stringify(formData),
        );
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };

    // Only save if at least one field has been filled
    const hasAnyValue =
      formik.values.email ||
      formik.values.password ||
      formik.values.confirmPassword ||
      formik.values.firstName ||
      formik.values.lastName ||
      formik.values.phoneNumber;

    if (hasAnyValue) {
      saveFormData();
    }
  }, [formik.values]);

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
          <Text style={styles.title}>Account setup</Text>

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
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            error={formik.errors.password}
            touched={formik.touched.password}
          />

          {/* Confirm Password */}
          <FormTextInput
            ref={confirmPasswordRef}
            placeholder="Confirm Password"
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            onBlur={formik.handleBlur('confirmPassword')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => firstNameRef.current?.focus()}
            error={formik.errors.confirmPassword}
            touched={formik.touched.confirmPassword}
          />

          {/* First Name */}
          <FormTextInput
            ref={firstNameRef}
            placeholder="First Name"
            value={formik.values.firstName}
            onChangeText={formik.handleChange('firstName')}
            onBlur={formik.handleBlur('firstName')}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
            error={formik.errors.firstName}
            touched={formik.touched.firstName}
          />

          {/* Last Name */}
          <FormTextInput
            ref={lastNameRef}
            placeholder="Last Name"
            value={formik.values.lastName}
            onChangeText={formik.handleChange('lastName')}
            onBlur={formik.handleBlur('lastName')}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => phoneNumberRef.current?.focus()}
            error={formik.errors.lastName}
            touched={formik.touched.lastName}
          />

          {/* Phone Number */}
          <FormTextInput
            ref={phoneNumberRef}
            placeholder="Phone Number"
            value={formik.values.phoneNumber}
            onChangeText={formik.handleChange('phoneNumber')}
            onBlur={formik.handleBlur('phoneNumber')}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={() => formik.handleSubmit()}
            error={formik.errors.phoneNumber}
            touched={formik.touched.phoneNumber}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!formik.isValid || formik.isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={() => formik.handleSubmit()}
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.loginButtonText}>
              Already registered? Sign in here
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
    submitButton: {
      backgroundColor: '#007AFF',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    submitButtonDisabled: {
      backgroundColor: '#cccccc',
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    loginButton: {
      alignItems: 'center',
      marginTop: 16,
      paddingVertical: 12,
    },
    loginButtonText: {
      color: '#007AFF',
      fontSize: 14,
    },
  });

export default SignUpScreen;
